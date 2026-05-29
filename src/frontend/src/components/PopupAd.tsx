import { useLang } from "../contexts/LanguageContext";
import { ExternalLink, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Dynamic Ads & Monetization Settings ───────────────────────────────────────
export interface AdSettings {
  provider: "fallback" | "propeller" | "adsterra";
  propellerZoneId: string;
  adsterraPopunderUrl: string;
  adsterraSocialBarUrl: string;
  adsterraBannerKey728x90: string;
  adsterraBannerKey300x250: string;
  adsterraDirectLink: string;
}

const DEFAULT_AD_SETTINGS: AdSettings = {
  provider: "adsterra",
  propellerZoneId: import.meta.env.VITE_PROPELLER_ZONE_ID || "",
  adsterraPopunderUrl: "https://pl29569065.effectivecpmnetwork.com/04/19/39/0419399d345a19f16be5844b3e31e5c5.js",
  adsterraSocialBarUrl: "https://pl29569065.effectivecpmnetwork.com/04/19/39/0419399d345a19f16be5844b3e31e5c5.js",
  adsterraBannerKey728x90: import.meta.env.VITE_ADSTERRA_BANNER_KEY_728X90 || "",
  adsterraBannerKey300x250: import.meta.env.VITE_ADSTERRA_BANNER_KEY_300X250 || "",
  adsterraDirectLink: import.meta.env.VITE_ADSTERRA_DIRECT_LINK || "",
};

export function getAdSettings(): AdSettings {
  try {
    const saved = localStorage.getItem("knot_ad_settings");
    if (saved) {
      return { ...DEFAULT_AD_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to parse ad settings", e);
  }
  return DEFAULT_AD_SETTINGS;
}

export function saveAdSettings(settings: AdSettings) {
  try {
    localStorage.setItem("knot_ad_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("knot_ad_settings_changed"));
  } catch (e) {
    console.error("Failed to save ad settings", e);
  }
}

// ── Dynamic Script Injection ──────────────────────────────────────────────────
let propellerScriptInjected = false;
let adsterraPopunderInjected = false;
let adsterraSocialBarInjected = false;

export function injectAds() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const settings = getAdSettings();
  
  if (settings.provider === "propeller" && settings.propellerZoneId && !propellerScriptInjected) {
    propellerScriptInjected = true;
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = `//cdn.propellerads.com/zones/${settings.propellerZoneId}.js?t=${Math.floor(Math.random() * 100000)}`;
    s.setAttribute("data-zone", settings.propellerZoneId);
    (document.body || document.documentElement).appendChild(s);
  }
  
  if (settings.provider === "adsterra") {
    if (settings.adsterraPopunderUrl && !adsterraPopunderInjected) {
      let url = settings.adsterraPopunderUrl.trim();
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        url = srcMatch[1];
      }
      adsterraPopunderInjected = true;
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = url;
      (document.body || document.documentElement).appendChild(s);
    }
    
    if (settings.adsterraSocialBarUrl && !adsterraSocialBarInjected) {
      let url = settings.adsterraSocialBarUrl.trim();
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        url = srcMatch[1];
      }
      adsterraSocialBarInjected = true;
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = url;
      (document.body || document.documentElement).appendChild(s);
    }
  }
}

// ── Adsterra Banner Dynamic Component ──────────────────────────────────────────
export function AdsterraBanner({ keyId, width, height }: { keyId: string; width: number; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!keyId || !containerRef.current) return;
    
    // Clear any previous script elements
    containerRef.current.innerHTML = "";
    
    const containerId = `at-container-${keyId}`;
    const innerDiv = document.createElement("div");
    innerDiv.id = containerId;
    containerRef.current.appendChild(innerDiv);

    // Global configurations
    (window as any).atOptions = {
      key: keyId,
      format: "iframe",
      height: height,
      width: width,
      params: {},
    };

    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = `//www.highperformanceformat.com/${keyId}/invoke.js`;
    containerRef.current.appendChild(s);
    
    return () => {
      try {
        delete (window as any).atOptions;
      } catch {}
    };
  }, [keyId, width, height]);

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center items-center overflow-hidden mx-auto bg-gray-50/5 dark:bg-slate-950/20 backdrop-blur-sm rounded-xl py-1 shadow-inner border border-white/5"
      style={{ minHeight: height, minWidth: "100%" }}
    />
  );
}

// ── Fallback / Placeholder Ads (shown when Propeller Ads is not configured) ───

interface FallbackAd {
  id: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  emoji: string;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  tag: string;
}

