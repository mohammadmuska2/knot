import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, Play, Star, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { User } from "../backend.d.ts";
import {
  getBadgeConfig,
  getSkillEmoji,
  getSkillThumbClass,
  getTranslatedSkillName,
} from "../utils/helpers";
import { useLang } from "../contexts/LanguageContext";
import { getVideoObjectURLWithFallback } from "../utils/videoDB";
import { DynamicText } from "../utils/dynamicTranslation";

interface UserCardProps {
  user: User;
  index?: number;
}

export function UserCard({ user, index = 0 }: UserCardProps) {
  const { t } = useLang();
  const badge = getBadgeConfig(user.badgeLevel);
  const thumbClass = getSkillThumbClass(user.skill);
  const emoji = getSkillEmoji(user.skill);
  const staggerClass = index < 4 ? `animate-stagger-${(index % 4) + 1}` : "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const loadLocalVideo = async () => {
      // 1. If user already has a fully-qualified data URI / external URL:
      if (user.videoURL && user.videoURL.length > 30) {
        if (!cancelled) setVideoSrc(user.videoURL);
        return;
      }

      // 2. Load from IndexedDB/localStorage fallback asynchronously
      try {
        const url = await getVideoObjectURLWithFallback(user.id.toString());
        if (!cancelled && url) {
          objectUrl = url;
          setVideoSrc(url);
        }
      } catch (err) {
        console.warn("Failed to load user video from local DB:", err);
      }
    };

    loadLocalVideo();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user.id, user.videoURL]);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay was blocked or failed:", err);
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <article
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group animate-slide-up ${staggerClass}`}
    >
      {/* Video thumbnail */}
      <div className={`relative h-44 ${thumbClass} overflow-hidden`}>
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            loop
            playsInline
          />
        ) : (
          /* Geometric pattern overlay */
          <div className="absolute inset-0 opacity-20">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 176"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id={`grid-${user.id}`}
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="200" height="176" fill={`url(#grid-${user.id})`} />
            </svg>
          </div>
        )}

        {/* Skill emoji + label */}
        <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 z-10 border border-white/10">
          <span className="w-5 h-5 flex items-center justify-center shrink-0">{emoji}</span>
          <span className="text-white text-xs font-body font-semibold tracking-wide">
            <DynamicText text={getTranslatedSkillName(user.skill, t)} />
          </span>
        </div>

        {/* Distance badge */}
        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 z-10">
          <span className="text-white text-xs font-body">
            {Number(user.distance)} {t("profile_km_away").replace(" Away", "")}
          </span>
        </div>

        {/* Play button */}
        {videoSrc && (
          <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:opacity-0 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Rank badge */}
        <div className="absolute bottom-3 right-3 bg-black/25 backdrop-blur-sm rounded px-1.5 py-0.5 z-10">
          <span className="text-white/80 text-[10px] font-body font-medium tracking-wide">
            #{index + 1}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Name + badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate text-base leading-tight">
              <DynamicText text={user.name} />
            </h3>
            {badge && (
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-body font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${badge.className}`}
              >
                <span>{badge.icon}</span>
                {t(`badge_${badge.label.toLowerCase()}` as any)}
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <DynamicText text={user.location} className="font-body truncate" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 py-2.5 px-3 bg-muted rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-foreground/70 font-body">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-foreground">
              {Number(user.trustScore)}
            </span>
            <span className="text-muted-foreground">{t("dashboard_trust_score")}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-foreground/70 font-body">
            <ThumbsUp className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              {Number(user.endorsementCount)}
            </span>
            <span className="text-muted-foreground">{t("dashboard_endorsements")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/profile/$id"
            params={{ id: user.id.toString() }}
            className="flex-1"
          >
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-body font-medium text-xs h-8"
            >
              {t("user_view_profile")}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link to="/community/$skill" params={{ skill: user.skill }}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-body font-medium h-8 px-3 border-border hover:bg-accent hover:text-accent-foreground"
            >
              <DynamicText text={getTranslatedSkillName(user.skill, t)} />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
