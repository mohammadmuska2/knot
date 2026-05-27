import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { useDynamicTranslation } from "../utils/dynamicTranslation";

export function Footer() {
  const { t } = useLang();
  
  const translatedFooter = useDynamicTranslation("Made with ❤️ for vocational communities");
  const footerParts = translatedFooter.split("❤️");

  const teamMembers = [
    {
      name: t("name_musaveer"),
      role: t("footer_role_md"),
      photo: "/assets/uploads/image-25-1.png",
    },
    {
      name: t("name_lathika"),
      role: t("footer_role_ceo"),
      photo: "/assets/uploads/WhatsApp-Image-2026-03-03-at-16.28.22-4-3.jpeg",
    },
    {
      name: t("name_chandana"),
      role: t("footer_role_research"),
      photo: "/assets/uploads/image-26-2.png",
    },
    {
      name: t("name_chetan"),
      role: t("footer_role_lead"),
      photo: "/assets/uploads/image-29-5.png",
    },
    {
      name: t("name_raviteja"),
      role: t("footer_role_comms"),
      photo: "https://i.ibb.co/XxQfTnfv/RT.jpg",
    },
  ];

  return (
    <footer className="bg-navy mt-auto py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/20">
                <img
                  src="/assets/uploads/image-27-4.png"
                  alt="KNOT"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-white text-lg">{t("brand_name")}</span>
            </div>
            <p className="text-white/50 text-sm font-body leading-relaxed">
              {t("home_hero_connect")}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3 tracking-wide uppercase">
              {t("nav_dashboard")}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/"
                  className="text-white/50 hover:text-white/80 text-sm font-body transition-colors"
                >
                  {t("nav_home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/requests"
                  className="text-white/50 hover:text-white/80 text-sm font-body transition-colors"
                >
                  {t("nav_learning_requests")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Meet the Team */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3 tracking-wide uppercase">
              {t("footer_meet_team")}
            </h4>
            <div className="flex flex-wrap gap-3">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 bg-white/10">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-white/70 text-xs font-body text-center leading-tight font-semibold">
                    {member.name}
                  </span>
                  <span
                    className="text-white/40 text-xs font-body text-center leading-tight"
                    style={{ fontSize: "10px" }}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs font-body">
            © 2026 {t("brand_name")}. {t("nav_subtitle")}
          </p>
          <p className="text-white/40 text-xs font-body flex items-center gap-1">
            {footerParts[0]}
            <Heart className="w-3 h-3 text-accent fill-accent shrink-0" />
            {footerParts[1]}
          </p>
        </div>
      </div>
    </footer>
  );
}
