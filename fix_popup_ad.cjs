const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/components/PopupAd.tsx', 'utf8');

// 1. Fix the top-level FALLBACK_ADS error where t is not defined
content = content.replace(/title: t\("ad_title"\),/g, 'title: "Free Skill Certification Videos",');
content = content.replace(/description:\s*t\("ad_desc"\),/g, 'description: "Master advanced techniques. 200+ hours of free vocational training content from India\'s top craftsmen.",');

// 2. Fix the translations INSIDE BannerAd
content = content.replace(
  'const ad = FALLBACK_ADS[adIndex];',
  'const baseAd = FALLBACK_ADS[adIndex];\n  const ad = {\n    ...baseAd,\n    title: baseAd.id === "ad_training" ? t("ad_title") : baseAd.title,\n    description: baseAd.id === "ad_training" ? t("ad_desc") : baseAd.description,\n    cta: baseAd.id === "ad_training" ? t("ad_btn") : baseAd.cta,\n    tag: t("ad_sponsored")\n  };'
);

content = content.replace(
  'export function BannerAd({ className = "" }: { className?: string }) {',
  'export function BannerAd({ className = "" }: { className?: string }) {\n  const { t } = useLang();'
);

content = content.replace(
  /Demo ad · Sign up at propellerads\.com to earn real revenue \(works[\s\n]*on subdomains!\)/g,
  '{t("ad_demo_banner")}'
);

// 3. Fix the translations INSIDE PopupAd
// Since adIndex is also in PopupAd, replace the first occurrence (which we already replaced above in BannerAd).
// Now we need to replace the ad definition in PopupAd.
content = content.replace(
  /const adIndex = useState\(\(\) =>[\s\n]*Math\.floor\(Math\.random\(\) \* FALLBACK_ADS\.length\),[\s\n]*\)\[0\];[\s\n]*const ad = FALLBACK_ADS\[adIndex\];/g,
  'const adIndex = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length))[0];\n  const baseAd = FALLBACK_ADS[adIndex];\n  const ad = {\n    ...baseAd,\n    title: baseAd.id === "ad_training" ? t("ad_title") : baseAd.title,\n    description: baseAd.id === "ad_training" ? t("ad_desc") : baseAd.description,\n    cta: baseAd.id === "ad_training" ? t("ad_btn") : baseAd.cta,\n    tag: t("ad_sponsored")\n  };'
);

// We need to be careful with the exact string matches for PopupAd
content = content.replace(
  /const \[adIndex\] = useState\(\(\) =>[\s\n]*Math\.floor\(Math\.random\(\) \* FALLBACK_ADS\.length\),[\s\n]*\);[\s\n]*const ad = FALLBACK_ADS\[adIndex\];/g,
  'const [adIndex] = useState(() => Math.floor(Math.random() * FALLBACK_ADS.length));\n  const baseAd = FALLBACK_ADS[adIndex];\n  const ad = {\n    ...baseAd,\n    title: baseAd.id === "ad_training" ? t("ad_title") : baseAd.title,\n    description: baseAd.id === "ad_training" ? t("ad_desc") : baseAd.description,\n    cta: baseAd.id === "ad_training" ? t("ad_btn") : baseAd.cta,\n    tag: t("ad_sponsored")\n  };'
);

content = content.replace(
  />\s*No thanks, close ad\s*<\/button>/g,
  '>{t("ad_close")}</button>'
);

content = content.replace(
  />\s*Demo ad · Configure Propeller Ads to earn real revenue[\s\n]*\(subdomain-friendly\)\s*<\/p>/g,
  '>{t("ad_demo")}</p>'
);

fs.writeFileSync('src/frontend/src/components/PopupAd.tsx', content);
console.log('Fixed PopupAd.tsx');
