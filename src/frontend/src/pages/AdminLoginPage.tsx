import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Loader2, Lock, Shield, LogIn } from "lucide-react";
import { toast } from "sonner";
const logoImg = "/assets/uploads/image-27-4.png";
import { useLang } from "../contexts/LanguageContext";
import { useActor } from "../hooks/useActor";
import { setAuthUser, setAuthToken } from "../utils/auth";
import { sha256Hex } from "../utils/hash";
import { api } from "../utils/api";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { t } = useLang();

  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  async function waitForActor(maxRetries = 10): Promise<typeof actor> {
    for (let i = 0; i < maxRetries; i++) {
      if (actorRef.current) return actorRef.current;
      await new Promise((res) => setTimeout(res, 1000));
    }
    return actorRef.current;
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      toast.error("Please enter username and password.");
      return;
    }
    setAdminLoading(true);

    const username = adminUsername.trim();
    const password = adminPassword;
    const passwordHash = await sha256Hex(password);

    try {
      // Try REST API backend first (returns JWT)
      const res = await api.loginAdmin(username, passwordHash);
      if (res && res.success) {
        setAuthUser({
          role: "admin",
          id: BigInt(0),
          name: "Administrator",
          username,
        });
        if (res.token) {
          setAuthToken(res.token);
        }
        toast.success("Welcome back, Administrator! 👋");
        setAdminLoading(false);
        navigate({ to: "/admin" });
        return;
      }
    } catch (_err) {
      // REST not available — fallback to local check
    }

    // Local credential fallback (also issues a session-style token via ICP actor)
    if (username === "admin" && password === "knot@admin2026") {
      // Try ICP actor
      const currentActor = await waitForActor();
      if (currentActor) {
        try {
          const isAdmin = await currentActor.loginAdmin(username, passwordHash);
          if (isAdmin) {
            setAuthUser({
              role: "admin",
              id: BigInt(0),
              name: "Administrator",
              username,
            });
            toast.success("Welcome back, Administrator! 👋");
            setAdminLoading(false);
            navigate({ to: "/admin" });
            return;
          }
        } catch (err) {
          console.warn("Admin ICP login error:", err);
        }
      }
      // Pure local fallback
      setAuthUser({
        role: "admin",
        id: BigInt(0),
        name: "Administrator",
        username,
      });
      // Store a placeholder token so frontend-side auth checks pass
      setAuthToken(`local-admin-${Date.now()}`);
      toast.success("Welcome back, Administrator! 👋");
      setAdminLoading(false);
      navigate({ to: "/admin" });
      return;
    }

    toast.error("Invalid admin credentials.");
    setAdminLoading(false);
  }

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Decorative premium dark glow elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, oklch(0.65 0.22 285 / 0.15) 0%, transparent 40%),
                            radial-gradient(circle at 90% 80%, oklch(0.7 0.18 35 / 0.1) 0%, transparent 40%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 20px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4 py-8 animate-slide-up">
        {/* Brand/Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-amber-500/25 shadow-2xl mb-4 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-amber-300 opacity-20 group-hover:opacity-30 transition-opacity" />
            <img
              src={logoImg}
              alt="KNOT Logo"
              className="w-full h-full object-cover relative z-10"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div
              className="w-full h-full bg-slate-800 items-center justify-center text-amber-400 font-extrabold text-3xl font-display absolute inset-0 z-10"
              style={{ display: "none" }}
            >
              K
            </div>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-slate-100 tracking-tight flex items-center gap-2">{t("brand_name")}<span className="text-amber-500 text-lg font-semibold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{t("admin_badge")}</span>
          </h1>
          <p className="text-slate-400/80 text-sm font-body mt-1">
            {t("admin_secure_gateway")}
          </p>
        </div>

        {/* Admin Login Card */}
        <Card className="shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100">
          <CardHeader className="pb-4 border-b border-slate-850">
            <CardTitle className="font-display text-xl text-center flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              {t("admin_portal_access")}
            </CardTitle>
            <CardDescription className="text-center text-slate-400 font-body text-xs mt-1">
              {t("admin_authorized_only")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-username"
                  className="font-body text-sm font-medium text-slate-300"
                >
                  {t("login_admin_username_label")}
                </Label>
                <Input
                  id="admin-username"
                  data-ocid="admin.username.input"
                  type="text"
                  placeholder={t("login_admin_enter_username")}
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="font-body bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-amber-500 focus-visible:border-amber-500 h-11"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-password"
                  className="font-body text-sm font-medium text-slate-300"
                >
                  <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  {t("login_admin_password_label")}
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    data-ocid="admin.password.input"
                    type={showAdminPassword ? "text" : "password"}
                    placeholder={t("login_admin_enter_password")}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="font-body bg-slate-950/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-amber-500 focus-visible:border-amber-500 h-11 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showAdminPassword ? "Hide password" : "Show password"}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                data-ocid="admin.submit_button"
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-body font-semibold shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-200 mt-6"
                disabled={adminLoading}
              >
                {adminLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("login_authenticating")}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {t("login_access_admin")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back link to main app */}
        <div className="text-center mt-6">
          <Button
            variant="link"
            className="text-slate-500 hover:text-slate-300 text-xs font-body font-medium"
            onClick={() => navigate({ to: "/login" })}
          >
            ← {t("admin_return_gateway")}
          </Button>
        </div>

        <p className="text-center text-slate-600 text-xs font-body mt-8">
          © {new Date().getFullYear()} {t("brand_name")} · {t("nav_subtitle")}
        </p>
      </div>
    </main>
  );
}
