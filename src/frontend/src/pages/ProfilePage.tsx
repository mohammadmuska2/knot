import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Play,
  Share2,
  Shield,
  Star,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CertificationResult } from "../backend.d.ts";
import { useLang } from "../contexts/LanguageContext";
import { addNotificationForUser } from "../contexts/NotificationsContext";
import { useActor } from "../hooks/useActor";
import {
  useEndorseUser,
  useSubmitLearningRequest,
  useUser,
} from "../hooks/useQueries";
import { getAuthUser } from "../utils/auth";
import {
  getBadgeConfig,
  getSkillEmoji,
  getSkillThumbClass,
  getTranslatedSkillName,
} from "../utils/helpers";
import { useDynamicTranslation, DynamicText } from "../utils/dynamicTranslation";
import { getVideoObjectURLWithFallback } from "../utils/videoDB";
import { getAdSettings } from "../components/PopupAd";

export function ProfilePage() {
  const { id } = useParams({ from: "/main/profile/$id" });
  const userId = id ? BigInt(id) : undefined;
  const { t } = useLang();
  const authUser = getAuthUser();
  const authUserRef = useRef(authUser);
  authUserRef.current = authUser;

  const { data: user, isLoading, isError, refetch } = useUser(userId);
  const translatedUserName = useDynamicTranslation(user?.name);
  const translatedUserLocation = useDynamicTranslation(user?.location);
  
  const isCitizen = authUser?.role === "citizen";
  const navigate = useNavigate();
  const { actor } = useActor();

  const endorseMutation = useEndorseUser();
  const submitRequestMutation = useSubmitLearningRequest();

  const [learnModalOpen, setLearnModalOpen] = useState(false);
  const [requesterName, setRequesterName] = useState(authUser?.name ?? "");
  const [learnMessage, setLearnMessage] = useState("");
  const [endorsed, setEndorsed] = useState(false);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load video: try backend first (cross-device), then local IndexedDB/localStorage
  useEffect(() => {
    if (!userId) return;
    let objectUrl: string | null = null;
    let cancelled = false;

    const loadVideo = async () => {
      // 1. Try backend (works on any device)
      if (actor) {
        try {
          const backendDataURI = await actor.getWorkerVideo(userId);
          if (!cancelled && backendDataURI && backendDataURI.length > 10) {
            setVideoObjectUrl(backendDataURI);
            return;
          }
        } catch {
          // fall through
        }
      }

      // 2. Try local IndexedDB + localStorage fallback (same device)
      // ONLY for self-view (worker viewing their own profile)
      const selfView = authUser && authUser.role === 'worker' && authUser.id.toString() === userId?.toString();
      if (selfView) {
        try {
          const url = await getVideoObjectURLWithFallback(userId.toString());
          if (!cancelled && url) {
            objectUrl = url;
            setVideoObjectUrl(url);
          }
        } catch {
          // silently ignore
        }
      }
    };

    loadVideo();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userId, actor]);

  // Query worker's certification (for all viewers — citizen and worker alike)
  const { data: workerCert } = useQuery<CertificationResult | null>({
    queryKey: ["cert", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      // Also check localStorage as a fast/offline fallback
      const localCert = localStorage.getItem(`knot_cert_${userId.toString()}`);
      if (localCert) {
        try {
          return JSON.parse(localCert) as CertificationResult;
        } catch {
          // fall through to backend
        }
      }
      return actor.getCertification(userId);
    },
    enabled: !!userId,
  });

  // Fire a profile_view notification to the WORKER whose profile is being viewed.
  // We intentionally only run this once when the profile id changes, so we read
  // authUser from a ref to avoid re-triggering on every render.
  useEffect(() => {
    if (!userId) return;
    const viewer = authUserRef.current;
    // Don't fire for self-views
    if (viewer && String(viewer.id) === String(userId)) return;
    const viewerName = viewer?.name ?? "Someone";
    addNotificationForUser(userId.toString(), {
      type: "profile_view",
      message: `${viewerName} viewed your profile`,
    });
  }, [userId]);

  async function handleEndorse() {
    if (!userId) return;
    try {
      await endorseMutation.mutateAsync(userId);
      setEndorsed(true);
      await refetch();
      toast.success(t("success_endorsed"));
      // Fire real-time endorsement notification to the endorsed worker
      addNotificationForUser(userId.toString(), {
        type: "endorsement",
        message: `${authUser?.name ?? "Someone"} endorsed your profile`,
      });
    } catch {
      toast.error(t("error_endorse_failed"));
    }
  }

  async function handleSubmitRequest() {
    if (!userId) return;
    if (!requesterName.trim()) {
      toast.error(t("error_enter_name"));
      return;
    }
    if (!learnMessage.trim()) {
      toast.error(t("error_enter_message"));
      return;
    }
    try {
      await submitRequestMutation.mutateAsync({
        requesterId: requesterName.trim(),
        targetUserId: userId,
        message: learnMessage.trim(),
      });
      toast.success(t("success_request_sent"));
      setLearnModalOpen(false);
      // Fire real-time learning request notification to the worker
      if (userId) {
        addNotificationForUser(userId.toString(), {
          type: "learning_request",
          message: `${requesterName.trim()} sent you a learning request`,
        });
      }
      setRequesterName(authUser?.name ?? "");
      setLearnMessage("");
    } catch {
      toast.error(t("error_request_failed"));
    }
  }

  function handleShareProfile() {
    setShareModalOpen(true);
  }

  async function handleCopyLinkOnly() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t("profile_share_copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link. Please copy it manually.");
    }
  }

  async function handleInstagramShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! Share it on your Instagram bio, story, or DM! 📸");
      window.open("https://instagram.com/", "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not copy link. Please copy it manually.");
    }
  }

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            {t("profile_not_found")}
          </h2>
          <p className="text-muted-foreground font-body mb-6">
            {t("profile_not_found_desc")}
          </p>
          <Link to="/">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t("profile_back")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const badge = getBadgeConfig(user.badgeLevel);
  const thumbClass = getSkillThumbClass(user.skill);
  const emoji = getSkillEmoji(user.skill);

  const getYouTubeEmbed = (url: string): string | null => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/,
    );
    return match ? match[1] : null;
  };
  const ytId = getYouTubeEmbed(user.videoURL);

  /* ────────── Citizen simplified view ────────── */
  if (isCitizen) {
    return (
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {/* Back + Share row */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-body group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              {t("profile_back")}
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareProfile}
              className="gap-2 font-body text-sm"
            >
              <Share2 className="w-4 h-4" />
              {t("profile_share")}
            </Button>
          </div>

          <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-5 animate-slide-up">
            {/* Video / Cover */}
            <div
              className={`relative h-64 ${!(ytId || videoObjectUrl || user.videoURL) ? thumbClass : "bg-black"} overflow-hidden`}
            >
              {ytId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}?mute=1&enablejsapi=1`}
                  title={`${translatedUserName}'s skill video`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoObjectUrl ? (
                <video
                  key={videoObjectUrl}
                  className="w-full h-full object-contain"
                  src={videoObjectUrl}
                  muted
                  playsInline
                  controls
                  preload="metadata"
                />
              ) : user.videoURL ? (
                <video
                  className="w-full h-full object-contain"
                  src={user.videoURL}
                  muted
                  playsInline
                  controls
                  preload="metadata"
                />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-15">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 600 256"
                      preserveAspectRatio="xMidYMid slice"
                      aria-hidden="true"
                    >
                      <defs>
                        <pattern
                          id="profileGrid"
                          width="30"
                          height="30"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 30 0 L 0 0 0 30"
                            fill="none"
                            stroke="white"
                            strokeWidth="0.75"
                          />
                        </pattern>
                      </defs>
                      <rect width="600" height="256" fill="url(#profileGrid)" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <p className="text-white text-sm font-body font-medium">
                        No video uploaded by this worker
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Citizen profile info */}
            <div className="p-6">
              {/* Name + Badge */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-xl shrink-0 ${thumbClass} flex items-center justify-center`}
                >
                  <span className="w-9 h-9 flex items-center justify-center shrink-0">{emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h1 className="font-display font-bold text-2xl text-foreground leading-tight flex items-center gap-1.5">
                      {translatedUserName}
                      {user.verified && (
                        <span
                          className="text-sky-500 hover:text-sky-600 transition-colors shrink-0 animate-fade-in"
                          title={t("verified_worker_tooltip" as any) || "Official Verified Worker"}
                        >
                          <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </span>
                      )}
                    </h1>
                    {badge && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}
                      >
                        <span className="text-sm">{badge.icon}</span>
                        {t(`badge_${user.badgeLevel.toLowerCase()}` as any)}{" "}
                        {t("badge_member")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-body">{translatedUserLocation}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-muted rounded-xl p-4 mb-4">
                <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {t("profile_about")}
                </h2>
                <p className="font-body text-foreground text-sm leading-relaxed">
                  {user.bio}
                </p>
              </div>

              {/* Contact */}
              <div className="bg-muted rounded-xl p-4 mb-5">
                <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {t("profile_contact")}
                </h2>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  {user.contact?.trim() ? (
                    <span className="font-body text-foreground text-sm font-medium">
                      {user.contact}
                    </span>
                  ) : (
                    <span className="font-body text-muted-foreground text-sm italic">
                      No contact is provided by the worker
                    </span>
                  )}
                </div>
              </div>

              {/* Request to Learn */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    const settings = getAdSettings();
                    if (settings.provider === "adsterra" && settings.adsterraDirectLink) {
                      window.open(settings.adsterraDirectLink, "_blank", "noopener,noreferrer");
                    }
                    setLearnModalOpen(true);
                  }}
                  className="w-full h-11 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold"
                >
                  <BookOpen className="w-4 h-4" />
                  {t("profile_request_learn")}
                </Button>

                {/* Book for Work button */}
                {user.contact?.trim() ? (
                  <a
                    href={`tel:${user.contact.trim()}`}
                    data-ocid="profile.book_for_work.button"
                    className="w-full h-11 gap-2 bg-green-600 hover:bg-green-700 text-white font-body font-semibold inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => {
                      const settings = getAdSettings();
                      if (settings.provider === "adsterra" && settings.adsterraDirectLink) {
                        window.open(settings.adsterraDirectLink, "_blank", "noopener,noreferrer");
                      }
                      // Fire notification to the worker
                      addNotificationForUser(userId!.toString(), {
                        type: "learning_request",
                        message: `${authUser?.name ?? "Someone"} wants to book you for work`,
                      });
                    }}
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Book for Work — Call {user.contact}
                  </a>
                ) : (
                  <Button
                    disabled
                    className="w-full h-11 gap-2 bg-muted text-muted-foreground font-body font-semibold cursor-not-allowed opacity-60"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Book for Work (No contact provided)
                  </Button>
                )}

                {/* Certification status */}
                {(() => {
                  let certData = workerCert;
                  if (!certData && userId) {
                    const localCert = localStorage.getItem(
                      `knot_cert_${userId.toString()}`,
                    );
                    if (localCert) {
                      try {
                        certData = JSON.parse(localCert) as CertificationResult;
                      } catch {
                        /* ignore */
                      }
                    }
                  }
                  const hasCert = certData?.passed === true;
                  return hasCert ? (
                    <Button
                      variant="outline"
                      className="w-full h-11 gap-2 font-body font-semibold border-amber-400 text-amber-700 hover:bg-amber-50"
                      onClick={() => {
                        localStorage.setItem("knot_view_cert_name", user.name);
                        localStorage.setItem(
                          "knot_view_cert_skill",
                          user.skill,
                        );
                        navigate({ to: "/certificate" as any });
                      }}
                    >
                      <Award className="w-4 h-4" />
                      View Certificate
                    </Button>
                  ) : (
                    <div className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-muted bg-muted/40 text-muted-foreground text-sm font-body font-medium">
                      <Shield className="w-4 h-4" />
                      {t("cert_not_tested")}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Learn request modal */}
        <Dialog open={learnModalOpen} onOpenChange={setLearnModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-xl">
                {t("profile_request_learn")} — {translatedUserName}
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground">
                {t("profile_learn_placeholder")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="font-body font-medium text-sm">
                  {t("profile_your_name")}
                </Label>
                <Input
                  placeholder={t("login_enter_name")}
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="font-body h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body font-medium text-sm">
                  {t("profile_message")}
                </Label>
                <Textarea
                  placeholder={`${t("profile_learn_placeholder")}`}
                  value={learnMessage}
                  onChange={(e) => setLearnMessage(e.target.value)}
                  className="font-body resize-none"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setLearnModalOpen(false)}
                className="font-body"
              >
                {t("profile_cancel")}
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={submitRequestMutation.isPending}
                className="gap-2 bg-primary text-primary-foreground font-body font-semibold"
              >
                {submitRequestMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {submitRequestMutation.isPending
                  ? t("profile_sending")
                  : t("profile_send_request")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Profile modal */}
        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-card overflow-hidden p-6">
            <DialogHeader className="pb-4 border-b border-border">
              <DialogTitle className="font-display font-bold text-xl flex items-center gap-2 text-foreground">
                <Share2 className="w-5 h-5 text-primary" />
                {t("profile_share")}
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground mt-1">
                Share {translatedUserName}'s profile with your network!
              </DialogDescription>
            </DialogHeader>

            {/* Profile Card Preview */}
            <div className="flex items-center gap-3 p-3.5 bg-muted/60 rounded-xl my-4 border border-border/40">
              <div className={`w-12 h-12 rounded-xl shrink-0 ${thumbClass} flex items-center justify-center`}>
                <span className="w-8 h-8 flex items-center justify-center shrink-0">{emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-bold text-sm text-foreground truncate">{translatedUserName}</h4>
                <p className="text-xs text-muted-foreground font-body truncate">
                  <DynamicText text={getTranslatedSkillName(user.skill, t)} /> • {translatedUserLocation}
                </p>
              </div>
            </div>

            {/* Social Icons Grid */}
            <div className="grid grid-cols-3 gap-3 my-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out ${translatedUserName}'s profile on ${t("brand_name")}: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 hover:border-green-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center mb-2 shadow-sm shadow-green-500/30 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold font-body">WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  window.location.href
                )}&text=${encodeURIComponent(`Check out ${translatedUserName}'s profile on KNOT:`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2 shadow-sm shadow-black/30 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold font-body">Twitter / X</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  window.location.href
                )}&text=${encodeURIComponent(`Check out ${translatedUserName}'s profile on KNOT`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:border-sky-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#24A1DE] text-white flex items-center justify-center mb-2 shadow-sm shadow-sky-500/30 group-hover:scale-105 transition-transform">
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.16.92-1.68 7.37-2.45 10.38-.32 1.28-.96 1.42-1.4 1.45-.98.07-1.72-.67-2.67-1.3-1.49-1-2.33-1.62-3.77-2.58-1.66-1.1-1.07-1.7.36-3.19.38-.39 6.9-6.33 7.02-6.86.02-.07.03-.31-.11-.43-.14-.12-.34-.08-.49-.05-.2.05-3.43 2.19-9.69 6.42-.92.63-1.75.94-2.5.92-.83-.02-2.42-.47-3.61-.86-1.46-.48-2.62-.74-2.52-1.56.05-.43.64-.87 1.77-1.32 6.94-3.02 11.57-5.02 13.88-6 6.57-2.79 7.93-3.27 8.82-3.29.2 0 .64.05.93.29.24.2.3.49.33.69-.03.11-.01.27-.02.4z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold font-body">Telegram</span>
              </a>

              {/* Instagram */}
              <button
                onClick={handleInstagramShare}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20 hover:border-pink-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center mb-2 shadow-sm shadow-pink-500/30 group-hover:scale-105 transition-transform">
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.01 4.01 0 110-8.019A4.01 4.01 0 0112 16zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold font-body">Instagram</span>
              </button>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-600/20 hover:border-blue-600/40 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center mb-2 shadow-sm shadow-blue-600/30 group-hover:scale-105 transition-transform">
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold font-body">Facebook</span>
              </a>

              {/* Copy Link */}
              <button
                onClick={handleCopyLinkOnly}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center mb-2 shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                  <Copy className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold font-body">Copy Link</span>
              </button>
            </div>

            {/* URL Input Area */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <div className="relative flex-1">
                <Input
                  readOnly
                  value={window.location.href}
                  className="font-body text-xs pr-20 h-10 bg-muted/40 border-border select-all focus-visible:ring-1"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLinkOnly}
                  className="absolute right-1 top-1 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-3"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  /* ────────── Worker / default full view ────────── */
  return (
    <main className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Back + Share row */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-body group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t("profile_back")}
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareProfile}
            className="gap-2 font-body text-sm"
          >
            <Share2 className="w-4 h-4" />
            {t("profile_share")}
          </Button>
        </div>

        {/* Profile card */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-5 animate-slide-up">
          {/* Cover / Video area */}
          <div
            className={`relative h-64 ${!(ytId || videoObjectUrl || user.videoURL) ? thumbClass : "bg-black"} overflow-hidden`}
          >
            {ytId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${ytId}?mute=1&enablejsapi=1`}
                title={`${translatedUserName}'s skill video`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoObjectUrl ? (
              <video
                key={videoObjectUrl}
                className="w-full h-full object-contain"
                src={videoObjectUrl}
                muted
                playsInline
                controls
                preload="metadata"
              />
            ) : user.videoURL ? (
              <video
                className="w-full h-full object-contain"
                src={user.videoURL}
                muted
                playsInline
                controls
                preload="metadata"
              />
            ) : (
              <>
                <div className="absolute inset-0 opacity-15">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 600 256"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="profileGrid2"
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 30 0 L 0 0 0 30"
                          fill="none"
                          stroke="white"
                          strokeWidth="0.75"
                        />
                      </pattern>
                    </defs>
                    <rect width="600" height="256" fill="url(#profileGrid2)" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <p className="text-white text-sm font-body font-medium">
                      No video uploaded by this worker
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile info */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-xl shrink-0 ${thumbClass} flex items-center justify-center`}
              >
                <span className="w-10 h-10 flex items-center justify-center shrink-0">{emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h1 className="font-display font-bold text-2xl text-foreground leading-tight flex items-center gap-1.5">
                    {translatedUserName}
                    {user.verified && (
                      <span
                        className="text-sky-500 hover:text-sky-600 transition-colors shrink-0 animate-fade-in"
                        title={t("verified_worker_tooltip" as any) || "Official Verified Worker"}
                      >
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </span>
                    )}
                  </h1>
                  {badge && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}
                    >
                      <span className="text-sm">{badge.icon}</span>
                      {t(`badge_${user.badgeLevel.toLowerCase()}` as any)}{" "}
                      {t("badge_member")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-body">{translatedUserLocation}</span>
                </div>
                <Link
                  to="/community/$skill"
                  params={{ skill: user.skill }}
                  className="inline-flex items-center gap-1 text-primary text-sm font-body font-medium hover:underline"
                >
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">{emoji}</span> <DynamicText text={getTranslatedSkillName(user.skill, t)} />{" "}
                  {t("community_link_suffix")}
                </Link>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-muted rounded-xl p-4 mb-5">
              <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {t("profile_about")}
              </h2>
              <p className="font-body text-foreground text-sm leading-relaxed">
                {user.bio}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="font-display font-bold text-2xl text-foreground">
                  {Number(user.trustScore)}
                </div>
                <div className="text-muted-foreground text-xs font-body">
                  {t("profile_trust_score")}
                </div>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                </div>
                <div className="font-display font-bold text-2xl text-foreground">
                  {Number(user.endorsementCount)}
                </div>
                <div className="text-muted-foreground text-xs font-body">
                  {t("profile_endorsements")}
                </div>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Navigation className="w-4 h-4 text-accent" />
                </div>
                <div className="font-display font-bold text-2xl text-foreground">
                  {Number(user.distance)}
                </div>
                <div className="text-muted-foreground text-xs font-body">
                  {t("profile_km_away")}
                </div>
              </div>
            </div>

            {/* Badge progress */}
            <div className="bg-knot-green-muted rounded-xl p-4 mb-6">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">
                {t("profile_badge_progress")}
              </h3>
              <div className="space-y-2">
                {[
                  { level: "Bronze", required: 3, icon: "🥉" },
                  { level: "Silver", required: 7, icon: "🥈" },
                  { level: "Gold", required: 15, icon: "🥇" },
                ].map(({ level, required, icon }) => {
                  const count = Number(user.endorsementCount);
                  const achieved = count >= required;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <span className="text-lg w-6 text-center">{icon}</span>
                      <div className="flex-1 bg-white/60 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            achieved ? "bg-knot-green" : "bg-knot-green/40"
                          }`}
                          style={{
                            width: `${Math.min(100, (count / required) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-body text-foreground/60 w-24 text-right">
                        {achieved ? (
                          <span className="text-knot-green font-semibold">
                            {t("profile_achieved")}
                          </span>
                        ) : (
                          `${count}/${required}`
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons — endorse only for workers viewing another worker */}
            <div className="flex flex-col sm:flex-row gap-3">
              {authUser?.role === "worker" &&
                String(authUser?.id) !== String(userId) && (
                  <Button
                    onClick={handleEndorse}
                    disabled={endorseMutation.isPending || endorsed}
                    className="flex-1 h-11 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold"
                  >
                    {endorseMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : endorsed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <ThumbsUp className="w-4 h-4" />
                    )}
                    {endorseMutation.isPending
                      ? t("profile_endorsing")
                      : endorsed
                        ? t("profile_endorsed")
                        : `${t("profile_endorse")} ${user.name.split(" ")[0]}`}
                  </Button>
                )}

              <Button
                variant="outline"
                onClick={() => setLearnModalOpen(true)}
                className={`h-11 gap-2 border-border hover:bg-accent hover:text-accent-foreground font-body font-semibold ${
                  authUser?.role !== "citizen" ? "flex-1" : "w-full"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {t("profile_request_learn")}
              </Button>
            </div>

            {/* Certification button — always visible */}
            {(() => {
              // Check localStorage first (fast/offline), then fall back to query result
              let certData = workerCert;
              if (!certData && userId) {
                const localCert = localStorage.getItem(
                  `knot_cert_${userId.toString()}`,
                );
                if (localCert) {
                  try {
                    certData = JSON.parse(localCert) as CertificationResult;
                  } catch {
                    // ignore
                  }
                }
              }
              const hasCert = certData?.passed === true;
              return (
                <div className="mt-3">
                  {hasCert ? (
                    <Button
                      className="w-full h-11 gap-2 font-body font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25"
                      onClick={() => {
                        localStorage.setItem("knot_view_cert_name", user.name);
                        localStorage.setItem(
                          "knot_view_cert_skill",
                          user.skill,
                        );
                        navigate({ to: "/certificate" as any });
                      }}
                    >
                      <Award className="w-4 h-4" />
                      View Certificate
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full h-11 gap-2 font-body font-semibold border-muted text-muted-foreground cursor-not-allowed opacity-60"
                    >
                      <Shield className="w-4 h-4" />
                      Not Certified Yet
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Learn request modal */}
      <Dialog open={learnModalOpen} onOpenChange={setLearnModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">
              {t("profile_request_learn")} — {translatedUserName}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              {t("profile_learn_placeholder")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-body font-medium text-sm">
                {t("profile_your_name")}
              </Label>
              <Input
                placeholder={t("login_enter_name")}
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="font-body h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-body font-medium text-sm">
                {t("profile_message")}
              </Label>
              <Textarea
                placeholder={`${t("profile_learn_placeholder")}`}
                value={learnMessage}
                onChange={(e) => setLearnMessage(e.target.value)}
                className="font-body resize-none"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setLearnModalOpen(false)}
              className="font-body"
            >
              {t("profile_cancel")}
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={submitRequestMutation.isPending}
              className="gap-2 bg-primary text-primary-foreground font-body font-semibold"
            >
              {submitRequestMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {submitRequestMutation.isPending
                ? t("profile_sending")
                : t("profile_send_request")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Profile modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-card overflow-hidden p-6">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="font-display font-bold text-xl flex items-center gap-2 text-foreground">
              <Share2 className="w-5 h-5 text-primary" />
              {t("profile_share")}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground mt-1">
              Share {translatedUserName}'s profile with your network!
            </DialogDescription>
          </DialogHeader>

          {/* Profile Card Preview */}
          <div className="flex items-center gap-3 p-3.5 bg-muted/60 rounded-xl my-4 border border-border/40">
            <div className={`w-12 h-12 rounded-xl shrink-0 ${thumbClass} flex items-center justify-center text-xl`}>
              {emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display font-bold text-sm text-foreground truncate">{translatedUserName}</h4>
              <p className="text-xs text-muted-foreground font-body truncate">
                <DynamicText text={getTranslatedSkillName(user.skill, t)} /> • {translatedUserLocation}
              </p>
            </div>
          </div>

          {/* Social Icons Grid */}
          <div className="grid grid-cols-3 gap-3 my-2">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Check out ${translatedUserName}'s profile on ${t("brand_name")}: ${window.location.href}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 hover:border-green-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center mb-2 shadow-sm shadow-green-500/30 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <span className="text-xs font-semibold font-body">WhatsApp</span>
            </a>

            {/* Twitter / X */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                window.location.href
              )}&text=${encodeURIComponent(`Check out ${translatedUserName}'s profile on KNOT:`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2 shadow-sm shadow-black/30 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-xs font-semibold font-body">Twitter / X</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(
                window.location.href
              )}&text=${encodeURIComponent(`Check out ${translatedUserName}'s profile on KNOT`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:border-sky-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#24A1DE] text-white flex items-center justify-center mb-2 shadow-sm shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.16.92-1.68 7.37-2.45 10.38-.32 1.28-.96 1.42-1.4 1.45-.98.07-1.72-.67-2.67-1.3-1.49-1-2.33-1.62-3.77-2.58-1.66-1.1-1.07-1.7.36-3.19.38-.39 6.9-6.33 7.02-6.86.02-.07.03-.31-.11-.43-.14-.12-.34-.08-.49-.05-.2.05-3.43 2.19-9.69 6.42-.92.63-1.75.94-2.5.92-.83-.02-2.42-.47-3.61-.86-1.46-.48-2.62-.74-2.52-1.56.05-.43.64-.87 1.77-1.32 6.94-3.02 11.57-5.02 13.88-6 6.57-2.79 7.93-3.27 8.82-3.29.2 0 .64.05.93.29.24.2.3.49.33.69-.03.11-.01.27-.02.4z" />
                </svg>
              </div>
              <span className="text-xs font-semibold font-body">Telegram</span>
            </a>

            {/* Instagram */}
            <button
              onClick={handleInstagramShare}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20 hover:border-pink-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center mb-2 shadow-sm shadow-pink-500/30 group-hover:scale-105 transition-transform">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.01 4.01 0 110-8.019A4.01 4.01 0 0112 16zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <span className="text-xs font-semibold font-body">Instagram</span>
            </button>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-600/20 hover:border-blue-600/40 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center mb-2 shadow-sm shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-xs font-semibold font-body">Facebook</span>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopyLinkOnly}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center mb-2 shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <Copy className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold font-body">Copy Link</span>
            </button>
          </div>

          {/* URL Input Area */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <div className="relative flex-1">
              <Input
                readOnly
                value={window.location.href}
                className="font-body text-xs pr-20 h-10 bg-muted/40 border-border select-all focus-visible:ring-1"
              />
              <Button
                size="sm"
                onClick={handleCopyLinkOnly}
                className="absolute right-1 top-1 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-3"
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
