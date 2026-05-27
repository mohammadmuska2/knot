import React from "react";
import type { User } from "../backend.d.ts";

export function getRankScore(user: User): number {
  return Number(user.trustScore) * 2 + Number(user.endorsementCount);
}

export function sortByRank(users: User[]): User[] {
  return [...users].sort((a, b) => getRankScore(b) - getRankScore(a));
}

export function getSkillThumbClass(skill: string): string {
  const lower = skill.toLowerCase();
  if (lower.includes("carpenter")) return "thumb-carpenter";
  if (lower.includes("tailor")) return "thumb-tailor";
  if (lower.includes("plumber")) return "thumb-plumber";
  if (lower.includes("potter")) return "thumb-potter";
  if (lower.includes("electrician")) return "thumb-carpenter";
  if (lower.includes("painter")) return "thumb-tailor";
  if (lower.includes("mason")) return "thumb-default";
  if (lower.includes("welder")) return "thumb-plumber";
  if (lower.includes("blacksmith")) return "thumb-default";
  if (lower.includes("cobbler")) return "thumb-potter";
  if (lower.includes("barber")) return "thumb-tailor";
  if (lower.includes("chef")) return "thumb-carpenter";
  if (lower.includes("driver")) return "thumb-default";
  if (lower.includes("farmer")) return "thumb-potter";
  return "thumb-default";
}

export function getSkillTextEmoji(skill: string): string {
  const lower = skill.toLowerCase();
  if (lower.includes("carpenter")) return "🪚";
  if (lower.includes("tailor")) return "🪡";
  if (lower.includes("plumber")) return "🔧";
  if (lower.includes("potter")) return "🏺";
  if (lower.includes("electrician")) return "⚡";
  if (lower.includes("painter")) return "🎨";
  if (lower.includes("mason")) return "🧱";
  if (lower.includes("welder")) return "💥";
  if (lower.includes("blacksmith")) return "🔨";
  if (lower.includes("cobbler")) return "🥾";
  if (lower.includes("barber")) return "💈";
  if (lower.includes("chef")) return "🍳";
  if (lower.includes("driver")) return "🚗";
  if (lower.includes("farmer")) return "🌾";
  return "⚒️";
}