const FALLBACK_ADS: FallbackAd[] = [
  {
    id: "ad_tools",
    title: "Pro Tools for Craftsmen",
    description:
      "Drills, saws, hammers & more — factory prices delivered to your door. Used by 50,000+ skilled workers.",
    cta: "Shop Tools →",
    url: "https://www.amazon.in/tools",
    emoji: "🔨",
    bgGradient: "linear-gradient(135deg, #1a3a5c 0%, #0f2035 100%)",
    accentColor: "#f59e0b",
    textColor: "#ffffff",
    tag: "Sponsored",
  },
  {
    id: "ad_training",
    title: "Free Skill Certification Videos",
    description: "Master advanced techniques. 200+ hours of free vocational training content from India's top craftsmen.",
    cta: "Start Learning Free →",
    url: "#",
    emoji: "🎓",
    bgGradient: "linear-gradient(135deg, #134e1e 0%, #052e0f 100%)",
    accentColor: "#4ade80",
    textColor: "#ffffff",
    tag: "Sponsored",
  },
  {
    id: "ad_insurance",
    title: "Worker Income Protection",
    description:
      "Special insurance plans for carpenters, tailors, plumbers & more. Low monthly premiums across India.",
    cta: "Get Covered Today →",
    url: "#",
    emoji: "🛡️",
    bgGradient: "linear-gradient(135deg, #3b1278 0%, #1e0850 100%)",
    accentColor: "#c084fc",
    textColor: "#ffffff",
    tag: "Sponsored",
  },
  {
    id: "ad_materials",
    title: "Raw Materials at Wholesale",
    description:
      "Wood, fabric, pipes, paint & more at factory prices. Free delivery on orders above ₹500.",
    cta: "Order Now →",
    url: "#",
    emoji: "🏭",
    bgGradient: "linear-gradient(135deg, #7c2000 0%, #3d0f00 100%)",
    accentColor: "#fb923c",
    textColor: "#ffffff",
    tag: "Sponsored",
  },
  {
    id: "ad_loan",
    title: "Business Loan for Workers",
    description:
      "Grow your craft business. Get up to ₹5 lakhs with minimal documentation. Quick approval.",
    cta: "Apply for Loan →",
    url: "#",
    emoji: "💰",
    bgGradient: "linear-gradient(135deg, #1a4a2e 0%, #0b2416 100%)",
    accentColor: "#34d399",
    textColor: "#ffffff",
    tag: "Sponsored",
  },
];

