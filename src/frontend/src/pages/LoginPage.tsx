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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { Translations } from "../utils/translations";

import {
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  Phone,
  Upload,
  User,
  UserPlus,
  Video,
} from "lucide-react";
import { toast } from "sonner";
const logoImg = "/assets/uploads/image-27-4.png";
import { useLang } from "../contexts/LanguageContext";
import { useActor } from "../hooks/useActor";
import { setAuthUser } from "../utils/auth";
import { api } from "../utils/api";
import { sha256Hex } from "../utils/hash";
import { saveVideoBlob } from "../utils/videoDB";

// ─── PasswordField defined OUTSIDE LoginPage to prevent remount on every render ───
// memo() prevents re-render when parent re-renders but props haven't changed
const PasswordField = memo(function PasswordField({
  id,
  ocid,
  value,
  onChange,
  show,
  onToggleShow,
  error,
  errorOcid,
  accentColor = "amber",
  t,
}: {
  id: string;
  ocid: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  error?: string;
  errorOcid?: string;
  accentColor?: "amber" | "slate";
  t: (key: keyof Translations) => string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="font-body text-sm font-medium text-foreground"
      >
        <Lock className={`w-3.5 h-3.5 inline mr-1 text-${accentColor}-600`} />
        {t("login_password_label")}
      </Label>
      <div className="relative">
        <Input
          id={id}
          data-ocid={ocid}
          type={show ? "text" : "password"}
          placeholder={t("login_password_placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-body border-border h-11 pr-10"
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p
          data-ocid={errorOcid}
          className="text-red-600 text-xs font-body mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export function LoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { t } = useLang();

  const actorRef = useRef(actor);
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  // Mode toggles: "login" = returning user, "register" = new user
  const [citizenMode, setCitizenMode] = useState<"login" | "register">("login");
  const [workerMode, setWorkerMode] = useState<"login" | "register">("login");

  // Citizen state
  const [citizenName, setCitizenName] = useState("");
  const [citizenUsername, setCitizenUsername] = useState("");
  const [citizenPassword, setCitizenPassword] = useState("");
  const [citizenAddress, setCitizenAddress] = useState("");
  const [citizenLoading, setCitizenLoading] = useState(false);
  const [citizenPasswordError, setCitizenPasswordError] = useState("");

  // Worker state
  const [workerName, setWorkerName] = useState("");
  const [workerUsername, setWorkerUsername] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [workerSkill, setWorkerSkill] = useState("");
  const [workerLocation, setWorkerLocation] = useState("");
  const [workerBio, setWorkerBio] = useState("");
  const [workerContact, setWorkerContact] = useState("");
  const [workerVideoFile, setWorkerVideoFile] = useState<File | null>(null);
  const [workerDistance, _setWorkerDistance] = useState("5");
  const [workerLoading, setWorkerLoading] = useState(false);
  const [workerPasswordError, setWorkerPasswordError] = useState("");

  // Password visibility toggles
  const [showCitizenPassword, setShowCitizenPassword] = useState(false);
  const [showWorkerPassword, setShowWorkerPassword] = useState(false);

  // Stable callbacks so memo() on PasswordField actually prevents re-renders
  const handleCitizenPasswordChange = useCallback((v: string) => {
    setCitizenPassword(v);
    setCitizenPasswordError("");
  }, []);
  const handleWorkerPasswordChange = useCallback((v: string) => {
    setWorkerPassword(v);
    setWorkerPasswordError("");
  }, []);
  const toggleCitizenPassword = useCallback(
    () => setShowCitizenPassword((p) => !p),
    [],
  );
  const toggleWorkerPassword = useCallback(
    () => setShowWorkerPassword((p) => !p),
    [],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setWorkerVideoFile(file);
  }

  async function waitForActor(maxRetries = 10): Promise<typeof actor> {
    for (let i = 0; i < maxRetries; i++) {
      if (actorRef.current) return actorRef.current;
      await new Promise((res) => setTimeout(res, 1000));
    }
    return actorRef.current;
  }

  // ─── Citizen Login (returning user — username + password only) ───────────────
  async function handleCitizenLogin(e: React.FormEvent) {
    e.preventDefault();
    setCitizenPasswordError("");
    if (!citizenUsername.trim() || !citizenPassword.trim()) {
      toast.error("Please enter your username and password.");
      return;
    }
    setCitizenLoading(true);

    const username = citizenUsername.trim().toLowerCase();
    const passwordHash = await sha256Hex(citizenPassword);

    let userId: bigint | null = null;
    let name = "";

    // 1. Try REST API login first
    try {
      const restResult = await api.loginCitizen(username, passwordHash);
      if (restResult) {
        userId = BigInt(restResult.id);
        name = restResult.name;
      }
    } catch (err) {
      console.warn("REST citizen login failed:", err);
    }

    // 2. Try actor backend login
    if (!userId) {
      const currentActor = await waitForActor();
      if (currentActor) {
        try {
          const existing = await currentActor.loginCitizen(
            username,
            passwordHash,
          );
          if (existing !== null && existing !== undefined) {
            userId = existing.id;
            name = existing.name;
          }
        } catch (err) {
          console.warn("Citizen backend login failed:", err);
        }
      }
    }

    // 2. Fallback: localStorage credentials
    if (!userId) {
      const localCitizen = localStorage.getItem(
        `knot_citizen_username_${username}`,
      );
      if (localCitizen) {
        try {
          const lc = JSON.parse(localCitizen);
          if (lc.passwordHash === passwordHash) {
            userId = BigInt(lc.id);
            // Load name from saved profile
            const profile = localStorage.getItem(
              `knot_citizen_profile_${lc.id}`,
            );
            if (profile) {
              const p = JSON.parse(profile);
              name = p.name ?? "";
            }
          } else {
            setCitizenPasswordError("Username or password is incorrect.");
            setCitizenLoading(false);
            return;
          }
        } catch {
          /**/
        }
      }
    }

    if (!userId) {
      setCitizenPasswordError(
        'Username or password is incorrect. Not registered? Click "New here? Register".',
      );
      setCitizenLoading(false);
      return;
    }

    // Load full profile
    const profile = localStorage.getItem(
      `knot_citizen_profile_${userId.toString()}`,
    );
    let address = "";
    if (profile) {
      try {
        const p = JSON.parse(profile);
        address = p.address ?? "";
        if (!name) name = p.name ?? "";
      } catch {
        /**/
      }
    }

    setAuthUser({ role: "citizen", id: userId, name, username, address });
    toast.success(`Welcome back, ${name || username}! 👋`);
    setCitizenLoading(false);
    navigate({ to: "/" });
  }

  // ─── Citizen Register (new user — all fields) ────────────────────────────────
  async function handleCitizenRegister(e: React.FormEvent) {
    e.preventDefault();
    setCitizenPasswordError("");
    if (
      !citizenName.trim() ||
      !citizenUsername.trim() ||
      !citizenPassword.trim() ||
      !citizenAddress.trim()
    ) {
      toast.error(t("error_please_fill"));
      return;
    }
    if (citizenPassword.length < 6) {
      setCitizenPasswordError("Password must be at least 6 characters.");
      return;
    }
    setCitizenLoading(true);

    const name = citizenName.trim();
    const username = citizenUsername.trim().toLowerCase();
    const address = citizenAddress.trim();
    const passwordHash = await sha256Hex(citizenPassword);

    let userId: bigint | null = null;
    let isReturning = false;

    // Try REST API login/registration
    try {
      let existing: any = null;
      try {
        existing = await api.loginCitizen(username, passwordHash);
      } catch (loginErr) {
        // Safe to ignore: new citizen does not exist yet
      }

      if (existing) {
        userId = BigInt(existing.id);
        isReturning = true;
      } else {
        const byName = await api.findCitizenByName(name).catch(() => null);
        if (byName) {
          setCitizenPasswordError(
            "Username already taken. Try a different one.",
          );
          setCitizenLoading(false);
          return;
        }
        const regRes = await api.registerCitizen(
          name,
          address,
          username,
          passwordHash,
        );
        if (regRes && regRes.id) {
          userId = BigInt(regRes.id);
        }
      }
    } catch (err) {
      console.warn("REST citizen register failed, using actor fallback:", err);
    }

    if (!isReturning && !userId) {
      const currentActor = await waitForActor();
      if (currentActor) {
        try {
          const existing = await currentActor.loginCitizen(
            username,
            passwordHash,
          );
          if (existing !== null && existing !== undefined) {
            userId = existing.id;
            isReturning = true;
          } else {
            const byName = await currentActor.findCitizenByName(name);
            if (byName !== null && byName !== undefined) {
              setCitizenPasswordError(
                "Username already taken. Try a different one.",
              );
              setCitizenLoading(false);
              return;
            }
            userId = await currentActor.registerCitizen(
              name,
              address,
              username,
              passwordHash,
            );
          }
        } catch (err) {
          console.warn("Citizen register failed, using local fallback:", err);
        }
      }
    }

    // Check localStorage for existing citizen with same username
    if (!isReturning && !userId) {
      const localCitizen = localStorage.getItem(
        `knot_citizen_username_${username}`,
      );
      if (localCitizen) {
        try {
          const lc = JSON.parse(localCitizen);
          if (lc.passwordHash === passwordHash) {
            userId = BigInt(lc.id);
            isReturning = true;
          } else {
            setCitizenPasswordError(
              "Username already taken. Please choose another.",
            );
            setCitizenLoading(false);
            return;
          }
        } catch {
          /**/
        }
      }
    }

    const finalId = userId ?? BigInt(Date.now() % 1000000);

    const citizenProfile = { id: finalId.toString(), name, username, address };
    localStorage.setItem(
      `knot_citizen_profile_${finalId.toString()}`,
      JSON.stringify(citizenProfile),
    );
    if (!isReturning) {
      localStorage.setItem(
        `knot_citizen_username_${username}`,
        JSON.stringify({ id: finalId.toString(), passwordHash }),
      );
    }

    setAuthUser({ role: "citizen", id: finalId, name, username, address });

    if (isReturning) {
      toast.success(`Welcome back, ${name}! 👋`);
    } else {
      toast.success(
        `${t("home_hero_welcome")}, ${name}! ${t("login_welcome_citizen")}`,
      );
    }
    setCitizenLoading(false);
    navigate({ to: "/" });
  }

  // ─── Worker Login (returning user — username + password only) ────────────────
  async function handleWorkerLogin(e: React.FormEvent) {
    e.preventDefault();
    setWorkerPasswordError("");
    if (!workerUsername.trim() || !workerPassword.trim()) {
      toast.error("Please enter your username and password.");
      return;
    }
    setWorkerLoading(true);

    const username = workerUsername.trim().toLowerCase();
    const passwordHash = await sha256Hex(workerPassword);

    let finalId: bigint | null = null;
    let returnedProfile: {
      name?: string;
      skill?: string;
      location?: string;
      bio?: string;
      contact?: string;
    } = {};

    // 1. Check localStorage first (fast)
    const localWorkerCreds = localStorage.getItem(
      `knot_worker_username_${username}`,
    );
    if (localWorkerCreds) {
      try {
        const lw = JSON.parse(localWorkerCreds);
        if (lw.passwordHash === passwordHash) {
          finalId = BigInt(lw.id);
          const existingProfile = localStorage.getItem(
            `knot_worker_profile_${lw.id}`,
          );
          if (existingProfile) {
            const ep = JSON.parse(existingProfile);
            returnedProfile = {
              name: ep.name,
              skill: ep.skill,
              location: ep.location,
              bio: ep.bio,
              contact: ep.contact,
            };
          }
        } else {
          setWorkerPasswordError("Username or password is incorrect.");
          setWorkerLoading(false);
          return;
        }
      } catch {
        /**/
      }
    }

    // 2. Try REST API login
    if (!finalId) {
      try {
        const restResult = await api.loginWorker({ username, passwordHash });
        if (restResult && restResult.user) {
          // Store JWT token so authenticated API calls work
          if (restResult.token) {
            localStorage.setItem("knot_jwt_token", restResult.token);
            localStorage.setItem("knot_auth_token", restResult.token);
          }
          finalId = BigInt(restResult.user.id);
          returnedProfile = {
            name: restResult.user.name,
            skill: restResult.user.skill,
            location: restResult.user.location,
            bio: restResult.user.bio,
            contact: restResult.user.contact,
          };
        }
      } catch (err) {
        console.warn("REST worker login failed:", err);
      }
    }

    // 3. Try actor backend login
    if (!finalId) {
      const currentActor = await waitForActor();
      if (currentActor) {
        try {
          const existing = await currentActor.loginWorker(
            username,
            passwordHash,
          );
          if (existing !== null && existing !== undefined) {
            finalId = existing.id;
            returnedProfile = {
              name: existing.name,
              skill: existing.skill,
              location: existing.location,
              bio: existing.bio,
              contact: existing.contact,
            };
          }
        } catch (err) {
          console.warn("Worker backend login failed:", err);
        }
      }
    }

    if (!finalId) {
      setWorkerPasswordError(
        'Username or password is incorrect. Not registered? Click "New here? Register".',
      );
      setWorkerLoading(false);
      return;
    }

    const name = returnedProfile.name ?? username;
    setAuthUser({
      role: "worker",
      id: finalId,
      name,
      username,
      skill: returnedProfile.skill ?? "",
    });

    localStorage.setItem(`knot_worker_pw_hash_${finalId.toString()}`, passwordHash);

    toast.success(`Welcome back, ${name}! 👋`);
    setWorkerLoading(false);
    navigate({ to: "/worker-dashboard" });
  }

  // ─── Worker Register (new user — all fields) ─────────────────────────────────
  async function handleWorkerRegister(e: React.FormEvent) {
    e.preventDefault();
    setWorkerPasswordError("");
    if (
      !workerName.trim() ||
      !workerUsername.trim() ||
      !workerPassword.trim() ||
      !workerSkill ||
      !workerLocation.trim() ||
      !workerContact.trim()
    ) {
      toast.error(t("error_please_fill_required"));
      return;
    }
    if (workerPassword.length < 6) {
      setWorkerPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (!workerVideoFile) {
      toast.error(
        `${t("login_video_required")}. Please upload your skill video — it is required for registration.`,
      );
      return;
    }
    setWorkerLoading(true);

    const name = workerName.trim();
    const username = workerUsername.trim().toLowerCase();
    const skill = workerSkill;
    const location = workerLocation.trim();
    const bio = workerBio.trim();
    const contact = workerContact.trim();
    const distanceValue = Math.max(
      1,
      Math.min(50, Number.parseInt(workerDistance, 10) || 5),
    );
    const passwordHash = await sha256Hex(workerPassword);

    let finalId: bigint | null = null;
    let isReturning = false;
    let returnedProfile: {
      skill?: string;
      location?: string;
      bio?: string;
      contact?: string;
    } = {};

    // Check localStorage for existing worker account with same username FIRST
    const localWorkerCreds = localStorage.getItem(
      `knot_worker_username_${username}`,
    );
    if (localWorkerCreds) {
      try {
        const lw = JSON.parse(localWorkerCreds);
        if (lw.passwordHash === passwordHash) {
          finalId = BigInt(lw.id);
          isReturning = true;
          const existingProfile = localStorage.getItem(
            `knot_worker_profile_${lw.id}`,
          );
          if (existingProfile) {
            const ep = JSON.parse(existingProfile);
            returnedProfile = {
              skill: ep.skill,
              location: ep.location,
              bio: ep.bio,
              contact: ep.contact,
            };
          }
        } else {
          setWorkerPasswordError(
            "Username already taken. Please choose another.",
          );
          setWorkerLoading(false);
          return;
        }
      } catch {
        /**/
      }
    }

    // Try REST API registration first
    try {
      let existing: any = null;
      try {
        existing = await api.loginWorker({ username, passwordHash });
      } catch (loginErr) {
        // Safe to ignore: new worker does not exist yet
      }

      if (existing && existing.user) {
        if (existing.token) {
          localStorage.setItem("knot_jwt_token", existing.token);
          localStorage.setItem("knot_auth_token", existing.token);
        }
        finalId = BigInt(existing.user.id);
        isReturning = true;
        returnedProfile = {
          skill: existing.user.skill,
          location: existing.user.location,
          bio: existing.user.bio,
          contact: existing.user.contact,
        };
      } else {
        const byName = await api.findUserByName(name).catch(() => null);
        if (byName) {
          setWorkerPasswordError(
            "Username already taken. Try logging in instead.",
          );
          setWorkerLoading(false);
          return;
        }
        const regRes = await api.registerWorker({
          username,
          passwordHash,
          name,
          skill,
          location,
          bio,
          videoURL: "",
          distance: distanceValue,
          contact,
        });
        if (regRes && regRes.user && regRes.user.id) {
          finalId = BigInt(regRes.user.id);
          if (regRes.token) {
            localStorage.setItem("knot_jwt_token", regRes.token);
            localStorage.setItem("knot_auth_token", regRes.token);
          }
        }
      }
    } catch (err) {
      console.warn("REST worker register failed, using actor fallback:", err);
    }

    if (!isReturning && !finalId) {
      const currentActor = await waitForActor();
      if (currentActor) {
        try {
          const existing = await currentActor.loginWorker(
            username,
            passwordHash,
          );
          if (existing !== null && existing !== undefined) {
            finalId = existing.id;
            isReturning = true;
            returnedProfile = {
              skill: existing.skill,
              location: existing.location,
              bio: existing.bio,
              contact: existing.contact,
            };
          } else {
            const byName = await currentActor.findWorkerByName(name);
            if (byName !== null && byName !== undefined) {
              setWorkerPasswordError(
                "Username already taken. Try logging in instead.",
              );
              setWorkerLoading(false);
              return;
            }
            finalId = await currentActor.registerWorker(
              username,
              passwordHash,
              name,
              skill,
              location,
              bio,
              "",
              BigInt(distanceValue),
              contact,
            );
          }
        } catch (err) {
          console.warn("Worker register failed, using local fallback:", err);
        }
      }
    }

    const userId = finalId ?? BigInt(Date.now() % 1000000);
    const effectiveSkill =
      isReturning && returnedProfile.skill ? returnedProfile.skill : skill;
    const effectiveLocation =
      isReturning && returnedProfile.location
        ? returnedProfile.location
        : location;
    const effectiveBio =
      isReturning && returnedProfile.bio !== undefined
        ? returnedProfile.bio
        : bio;
    const effectiveContact =
      isReturning && returnedProfile.contact
        ? returnedProfile.contact
        : contact;

    // Save video locally + upload to backend
    if (workerVideoFile) {
      try {
        await saveVideoBlob(userId.toString(), workerVideoFile);
      } catch (err) {
        console.warn("Failed to save video to IndexedDB:", err);
      }
      const previewUrl = URL.createObjectURL(workerVideoFile);
      localStorage.setItem("knot_worker_video_preview_url", previewUrl);

      try {
        const base64DataURI = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(workerVideoFile);
        });
        try {
          localStorage.setItem(`knot_video_b64_${userId.toString()}`, base64DataURI);
        } catch (storageErr) {
          console.warn("Video too large for local storage, skipping local cache backup.");
        }

        const uploadToBackend = async () => {
          // 1. Upload to REST API (save video + submit practical video)
          try {
            await api.saveWorkerVideo(Number(userId), base64DataURI);
            await api.submitPracticalVideo(
              Number(userId),
              name,
              effectiveSkill || skill,
              base64DataURI,
            );
          } catch (err: any) {
            console.warn("REST video upload failed:", err);
            toast.error("Warning: Could not upload video to backend (" + (err.message || String(err)) + ")");
          }

          // 2. Also save to local storage for local verification tab fallback
          try {
            localStorage.setItem(
              `knot_practical_submission_${userId.toString()}`,
              JSON.stringify({
                workerId: userId.toString(),
                workerName: name,
                skill: effectiveSkill || skill,
                videoDataURI: base64DataURI,
                status: "pending",
                submittedAt: Date.now(),
              }),
            );
          } catch (err) {
            console.warn("Failed to save submission to localStorage:", err);
          }

          // 3. Keep actor upload as fallback
          for (let attempt = 0; attempt < 3; attempt++) {
            const a = actorRef.current;
            if (a) {
              try {
                await a.saveWorkerVideo(userId, base64DataURI);
                try {
                  await a.submitPracticalVideo(
                    userId,
                    name,
                    effectiveSkill || skill,
                    base64DataURI,
                  );
                } catch { }
                return;
              } catch (err) {
                console.warn(
                  `Backend video upload attempt ${attempt + 1} failed:`,
                  err,
                );
                if (attempt < 2)
                  await new Promise((res) => setTimeout(res, 2000));
              }
            } else {
              await new Promise((res) => setTimeout(res, 1000));
            }
          }
        };
        uploadToBackend();
      } catch (err) {
        console.warn("Failed to process video for upload:", err);
      }
    }

    localStorage.setItem("knot_worker_id", userId.toString());
    localStorage.setItem(`knot_worker_pw_hash_${userId.toString()}`, passwordHash);

    if (!isReturning) {
      const workerProfileData = {
        id: userId.toString(),
        name,
        skill: effectiveSkill,
        location: effectiveLocation,
        trustScore: 0,
        endorsementCount: 0,
        badgeLevel: "None",
        distance: distanceValue,
        bio: effectiveBio,
        videoURL: "",
        contact: effectiveContact,
      };
      localStorage.setItem(
        `knot_worker_profile_${userId.toString()}`,
        JSON.stringify(workerProfileData),
      );
      localStorage.setItem(
        `knot_worker_username_${username}`,
        JSON.stringify({ id: userId.toString(), passwordHash }),
      );
    }
    localStorage.setItem(
      `knot_worker_name_${name.toLowerCase().trim()}`,
      userId.toString(),
    );

    setAuthUser({
      role: "worker",
      id: userId,
      name,
      username,
      skill: effectiveSkill || skill,
    });

    if (isReturning) {
      toast.success(`Welcome back, ${name}! 👋`);
    } else {
      toast.success(
        `${t("home_hero_welcome")} to ${t("brand_name")}, ${name}! ${t("login_welcome_worker")}`,
      );
    }
    setWorkerLoading(false);
    navigate({ to: "/worker-dashboard" });
  }



  return (
    <main className="flex-1 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, oklch(0.75 0.18 75 / 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, oklch(0.65 0.14 55 / 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 50% 50%, oklch(0.7 0.16 65 / 0.2) 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(0.3 0.08 245) 0px, oklch(0.3 0.08 245) 1px, transparent 1px, transparent 20px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4 py-8 animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-amber-400/50 shadow-2xl mb-4 relative">
            <img
              src={logoImg}
              alt="KNOT Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback =
                  target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div
              className="w-full h-full bg-amber-500 items-center justify-center text-white font-extrabold text-3xl font-display absolute inset-0"
              style={{ display: "none" }}
            >
              K
            </div>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-amber-900 tracking-tight">{t("brand_name")}</h1>
          <p className="text-amber-700/70 text-sm font-body mt-1">
            {t("nav_subtitle")}
          </p>
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
            <Lock className="w-3 h-3 text-green-600" />
            <span className="text-green-700 text-xs font-body font-semibold">
              {t("login_secure_auth")}
            </span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl text-center text-foreground">
              {t("login_join_community")}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground font-body text-sm">
              {t("login_subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="citizen" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-amber-50 p-1 rounded-xl">
                <TabsTrigger
                  value="citizen"
                  data-ocid="login.citizen.tab"
                  className="rounded-lg font-body font-semibold text-sm data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  {t("login_im_citizen")}
                </TabsTrigger>
                <TabsTrigger
                  value="worker"
                  data-ocid="login.worker.tab"
                  className="rounded-lg font-body font-semibold text-sm data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <Briefcase className="w-4 h-4 mr-1.5" />
                  {t("login_im_worker")}
                </TabsTrigger>
              </TabsList>

              {/* ───── Citizen Tab ───── */}
              <TabsContent value="citizen" className="mt-0">
                {/* Mode Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-amber-200 mb-5">
                  <button
                    type="button"
                    data-ocid="citizen.login.toggle"
                    onClick={() => {
                      setCitizenMode("login");
                      setCitizenPasswordError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-body font-semibold transition-all ${citizenMode === "login"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                  >
                    <LogIn className="w-4 h-4" />
                    {t("login_login_btn")}
                  </button>
                  <button
                    type="button"
                    data-ocid="citizen.register.toggle"
                    onClick={() => {
                      setCitizenMode("register");
                      setCitizenPasswordError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-body font-semibold transition-all ${citizenMode === "register"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {t("login_register_btn")}
                  </button>
                </div>

                {citizenMode === "login" ? (
                  /* ── Citizen Login Form ── */
                  <form onSubmit={handleCitizenLogin} className="space-y-4">
                    <div className="bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-200/60 mb-2">
                      <p className="text-amber-800 text-xs font-body">
                        👋 {t("login_new_here")} {t("login_login_here")} —{" "}
                        {t("login_username_label")} &{" "}
                        {t("login_password_label")}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="citizen-login-username"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_username_label")}
                      </Label>
                      <Input
                        id="citizen-login-username"
                        data-ocid="citizen.username.input"
                        type="text"
                        placeholder={t("login_username_label")}
                        value={citizenUsername}
                        onChange={(e) => setCitizenUsername(e.target.value)}
                        className="font-body border-border h-11"
                        autoComplete="username"
                        required
                      />
                    </div>

                    <PasswordField
                      id="citizen-login-password"
                      ocid="citizen.password.input"
                      value={citizenPassword}
                      onChange={handleCitizenPasswordChange}
                      show={showCitizenPassword}
                      onToggleShow={toggleCitizenPassword}
                      error={citizenPasswordError}
                      errorOcid="citizen.password.error_state"
                      t={t}
                    />

                    <Button
                      type="submit"
                      data-ocid="citizen.submit_button"
                      className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-body font-semibold shadow-lg shadow-amber-600/20 transition-all"
                      disabled={citizenLoading}
                    >
                      {citizenLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("login_signing_in")}
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          {t("login_login_btn")} — {t("login_im_citizen")}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs font-body text-amber-700/60">
                      {t("login_new_here")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenMode("register");
                          setCitizenPasswordError("");
                        }}
                        className="text-amber-700 underline font-semibold hover:text-amber-900"
                      >
                        {t("login_create_account")}
                      </button>
                    </p>
                  </form>
                ) : (
                  /* ── Citizen Register Form ── */
                  <form onSubmit={handleCitizenRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="citizen-name"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_your_name")}
                      </Label>
                      <Input
                        id="citizen-name"
                        data-ocid="citizen.name.input"
                        type="text"
                        placeholder={t("login_enter_name")}
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="font-body border-border h-11"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="citizen-username"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_username_label")}
                      </Label>
                      <Input
                        id="citizen-username"
                        data-ocid="citizen.username.input"
                        type="text"
                        placeholder={t("login_username_eg")}
                        value={citizenUsername}
                        onChange={(e) => setCitizenUsername(e.target.value)}
                        className="font-body border-border h-11"
                        autoComplete="username"
                        required
                      />
                    </div>

                    <PasswordField
                      id="citizen-password"
                      ocid="citizen.password.input"
                      value={citizenPassword}
                      onChange={handleCitizenPasswordChange}
                      show={showCitizenPassword}
                      onToggleShow={toggleCitizenPassword}
                      error={citizenPasswordError}
                      errorOcid="citizen.password.error_state"
                      t={t}
                    />

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="citizen-address"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        <MapPin className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                        {t("login_your_location")}
                      </Label>
                      <Input
                        id="citizen-address"
                        data-ocid="citizen.address.input"
                        type="text"
                        placeholder={t("login_enter_city")}
                        value={citizenAddress}
                        onChange={(e) => setCitizenAddress(e.target.value)}
                        className="font-body border-border h-11"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      data-ocid="citizen.submit_button"
                      className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-body font-semibold shadow-lg shadow-amber-600/20 transition-all"
                      disabled={citizenLoading}
                    >
                      {citizenLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("login_finding_workers")}
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {t("login_enter_as_citizen")}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs font-body text-amber-700/60">
                      {t("login_already_registered")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenMode("login");
                          setCitizenPasswordError("");
                        }}
                        className="text-amber-700 underline font-semibold hover:text-amber-900"
                      >
                        {t("login_login_here")}
                      </button>
                    </p>
                  </form>
                )}
              </TabsContent>

              {/* ───── Worker Tab ───── */}
              <TabsContent value="worker" className="mt-0">
                {/* Mode Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-amber-200 mb-5">
                  <button
                    type="button"
                    data-ocid="worker.login.toggle"
                    onClick={() => {
                      setWorkerMode("login");
                      setWorkerPasswordError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-body font-semibold transition-all ${workerMode === "login"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                  >
                    <LogIn className="w-4 h-4" />
                    {t("login_login_btn")}
                  </button>
                  <button
                    type="button"
                    data-ocid="worker.register.toggle"
                    onClick={() => {
                      setWorkerMode("register");
                      setWorkerPasswordError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-body font-semibold transition-all ${workerMode === "register"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {t("login_register_btn")}
                  </button>
                </div>

                {workerMode === "login" ? (
                  /* ── Worker Login Form ── */
                  <form onSubmit={handleWorkerLogin} className="space-y-4">
                    <div className="bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-200/60 mb-2">
                      <p className="text-amber-800 text-xs font-body">
                        👋 {t("login_already_registered")}{" "}
                        {t("login_login_here")} — {t("login_username_label")} &{" "}
                        {t("login_password_label")}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="worker-login-username"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_username_label")}
                      </Label>
                      <Input
                        id="worker-login-username"
                        data-ocid="worker.username.input"
                        type="text"
                        placeholder={t("login_username_label")}
                        value={workerUsername}
                        onChange={(e) => setWorkerUsername(e.target.value)}
                        className="font-body border-border h-11"
                        autoComplete="username"
                        required
                      />
                    </div>

                    <PasswordField
                      id="worker-login-password"
                      ocid="worker.password.input"
                      value={workerPassword}
                      onChange={handleWorkerPasswordChange}
                      show={showWorkerPassword}
                      onToggleShow={toggleWorkerPassword}
                      error={workerPasswordError}
                      errorOcid="worker.password.error_state"
                      t={t}
                    />

                    <Button
                      type="submit"
                      data-ocid="worker.submit_button"
                      className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-body font-semibold shadow-lg shadow-amber-600/20 transition-all"
                      disabled={workerLoading}
                    >
                      {workerLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("login_signing_in")}
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          {t("login_login_btn")} — {t("login_im_worker")}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs font-body text-amber-700/60">
                      {t("login_new_here")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setWorkerMode("register");
                          setWorkerPasswordError("");
                        }}
                        className="text-amber-700 underline font-semibold hover:text-amber-900"
                      >
                        {t("login_register_btn")}
                      </button>
                    </p>
                  </form>
                ) : (
                  /* ── Worker Register Form ── */
                  <form onSubmit={handleWorkerRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="worker-name"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_your_name")}
                      </Label>
                      <Input
                        id="worker-name"
                        data-ocid="worker.name.input"
                        type="text"
                        placeholder={t("login_enter_name")}
                        value={workerName}
                        onChange={(e) => setWorkerName(e.target.value)}
                        className="font-body border-border h-11"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="worker-username"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_username_label")}
                      </Label>
                      <Input
                        id="worker-username"
                        data-ocid="worker.username.input"
                        type="text"
                        placeholder={t("login_choose_username")}
                        value={workerUsername}
                        onChange={(e) => setWorkerUsername(e.target.value)}
                        className="font-body border-border h-11"
                        autoComplete="username"
                        required
                      />
                    </div>

                    <PasswordField
                      id="worker-password"
                      ocid="worker.password.input"
                      value={workerPassword}
                      onChange={handleWorkerPasswordChange}
                      show={showWorkerPassword}
                      onToggleShow={toggleWorkerPassword}
                      error={workerPasswordError}
                      errorOcid="worker.password.error_state"
                      t={t}
                    />

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="worker-skill"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_your_skill")}
                      </Label>
                      <Input
                        id="worker-skill"
                        data-ocid="worker.skill.input"
                        type="text"
                        placeholder={t("login_select_skill")}
                        value={workerSkill}
                        onChange={(e) => setWorkerSkill(e.target.value)}
                        className="font-body border-border h-11"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="worker-location"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        <MapPin className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                        {t("login_location_label")}
                      </Label>
                      <Input
                        id="worker-location"
                        data-ocid="worker.location.input"
                        type="text"
                        placeholder={t("login_enter_city")}
                        value={workerLocation}
                        onChange={(e) => setWorkerLocation(e.target.value)}
                        className="font-body border-border h-11"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="worker-bio"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        {t("login_bio")}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({t("login_optional")})
                        </span>
                      </Label>
                      <Textarea
                        id="worker-bio"
                        data-ocid="worker.bio.textarea"
                        placeholder={t("login_bio_placeholder")}
                        value={workerBio}
                        onChange={(e) => setWorkerBio(e.target.value)}
                        className="font-body border-border resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="worker-contact"
                        className="font-body text-sm font-medium text-foreground"
                      >
                        <Phone className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                        {t("login_contact_number")}
                      </Label>
                      <Input
                        id="worker-contact"
                        data-ocid="worker.contact.input"
                        type="tel"
                        placeholder={t("login_contact_eg")}
                        value={workerContact}
                        onChange={(e) => setWorkerContact(e.target.value)}
                        className="font-body border-border h-11"
                        required
                      />
                    </div>

                    {/* Video Upload — REQUIRED */}
                    <div className="space-y-1.5">
                      <Label className="font-body text-sm font-medium text-foreground">
                        <Video className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                        {t("login_video_profile")}{" "}
                        <span className="text-red-500 font-bold">*</span>{" "}
                        <span className="text-red-500 text-xs font-normal">
                          ({t("login_video_required")})
                        </span>
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/*"
                        className="hidden"
                        onChange={handleVideoSelect}
                      />
                      {workerVideoFile ? (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <Video className="w-5 h-5 text-green-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-green-800 text-sm font-body font-medium truncate">
                              {workerVideoFile.name}
                            </p>
                            <p className="text-green-600 text-xs font-body">
                              {(workerVideoFile.size / (1024 * 1024)).toFixed(
                                1,
                              )}{" "}
                              MB · {t("login_ready_upload")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWorkerVideoFile(null)}
                            className="text-green-600 hover:text-green-800 text-xs font-body underline"
                          >
                            {t("login_remove")}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-ocid="worker.video.upload_button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-20 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center gap-1.5 text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-all group"
                        >
                          <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-body font-medium">
                            {t("login_upload_video")}
                          </span>
                          <span className="text-xs font-body text-red-400 font-medium">
                            ⚠ {t("login_video_required")} ·{" "}
                            {t("login_video_formats")}
                          </span>
                        </button>
                      )}
                    </div>

                    <Button
                      type="submit"
                      data-ocid="worker.submit_button"
                      className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-body font-semibold shadow-lg shadow-amber-600/20 transition-all"
                      disabled={workerLoading}
                    >
                      {workerLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("login_creating_profile")}
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {t("login_register_as_worker")}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs font-body text-amber-700/60">
                      {t("login_already_registered")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setWorkerMode("login");
                          setWorkerPasswordError("");
                        }}
                        className="text-amber-700 underline font-semibold hover:text-amber-900"
                      >
                        {t("login_login_here")}
                      </button>
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-amber-700/50 text-xs font-body mt-5">
          © {new Date().getFullYear()} {t("brand_name")} · {t("nav_subtitle")}
        </p>
      </div>
    </main>
  );
}