export function getSkillEmoji(skill: string): React.ReactNode {
  const lower = skill.toLowerCase();
  
  if (lower.includes("carpenter")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="carpenter-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <rect x="8" y="24" width="48" height="16" rx="4" fill="url(#carpenter-grad)" opacity="0.3" stroke="url(#carpenter-grad)" strokeWidth="2" />
        <line x1="16" y1="28" x2="16" y2="36" stroke="url(#carpenter-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="28" x2="24" y2="36" stroke="url(#carpenter-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="32" y1="28" x2="32" y2="36" stroke="url(#carpenter-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M48 12L12 40V48H20L56 20L48 12Z" fill="url(#carpenter-grad)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
        <path d="M48 12L44 16L40 12L36 16L32 12L28 16L24 12L20 16L16 12L12 16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 40C10 40 8 42 8 44C8 46 10 48 12 48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  
  if (lower.includes("tailor")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tailor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
        </defs>
        <path d="M8 32C8 20 20 12 32 12C44 12 56 20 56 32C56 44 44 52 32 52" stroke="url(#tailor-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
        <path d="M12 52L48 16" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="44.5" cy="19.5" rx="2" ry="4" transform="rotate(45 44.5 19.5)" fill="url(#tailor-grad)" />
        <path d="M48 16C50 14 54 14 56 16C58 18 58 22 56 24L48 28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  
  if (lower.includes("plumber")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="plumber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        <path d="M12 28H52C54.2 28 56 29.8 56 32V32C56 34.2 54.2 36 52 36H12C9.8 36 8 34.2 8 32V32C8 29.8 9.8 28 12 28Z" fill="url(#plumber-grad)" opacity="0.3" stroke="url(#plumber-grad)" strokeWidth="2" />
        <rect x="28" y="24" width="8" height="16" rx="2" fill="url(#plumber-grad)" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M48 16L20 44" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M44 12H52V22H48V16H44V12Z" fill="url(#plumber-grad)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 44C32 46.2 30.2 48 28 48C25.8 48 24 46.2 24 44C24 41 28 36 28 36C28 36 32 41 32 44Z" fill="#38BDF8" />
      </svg>
    );
  }
  
  if (lower.includes("potter")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="potter-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="48" rx="24" ry="8" fill="url(#potter-grad)" opacity="0.4" stroke="url(#potter-grad)" strokeWidth="2" />
        <ellipse cx="32" cy="46" rx="20" ry="6" fill="#FFFFFF" opacity="0.2" />
        <path d="M22 16C22 16 26 12 32 12C38 12 42 16 42 16V22C42 28 46 32 46 38C46 44 40 46 32 46C24 46 18 44 18 38C18 32 22 28 22 22V16Z" fill="url(#potter-grad)" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="32" cy="14" rx="10" ry="2.5" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      </svg>
    );
  }
  
  if (lower.includes("electrician")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="elec-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
        </defs>
        <path d="M32 8C22 8 18 16 18 24C18 30 22 34 24 38V44H40V38C42 34 46 30 46 24C46 16 42 8 32 8Z" fill="url(#elec-grad)" opacity="0.2" stroke="url(#elec-grad)" strokeWidth="2.5" />
        <rect x="26" y="44" width="12" height="6" rx="1" fill="url(#elec-grad)" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M29 50C29 52 30 54 32 54C34 54 35 52 35 50" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 16V28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 22H38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 32L26 40L38 38L32 46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  
  if (lower.includes("painter")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="painter-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
        </defs>
        <path d="M12 16C24 10 40 12 52 20" stroke="url(#painter-grad)" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
        <path d="M16 20C24 16 38 18 48 24" stroke="url(#painter-grad)" strokeWidth="6" strokeLinecap="round" />
        <path d="M36 28H48V42H28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="24" y="22" width="24" height="12" rx="3" fill="url(#painter-grad)" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M28 42V52" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <rect x="26" y="50" width="4" height="6" rx="1" fill="url(#painter-grad)" />
      </svg>
    );
  }
  
  if (lower.includes("mason")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mason-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>
        <rect x="8" y="32" width="22" height="10" rx="1" fill="url(#mason-grad)" opacity="0.4" stroke="url(#mason-grad)" strokeWidth="1.5" />
        <rect x="34" y="32" width="22" height="10" rx="1" fill="url(#mason-grad)" opacity="0.4" stroke="url(#mason-grad)" strokeWidth="1.5" />
        <rect x="18" y="44" width="28" height="10" rx="1" fill="url(#mason-grad)" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M48 12L36 24" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M36 24L32 20L20 32L28 36L36 24Z" fill="url(#mason-grad)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  
  if (lower.includes("welder")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="welder-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
        </defs>
        <path d="M16 16C16 16 16 48 32 52C48 48 48 16 48 16V12H16V16Z" fill="url(#welder-grad)" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="22" y="20" width="20" height="10" rx="1" fill="#1E1B4B" stroke="#FFFFFF" strokeWidth="2" />
        <rect x="25" y="23" width="14" height="4" fill="#10B981" opacity="0.8" />
        <circle cx="12" cy="40" r="1.5" fill="#F59E0B" />
        <circle cx="52" cy="36" r="2" fill="#F59E0B" />
        <path d="M50 48L54 52" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  
  if (lower.includes("blacksmith")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blacksmith-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78716C" />
            <stop offset="100%" stopColor="#44403C" />
          </linearGradient>
        </defs>
        <path d="M12 44H52V48H12V44ZM16 24C16 24 16 36 22 40H42C48 36 48 24 48 24C32 24 24 20 16 24ZM12 24C12 24 6 26 6 30C6 34 12 36 12 36V24Z" fill="url(#blacksmith-grad)" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M46 12L34 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <rect x="42" y="8" width="8" height="8" rx="1" fill="#CA8A04" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M26 14L22 10" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M38 12L42 8" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  
  if (lower.includes("cobbler")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cobbler-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C2D12" />
            <stop offset="100%" stopColor="#431407" />
          </linearGradient>
        </defs>
        <path d="M10 38C10 38 14 26 24 26C34 26 38 32 46 32C54 32 58 36 58 40C58 44 54 44 46 44C38 44 10 44 10 38Z" fill="url(#cobbler-grad)" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M12 44V48H18V44" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
        <path d="M26 28C26 28 28 36 34 36C40 36 44 32 44 32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="M46 16L38 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  
  if (lower.includes("barber")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="barber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <rect x="24" y="10" width="16" height="44" rx="8" fill="url(#barber-grad)" opacity="0.3" stroke="url(#barber-grad)" strokeWidth="2" />
        <path d="M16 16L44 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M44 16L16 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="44" cy="16" r="4" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M12 32H52" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M16 32V38M22 32V38M28 32V38M34 32V38M40 32V38M46 32V38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  
  if (lower.includes("chef")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chef-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <path d="M14 50L32 32" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M50 14L32 32" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M22 36V30C16 30 16 22 22 22C20 16 30 12 32 14C34 12 44 16 42 22C48 22 48 30 42 30V36H22Z" fill="url(#chef-grad)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
        <rect x="22" y="34" width="20" height="4" rx="1" fill="#FFFFFF" />
      </svg>
    );
  }
  
  if (lower.includes("driver")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="driver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="20" fill="none" stroke="url(#driver-grad)" strokeWidth="4.5" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="32" cy="32" r="6" fill="url(#driver-grad)" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M32 32H12M32 32H52M32 32V52" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 20C18 12 46 12 52 20" stroke="url(#driver-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    );
  }
  
  if (lower.includes("farmer")) {
    return (
      <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="farmer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
        </defs>
        <path d="M8 44C16 38 48 38 56 44" stroke="url(#farmer-grad)" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        <path d="M8 50C16 44 48 44 56 50" stroke="url(#farmer-grad)" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        <circle cx="32" cy="36" r="14" fill="#EAB308" opacity="0.8" />
        <path d="M26 48C26 36 32 24 32 24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="29" cy="36" r="1.5" fill="#FFFFFF" />
        <circle cx="35" cy="34" r="1.5" fill="#FFFFFF" />
        <circle cx="29" cy="30" r="1.5" fill="#FFFFFF" />
        <circle cx="35" cy="28" r="1.5" fill="#FFFFFF" />
        <circle cx="32" cy="22" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // Default fallback
  return (
    <svg className="w-full h-full text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" fill="#475569" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M24 24H40V40H24V24Z" fill="#94A3B8" />
    </svg>
  );
}

export function getBadgeConfig(badge: string): {
  label: string;
  className: string;
  icon: string;
} | null {
  switch (badge) {
    case "Bronze":
      return {
        label: "Bronze",
        className: "bg-amber-100 text-amber-800 border-amber-300",
        icon: "🥉",
      };
    case "Silver":
      return {
        label: "Silver",
        className: "bg-slate-100 text-slate-700 border-slate-300",
        icon: "🥈",
      };
    case "Gold":
      return {
        label: "Gold",
        className: "bg-yellow-100 text-yellow-800 border-yellow-400",
        icon: "🥇",
      };
    default:
      return null;
  }
}

export function formatTimestamp(ts: bigint): string {
  // Motoko timestamps are in nanoseconds
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SKILL_CATEGORIES = [
  "All",
  "Carpenter",
  "Tailor",
  "Plumber",
  "Potter",
  "Electrician",
  "Painter",
  "Mason",
  "Welder",
  "Blacksmith",
  "Cobbler",
  "Barber",
  "Chef",
  "Driver",
  "Farmer",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const DISTANCE_OPTIONS = [
  { labelKey: "dist_any" as const, value: "all" },
  { labelKey: "dist_5km" as const, value: "5" },
  { labelKey: "dist_10km" as const, value: "10" },
  { labelKey: "dist_20km" as const, value: "20" },
];

export function getTranslatedSkillName(
  skill: string,
  t: (key: any) => string,
): string {
  const map: Record<string, string> = {
    All: "skill_all",
    Carpenter: "skill_carpenter",
    Tailor: "skill_tailor",
    Plumber: "skill_plumber",
    Potter: "skill_potter",
    Electrician: "skill_electrician",
    Painter: "skill_painter",
    Mason: "skill_mason",
    Welder: "skill_welder",
    Blacksmith: "skill_blacksmith",
    Cobbler: "skill_cobbler",
    Barber: "skill_barber",
    Chef: "skill_chef",
    Driver: "skill_driver",
    Farmer: "skill_farmer",
  };
  const key = map[skill] || map[skill.toLowerCase()] || map[skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase()];
  return key ? t(key) : skill;
}


export function getTranslatedLocation(
  location: string,
  t: (key: string) => string
): string {
  if (!location) return "";
  const locMap: Record<string, string> = {
    "bangalore": "loc_bangalore",
    "hyderabad": "loc_hyderabad",
    "delhi": "loc_delhi",
    "mumbai": "loc_mumbai",
    "pune": "loc_pune",
    "kashmir": "loc_kashmir",
    "pakistan": "loc_pakistan"
  };
  const key = locMap[location.toLowerCase()];
  return key ? t(key) : location;
}


export function getTranslatedName(
  name: string,
  t: (key: string) => string
): string {
  if (!name) return "";
  const nMap: Record<string, string> = {
    "md. musaveer": "name_musaveer",
    "g. lathika": "name_lathika",
    "b. chandana": "name_chandana",
    "m. chetan": "name_chetan",
    "g. ravi teja": "name_raviteja",
    "amit patel": "name_amit",
    "vikram singh": "name_vikram",
    "query": "name_query",
    "rajesh kumar": "name_rajesh",
    "pooja sharma": "name_pooja",
    "sanjay chef": "name_sanjay",
    "ioioo": "name_ioioo"
  };
  const key = nMap[name.toLowerCase()];
  return key ? t(key) : name;
}
