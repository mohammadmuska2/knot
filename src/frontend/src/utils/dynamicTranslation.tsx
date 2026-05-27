import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LanguageContext';

// In-memory cache to prevent redundant sessionStorage hits and duplicate requests
const translationCache: Record<string, string> = {};

/**
 * Hook to dynamically translate any arbitrary text string using Google Translate API.
 * Uses sessionStorage for persistent caching to keep it lightning fast.
 */
export function useDynamicTranslation(text: string | undefined | null): string {
  const { lang } = useLang();
  const [translated, setTranslated] = useState(text || "");

  useEffect(() => {
    if (!text) {
      setTranslated("");
      return;
    }
    
    // If it's English, just use the original text
    if (lang === "en") {
      setTranslated(text);
      return;
    }

    const cacheKey = `${lang}_${text}`;
    
    // Check in-memory cache first
    if (translationCache[cacheKey]) {
      setTranslated(translationCache[cacheKey]);
      return;
    }

    // Check sessionStorage
    try {
      const stored = sessionStorage.getItem(`trans_${cacheKey}`);
      if (stored) {
        translationCache[cacheKey] = stored;
        setTranslated(stored);
        return;
      }
    } catch(e) {}

    // Set original text while loading
    setTranslated(text);

    // Fetch from free Google Translate API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          const result = data[0][0][0];
          translationCache[cacheKey] = result;
          try {
             sessionStorage.setItem(`trans_${cacheKey}`, result);
          } catch(e) {}
          // Only update state if it actually changed to prevent flash
          setTranslated(result);
        }
      })
      .catch(err => {
        console.error("Translation API failed", err);
      });
  }, [text, lang]);

  return translated;
}

/**
 * Convenient wrapper component for simple text nodes.
 */
export function DynamicText({ text, className }: { text: string; className?: string }) {
  const translated = useDynamicTranslation(text);
  if (className) {
    return <span className={className}>{translated}</span>;
  }
  return <>{translated}</>;
}