export function BannerAd({ className = "" }: { className?: string }) {
  const { t } = useLang();
  const [settings, setSettings] = useState(getAdSettings());
  const [adIndex] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length));
  
  useEffect(() => {
    injectAds();
    const handleChanged = () => {
      setSettings(getAdSettings());
    };
    window.addEventListener("knot_ad_settings_changed", handleChanged);
    return () => {
      window.removeEventListener("knot_ad_settings_changed", handleChanged);
    };
  }, []);

  const baseAd = FALLBACK_ADS[adIndex];
  const ad = {
    ...baseAd,
    title: baseAd.id === "ad_training" ? t("ad_title") : (baseAd.id === "ad_materials" ? t("ad_materials_title") : (baseAd.id === "ad_tools" ? t("ad_tools_title") : (baseAd.id === "ad_insurance" ? t("ad_insurance_title") : (baseAd.id === "ad_loan" ? t("ad_loan_title") : baseAd.title)))),
    description: baseAd.id === "ad_training" ? t("ad_desc") : (baseAd.id === "ad_materials" ? t("ad_materials_desc") : (baseAd.id === "ad_tools" ? t("ad_tools_desc") : (baseAd.id === "ad_insurance" ? t("ad_insurance_desc") : (baseAd.id === "ad_loan" ? t("ad_loan_desc") : baseAd.description)))),
    cta: baseAd.id === "ad_training" ? t("ad_btn") : (baseAd.id === "ad_materials" ? t("ad_materials_cta") : (baseAd.id === "ad_tools" ? t("ad_tools_cta") : (baseAd.id === "ad_insurance" ? t("ad_insurance_cta") : (baseAd.id === "ad_loan" ? t("ad_loan_cta") : baseAd.cta)))),
    tag: t("ad_sponsored")
  };

  const isPropeller = settings.provider === "propeller";
  const isAdsterra = settings.provider === "adsterra";
  const hasAdsterraBanner = isAdsterra && settings.adsterraBannerKey728x90;
  
  // High payouts for Direct Link
  const clickUrl = (isAdsterra && settings.adsterraDirectLink) 
    ? settings.adsterraDirectLink 
    : ad.url;

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-md border border-white/10 ${className}`}
      data-ocid="banner_ad.card"
    >
      {isPropeller && settings.propellerZoneId ? (
        <div className="min-h-[90px] bg-slate-900 flex items-center justify-center">
          <p className="text-gray-400 text-xs font-body">Advertisement</p>
        </div>
      ) : hasAdsterraBanner ? (
        <AdsterraBanner keyId={settings.adsterraBannerKey728x90} width={728} height={90} />
      ) : (
        <a
          href={clickUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (clickUrl === "#") e.preventDefault();
          }}
          className="block no-underline"
          data-ocid="banner_ad.link"
        >
          <div
            className="px-5 py-4 flex items-center gap-4 cursor-pointer group transition-opacity hover:opacity-95"
            style={{ background: ad.bgGradient }}
          >
            <span className="text-4xl select-none drop-shadow-lg">
              {ad.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: ad.accentColor,
                    border: `1px solid ${ad.accentColor}40`,
                  }}
                >
                  {ad.tag}
                </span>
                <p className="font-display font-bold text-white text-sm truncate">
                  {ad.title}
                </p>
              </div>
              <p className="font-body text-white/65 text-xs leading-snug line-clamp-1">
                {ad.description}
              </p>
            </div>
            <div
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body font-bold transition-all group-hover:opacity-90 whitespace-nowrap"
              style={{ background: ad.accentColor, color: "#000" }}
              data-ocid="banner_ad.cta_button"
            >
              {ad.cta}
            </div>
          </div>
          <div className="px-3 py-1 bg-black/50 text-center">
            <p className="font-body text-[9px] text-white/40 tracking-wide">
              {isAdsterra ? "Adsterra Sponsored Partner Card" : t("ad_demo_banner")}
            </p>
          </div>
        </a>
      )}
    </div>
  );
}

// ── Popup Ad (bottom-right, appears after 8s) ────────────────────────────────

export function PopupAd() {
  const { t } = useLang();
  const [settings, setSettings] = useState(getAdSettings());
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [adIndex] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length));
  
  useEffect(() => {
    injectAds();
    const handleChanged = () => {
      setSettings(getAdSettings());
    };
    window.addEventListener("knot_ad_settings_changed", handleChanged);
    return () => {
      window.removeEventListener("knot_ad_settings_changed", handleChanged);
    };
  }, []);

  const baseAd = FALLBACK_ADS[adIndex];
  const ad = {
    ...baseAd,
    title: baseAd.id === "ad_training" ? t("ad_title") : (baseAd.id === "ad_materials" ? t("ad_materials_title") : (baseAd.id === "ad_tools" ? t("ad_tools_title") : (baseAd.id === "ad_insurance" ? t("ad_insurance_title") : (baseAd.id === "ad_loan" ? t("ad_loan_title") : baseAd.title)))),
    description: baseAd.id === "ad_training" ? t("ad_desc") : (baseAd.id === "ad_materials" ? t("ad_materials_desc") : (baseAd.id === "ad_tools" ? t("ad_tools_desc") : (baseAd.id === "ad_insurance" ? t("ad_insurance_desc") : (baseAd.id === "ad_loan" ? t("ad_loan_desc") : baseAd.description)))),
    cta: baseAd.id === "ad_training" ? t("ad_btn") : (baseAd.id === "ad_materials" ? t("ad_materials_cta") : (baseAd.id === "ad_tools" ? t("ad_tools_cta") : (baseAd.id === "ad_insurance" ? t("ad_insurance_cta") : (baseAd.id === "ad_loan" ? t("ad_loan_cta") : baseAd.cta)))),
    tag: t("ad_sponsored")
  };

  // Show after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissed) setVisible(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // Re-show every 2 minutes
  useEffect(() => {
    if (dismissed) {
      const timer = setTimeout(
        () => {
          setDismissed(false);
        },
        2 * 60 * 1000,
      );
      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
  }

  const isPropeller = settings.provider === "propeller";
  const isAdsterra = settings.provider === "adsterra";
  const hasAdsterraBanner300 = isAdsterra && settings.adsterraBannerKey300x250;
  
  // High payouts for Direct Link
  const clickUrl = (isAdsterra && settings.adsterraDirectLink) 
    ? settings.adsterraDirectLink 
    : ad.url;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="popup-ad"
          initial={{ opacity: 0, scale: 0.88, y: 48 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 48 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 w-[320px] rounded-2xl overflow-hidden shadow-2xl"
          data-ocid="popup_ad.modal"
        >
          {hasAdsterraBanner300 ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest bg-white/10 text-amber-400 border border-amber-400/30">
                  {ad.tag}
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  data-ocid="popup_ad.close_button"
                >
                  <X className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
              <div className="flex justify-center items-center">
                <AdsterraBanner keyId={settings.adsterraBannerKey300x250} width={300} height={250} />
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden border border-white/10"
              style={{ background: ad.bgGradient }}
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: ad.accentColor,
                    border: `1px solid ${ad.accentColor}40`,
                  }}
                >
                  {ad.tag}
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  data-ocid="popup_ad.close_button"
                >
                  <X className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 pb-5 flex flex-col items-center text-center gap-3">
                <span className="text-6xl select-none drop-shadow-xl">
                  {ad.emoji}
                </span>
                <div>
                  <h3 className="font-display font-bold text-white text-lg mb-1.5">
                    {ad.title}
                  </h3>
                  <p className="font-body text-white/65 text-sm leading-relaxed">
                    {ad.description}
                  </p>
                </div>
                <a
                  href={clickUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (clickUrl === "#") {
                      e.preventDefault();
                    } else {
                      handleDismiss();
                    }
                  }}
                  className="w-full py-3 rounded-xl text-sm font-body font-bold text-center transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ background: ad.accentColor, color: "#000" }}
                  data-ocid="popup_ad.cta_button"
                >
                  {ad.cta}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="font-body text-xs text-white/35 hover:text-white/55 transition-colors"
                  data-ocid="popup_ad.dismiss_button"
                >{t("ad_close")}</button>
                {settings.provider === "fallback" && (
                  <p className="font-body text-[9px] text-white/25 tracking-wide">{t("ad_demo")}</p>
                )}
                {isAdsterra && (
                  <p className="font-body text-[9px] text-white/25 tracking-wide">Adsterra Sponsored Partner Card</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FloatingStickyAd() {
  const { t } = useLang();
  const [settings, setSettings] = useState(getAdSettings());
  const [visible, setVisible] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleChanged = () => {
      setSettings(getAdSettings());
    };
    window.addEventListener("knot_ad_settings_changed", handleChanged);
    
    // Auto-refresh ads every 35 seconds to multiply views automatically!
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 35 * 1000);

    return () => {
      window.removeEventListener("knot_ad_settings_changed", handleChanged);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  const isAdsterra = settings.provider === "adsterra";
  const hasBannerKey = isAdsterra && settings.adsterraBannerKey728x90;

  // If no banner is configured, we can show a sleek micro fallback banner card
  // that redirects to their direct link to maximize passive clicks!
  const clickUrl = (isAdsterra && settings.adsterraDirectLink) 
    ? settings.adsterraDirectLink 
    : "https://www.amazon.in/tools";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border py-1 px-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-2 max-h-[110px] overflow-hidden animate-slide-up">
      {/* Micro-label & close button */}
      <div className="flex items-center justify-between w-full md:w-auto gap-3">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-widest border border-border">
          {t("ad_sponsored") || "Sponsored"}
        </span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-muted-foreground hover:text-foreground p-1 text-xs font-semibold rounded hover:bg-muted transition-colors md:hidden"
        >
          ✕
        </button>
      </div>

      {/* Main Banner Container */}
      <div className="flex-1 flex justify-center items-center w-full overflow-hidden" key={refreshKey}>
        {hasBannerKey ? (
          <AdsterraBanner keyId={settings.adsterraBannerKey728x90} width={468} height={60} />
        ) : (
          <a
            href={clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-muted/50 hover:bg-muted py-1.5 px-4 rounded-xl max-w-lg w-full transition-colors no-underline border border-border/40"
          >
            <span className="text-xl">🛠️</span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-xs text-foreground truncate">
                Get Certified Craftsman Services Near You
              </p>
              <p className="font-body text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                Connecting trusted carpenters, plumbers, and vocational skills.
              </p>
            </div>
            <span className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-semibold py-1 px-2.5 rounded-lg transition-colors">
              Find Services →
            </span>
          </a>
        )}
      </div>

      {/* Close button for desktop */}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="hidden md:flex text-muted-foreground hover:text-foreground p-1.5 text-xs font-semibold rounded hover:bg-muted transition-colors shrink-0"
        title="Dismiss ad"
      >
        ✕ Close Ad
      </button>
    </div>
  );
}
