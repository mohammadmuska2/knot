import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Camera,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Shield,
  Star,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Upload,
  User,
  Video,
  X,
  Square,
  RotateCcw,
  Check,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import type { CertificationResult, LearningRequest } from "../backend.d.ts";
import { PopupAd } from "../components/PopupAd";
import { useLang } from "../contexts/LanguageContext";
import { useActor } from "../hooks/useActor";
import { getAuthUser } from "../utils/auth";
import { api } from "../utils/api";
import { getBadgeConfig, getSkillEmoji } from "../utils/helpers";
import { deleteVideoBlob, getVideoObjectURL, saveVideoBlob, getVideoBlob } from "../utils/videoDB";


function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-0.5">
              {label}
            </p>
            <p className="font-display font-bold text-2xl text-foreground leading-none">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkerDashboardPage() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const { actor, isFetching } = useActor();
  const { t } = useLang();

  useEffect(() => {
    if (!authUser || authUser.role !== "worker") {
      navigate({ to: "/login" });
    }
  }, [authUser, navigate]);

  const workerId = authUser?.id;

  // NOTE: Auto-sync removed — it was creating duplicate worker registrations
  // with inflated IDs every time getWorkerStats failed. Workers are registered
  // once during the normal LoginPage registration flow.



  const { data: workerData } = useQuery({
    queryKey: ["worker-stats", workerId?.toString()],
    queryFn: async () => {
      if (workerId === undefined) return null;
      // Try REST API first
      try {
        const restData = await api.getWorkerStats(Number(workerId));
        if (restData) return restData;
      } catch { /* fall through */ }
      // Fallback: actor
      if (actor) {
        try { return await actor.getWorkerStats(workerId); } catch { /* ignore */ }
      }
      return null;
    },
    enabled: workerId !== undefined,
    staleTime: 1000 * 30,
  });

  const { data: learningRequests, isLoading: reqLoading } = useQuery<
    LearningRequest[]
  >({
    queryKey: ["worker-requests", workerId?.toString()],
    queryFn: async () => {
      if (workerId === undefined) return [];
      // Try REST API first
      try {
        const restReqs = await api.getLearningRequestsForWorker(Number(workerId));
        if (restReqs) return restReqs as any;
      } catch { /* fall through */ }
      // Fallback: actor
      if (actor) {
        try { return await actor.getLearningRequestsForWorker(workerId); } catch { /* ignore */ }
      }
      return [];
    },
    enabled: workerId !== undefined,
    staleTime: 1000 * 30,
  });

  // Check localStorage for cert status (pending_review / failed / none)
  const workerIdStr = workerId?.toString();
  const certStatusLS = workerIdStr
    ? localStorage.getItem(`knot_cert_status_${workerIdStr}`)
    : null;
  const certMcqLS = workerIdStr
    ? localStorage.getItem(`knot_cert_mcq_${workerIdStr}`)
    : null;

  const { data: certification, isLoading: isCertLoading } = useQuery<CertificationResult | null>({
    queryKey: ["certification", workerIdStr],
    queryFn: async () => {
      // Check if admin approved via localStorage flag
      if (workerIdStr) {
        const approved = localStorage.getItem(
          `knot_cert_approved_${workerIdStr}`,
        );
        if (approved === "true") {
          localStorage.setItem("knot_cert_passed", "true");
        }
      }

      // Try REST API certification first
      if (workerId !== undefined) {
        try {
          const restCert = await api.getCertification(Number(workerId));
          if (restCert) {
            if (restCert.passed && workerIdStr) {
              localStorage.setItem("knot_cert_passed", "true");
              localStorage.setItem(`knot_cert_status_${workerIdStr}`, "approved");
            }
            return {
              workerId: BigInt(restCert.workerId),
              skill: restCert.skill ?? "",
              level: restCert.level ?? "Basic",
              passed: !!restCert.passed,
              issuedDate: BigInt(restCert.issuedDate ?? 0),
              certificateId: restCert.certificateId ?? "",
              mcqScore: BigInt(restCert.mcqScore ?? 0),
              practicalPassed: !!restCert.practicalPassed,
            } as CertificationResult;
          }
        } catch { /* fall through */ }

        // Check REST practical video status
        try {
          const pvStatus = await api.getPracticalVideoStatus(Number(workerId));
          if (pvStatus === "approved" && workerIdStr) {
            localStorage.setItem("knot_cert_passed", "true");
            localStorage.setItem(`knot_cert_approved_${workerIdStr}`, "true");
            localStorage.setItem(`knot_cert_status_${workerIdStr}`, "approved");
          }
        } catch { /* ignore */ }
      }

      // Also try actor backend
      if (actor && workerId !== undefined) {
        try {
          const backendCert = await actor.getCertification(workerId);
          if (backendCert) {
            if (backendCert.passed && workerIdStr) {
              localStorage.setItem("knot_cert_passed", "true");
              localStorage.setItem(`knot_cert_status_${workerIdStr}`, "approved");
            }
            return backendCert;
          }
        } catch { /* fall through */ }

        try {
          const pvStatus = await actor.getPracticalVideoStatus(workerId);
          if (pvStatus === "approved" && workerIdStr) {
            localStorage.setItem("knot_cert_passed", "true");
            localStorage.setItem(`knot_cert_approved_${workerIdStr}`, "true");
            localStorage.setItem(`knot_cert_status_${workerIdStr}`, "approved");
          }
        } catch { /* ignore */ }
      }

      // Fallback: read from localStorage (set by CertificationTestPage on submit)
      const localKey = `knot_cert_${workerIdStr}`;
      const raw = localStorage.getItem(localKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          return {
            workerId: BigInt(parsed.workerId ?? workerId ?? 0),
            skill: parsed.skill ?? "",
            level: parsed.level ?? "Basic",
            passed: !!parsed.passed,
            issuedDate: BigInt(parsed.issuedDate ?? 0),
            certificateId: parsed.certificateId ?? "",
            mcqScore: BigInt(parsed.mcqScore ?? 0),
            practicalPassed: !!parsed.practicalPassed,
          } as CertificationResult;
        } catch {
          return null;
        }
      }
      return null;
    },
    enabled: workerId !== undefined,
    staleTime: 1000 * 30,
    retry: 2,
    retryDelay: 2000,
  });

  // Custom camera recording state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recordedURL, setRecordedURL] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<any>(null);

  const startCameraStream = async () => {
    try {
      setRecordedChunks([]);
      setRecordedURL(null);
      setRecordedBlob(null);
      setRecordDuration(0);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });

      setStream(mediaStream);
      // Wait a tiny bit for the modal and element to render, then bind
      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Webcam access error:", err);
      toast.error("Unable to access camera or microphone: " + err.message);
      setIsRecordModalOpen(false);
    }
  };

  const handleOpenRecordModal = () => {
    setIsRecordModalOpen(true);
    startCameraStream();
  };

  const handleStartRecording = () => {
    if (!stream) return;

    const options = { mimeType: "video/webm;codecs=vp9,opus" };
    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch {
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      } catch {
        mediaRecorder = new MediaRecorder(stream);
      }
    }

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordedURL(url);
    };

    setRecordedChunks([]);
    setRecorder(mediaRecorder);
    setIsRecording(true);
    setRecordDuration(0);

    mediaRecorder.start(10); // Capture data every 10ms slice

    durationIntervalRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (recorder && isRecording) {
      recorder.stop();
      setIsRecording(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setRecorder(null);
    setIsRecording(false);
  };

  const handleCloseRecordModal = () => {
    stopCameraStream();
    setIsRecordModalOpen(false);
  };

  const handleRetake = () => {
    setRecordedURL(null);
    setRecordedBlob(null);
    setRecordDuration(0);
    startCameraStream();
  };

  const handleSaveRecordedVideo = async () => {
    if (!recordedBlob) return;

    const workerIdStr = localStorage.getItem("knot_worker_id") ?? authUser?.id?.toString();
    if (!workerIdStr) {
      toast.error("User context missing. Please log in again.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Saving recorded video...");
    handleCloseRecordModal();

    try {
      // 1. Save video blob to IndexedDB (no size limit)
      await saveVideoBlob(workerIdStr, recordedBlob);

      // 2. Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(recordedBlob);
      setVideoURL(previewUrl);

      // 3. Convert to base64 and upload via REST API + actor fallback
      const base64DataURI = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(recordedBlob);
      });

      // 3a. REST API (primary)
      try {
        await api.saveWorkerVideo(Number(workerIdStr), base64DataURI);
        await api.submitPracticalVideo(
          Number(workerIdStr),
          authUser?.name ?? "Worker",
          authUser?.skill ?? "General",
          base64DataURI,
        );
      } catch (restErr: any) {
        console.warn("REST video upload failed:", restErr);
        toast.error("Warning: Could not upload video to backend (" + (restErr.message || String(restErr)) + ")");
      }

      // 3b. Save practical submission to localStorage for local fallback
      try {
        localStorage.setItem(
          `knot_practical_submission_${workerIdStr}`,
          JSON.stringify({
            workerId: workerIdStr,
            workerName: authUser?.name ?? "Worker",
            skill: authUser?.skill ?? "General",
            videoDataURI: base64DataURI,
            status: "pending",
            submittedAt: Date.now(),
          }),
        );
      } catch { /* ignore quota errors */ }

      // 3c. Actor fallback
      if (actor && workerId !== undefined) {
        try {
          await actor.saveWorkerVideo(workerId, base64DataURI);
        } catch (uploadErr) {
          console.warn("Actor video upload failed:", uploadErr);
        }
      }

      toast.success("Video recorded and uploaded successfully! 🎉", { id: toastId });
    } catch (err) {
      console.error("Recorded video processing error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save recorded video: ${errMsg}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const [videoURL, setVideoURL] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    // Warn if file is very large (> 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.warning("Large video detected. Upload may take a moment...");
    }

    const workerIdStr = localStorage.getItem("knot_worker_id") ?? authUser?.id?.toString();
    if (!workerIdStr) {
      toast.error("User context missing. Please log in again.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Saving video...");

    try {
      // 1. Save video file to IndexedDB (no size limit)
      await saveVideoBlob(workerIdStr, file);

      // 2. Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setVideoURL(previewUrl);

      // 3. Convert to base64
      const base64DataURI = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 3a. REST API (primary) — saves video + submits for admin verification
      try {
        await api.saveWorkerVideo(Number(workerIdStr), base64DataURI);
        await api.submitPracticalVideo(
          Number(workerIdStr),
          authUser?.name ?? "Worker",
          authUser?.skill ?? "General",
          base64DataURI,
        );
      } catch (restErr: any) {
        console.warn("REST video upload failed:", restErr);
        toast.error("Warning: Could not upload video to backend (" + (restErr.message || String(restErr)) + ")");
      }

      // 3b. Save practical submission to localStorage for local fallback
      try {
        localStorage.setItem(
          `knot_practical_submission_${workerIdStr}`,
          JSON.stringify({
            workerId: workerIdStr,
            workerName: authUser?.name ?? "Worker",
            skill: authUser?.skill ?? "General",
            videoDataURI: base64DataURI,
            status: "pending",
            submittedAt: Date.now(),
          }),
        );
      } catch { /* ignore quota errors */ }

      // 3c. Actor fallback
      if (actor && workerId !== undefined) {
        try {
          await actor.saveWorkerVideo(workerId, base64DataURI);
        } catch (uploadErr) {
          console.warn("Actor video upload failed:", uploadErr);
        }
      }

      toast.success("Video uploaded successfully! 🎉", { id: toastId });
    } catch (err) {
      console.error("Video processing error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save video: ${errMsg}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoDelete = async () => {
    const workerIdStr = localStorage.getItem("knot_worker_id") ?? authUser?.id?.toString();
    if (!workerIdStr) return;

    if (!window.confirm("Are you sure you want to delete your introduction video?")) return;

    setIsUploading(true);
    const toastId = toast.loading("Deleting video...");

    try {
      try {
        await deleteVideoBlob(workerIdStr);
      } catch (idbErr) {
        console.warn("Failed to delete video from IndexedDB:", idbErr);
      }
      setVideoURL("");

      if (actor && workerId !== undefined) {
        await actor.saveWorkerVideo(workerId, "");
      }
      toast.success("Video deleted successfully!", { id: toastId });
    } catch (err) {
      console.error("Video deletion error:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to delete video: ${errMsg}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Load video: try backend first (cross-device), then IndexedDB, then session blob
  useEffect(() => {
    const workerIdStr =
      localStorage.getItem("knot_worker_id") ?? authUser?.id?.toString();
    if (!workerIdStr) {
      const sessionUrl =
        localStorage.getItem("knot_worker_video_preview_url") ?? "";
      setVideoURL(sessionUrl);
      return;
    }

    let objectUrl: string | null = null;

    const loadVideo = async () => {
      // 0. Try REST API first (reliable, cross-device)
      if (workerId !== undefined) {
        try {
          const restVideo = await api.getWorkerVideo(Number(workerId));
          if (restVideo && restVideo.dataURI && restVideo.dataURI.length > 10) {
            setVideoURL(restVideo.dataURI);
            return;
          }
        } catch { /* fall through */ }
      }

      // 1. Try actor backend (ICP canister)
      if (actor && workerId !== undefined) {
        try {
          const backendDataURI = await actor.getWorkerVideo(workerId);
          if (backendDataURI && backendDataURI.length > 10) {
            setVideoURL(backendDataURI);
            return;
          }
        } catch (err) {
          console.warn(
            "Backend video fetch failed, falling back to local:",
            err,
          );
        }
      }

      // 2. Try IndexedDB (same device, persisted)
      try {
        const url = await getVideoObjectURL(workerIdStr);
        if (url) {
          objectUrl = url;
          setVideoURL(url);
          return;
        }
      } catch {
        // fall through
      }

      // 3. Fall back to base64 localStorage copy
      const b64 = localStorage.getItem(`knot_video_b64_${workerIdStr}`);
      if (b64) {
        setVideoURL(b64);
        return;
      }

      // 4. Last resort: session blob URL
      const sessionUrl =
        localStorage.getItem("knot_worker_video_preview_url") ?? "";
      setVideoURL(sessionUrl);
    };

    loadVideo();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [authUser?.id, actor, workerId]);

  if (!authUser || authUser.role !== "worker") {
    return null;
  }

  const badgeConfig = workerData ? getBadgeConfig(workerData.badgeLevel) : null;
  const skillEmoji = workerData ? getSkillEmoji(workerData.skill) : "⚒️";

  const badgeLevelDisplay = workerData?.badgeLevel ?? "—";
  const trustScore = workerData ? Number(workerData.trustScore) : 0;
  const endorsementCount = workerData ? Number(workerData.endorsementCount) : 0;

  if (isCertLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isPending = !certification || !certification.passed;

  if (isPending) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-900 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
        <div className="w-full max-w-lg p-8 md:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center gap-6">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

          {/* Glowing Header Graphic */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
            <Clock className="w-10 h-10" />
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/20 animate-[spin_20s_linear_infinite]" />
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">
              {t("dashboard_pending_title") || "Registration Pending"}
            </h1>
            <p className="text-zinc-400 font-body text-sm leading-relaxed max-w-sm mx-auto">
              {t("dashboard_pending_desc") || "Your registration is currently under review by our administration team. Please wait a moment while we verify your skill introduction video."}
            </p>
          </div>

          {/* Step Progress Tracker */}
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 text-left">
            <h3 className="text-zinc-500 font-body font-semibold text-xs uppercase tracking-wider">
              Verification Progress
            </h3>

            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 text-green-500 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-zinc-200 leading-none">
                    Account Registered
                  </p>
                  <p className="font-body text-xs text-zinc-500 mt-1">
                    Your profile details are successfully configured
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 text-green-500 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-zinc-200 leading-none">
                    Practical Skill Video Uploaded
                  </p>
                  <p className="font-body text-xs text-zinc-500 mt-1">
                    Introduction video is securely saved on our server
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
                  <Clock className="w-3 h-3 animate-spin" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-amber-400 leading-none">
                    Administrator Review
                  </p>
                  <p className="font-body text-xs text-zinc-400 mt-1">
                    The admin team is reviewing your practical skill video to enable public listings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-body font-semibold gap-2 h-11 rounded-xl shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
              {t("dashboard_refresh_status") || "Refresh Status"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:text-white text-zinc-300 font-body font-semibold h-11 rounded-xl transition-all active:scale-[0.98]"
              onClick={() => {
                localStorage.removeItem("knot_auth_token");
                localStorage.removeItem("knot_jwt_token");
                localStorage.removeItem("knot_user");
                localStorage.removeItem("knot_worker_id");
                window.location.href = "/login";
              }}
            >
              {t("dashboard_log_out") || "Log Out"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-background">
      <PopupAd />
      {/* Dashboard Header */}
      <div className="bg-navy py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center ring-2 ring-white/20 shrink-0">
              <span className="w-10 h-10 flex items-center justify-center shrink-0">{skillEmoji}</span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display font-bold text-2xl text-white">
                  {authUser.name}
                </h1>
                {badgeConfig && workerData && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-body font-semibold border ${badgeConfig.className}`}
                  >
                    {badgeConfig.icon}{" "}
                    {t(`badge_${workerData.badgeLevel.toLowerCase()}` as any)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-white/60 text-sm font-body">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {authUser.skill ?? workerData?.skill ?? "—"}
                </span>
                {workerData?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {workerData.location}
                  </span>
                )}
              </div>
            </div>

            {/* Worker badge */}
            <div className="shrink-0">
              <Badge className="bg-white/20 text-white border-white/30 font-body text-xs px-3 py-1.5">
                {t("dashboard_title")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Separator />

        {/* Stats Row */}
        <section>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            {t("dashboard_your_stats")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={TrendingUp}
              label={t("dashboard_trust_score")}
              value={trustScore}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              icon={ThumbsUp}
              label={t("dashboard_endorsements")}
              value={endorsementCount}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              icon={Award}
              label={t("dashboard_badge_level")}
              value={badgeLevelDisplay}
              color="bg-amber-100 text-amber-600"
            />
          </div>

          {/* Badge progress bar */}
          {workerData && (
            <div className="mt-4 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-sm text-muted-foreground">
                  {t("dashboard_badge_progress")}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {endorsementCount} {t("dashboard_endorsements_count")}
                </p>
              </div>
              <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (endorsementCount / 15) * 100)}%`,
                    background:
                      endorsementCount >= 15
                        ? "oklch(0.75 0.18 75)"
                        : endorsementCount >= 7
                          ? "oklch(0.62 0.02 260)"
                          : "oklch(0.65 0.14 55)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {[
                  { labelKey: "badge_bronze" as const, icon: "🥉", count: 3 },
                  { labelKey: "badge_silver" as const, icon: "🥈", count: 7 },
                  { labelKey: "badge_gold" as const, icon: "🥇", count: 15 },
                ].map(({ labelKey, icon, count }) => (
                  <span
                    key={labelKey}
                    className={`text-xs font-body ${endorsementCount >= count
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground"
                      }`}
                  >
                    {icon} {t(labelKey)} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <Separator />

        {/* Video Section */}
        <section>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-500" />
            {t("dashboard_video_title")}
          </h2>

          <input
            type="file"
            id="video-file-upload"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
            disabled={isUploading}
          />
          <input
            type="file"
            id="video-camera-capture"
            accept="video/*"
            capture="user"
            className="hidden"
            onChange={handleVideoUpload}
            disabled={isUploading}
          />

          {videoURL ? (
            <Card className="overflow-hidden border border-border shadow-sm">
              <div className="relative bg-black aspect-video">
                <video
                  src={videoURL}
                  controls
                  className="w-full h-full object-contain"
                >
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <CardContent className="py-3 flex items-center justify-between border-t border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-body text-muted-foreground">
                    {t("dashboard_video_live")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => document.getElementById("video-file-upload")?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Upload Video
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={handleOpenRecordModal}
                    disabled={isUploading}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Record Camera
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={handleVideoDelete}
                    disabled={isUploading}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-amber-300 bg-amber-50/40">
              <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
                  <Video className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-base">
                    {t("dashboard_no_video")}
                  </p>
                  <p className="text-muted-foreground font-body text-xs mt-1 max-w-sm mx-auto">
                    Introduction videos build trust and help citizens find your service. Upload a video or capture one using your camera now!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
                  <Button
                    onClick={() => document.getElementById("video-file-upload")?.click()}
                    disabled={isUploading}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-body font-semibold gap-2 h-10 px-5 shadow-sm"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload Video File
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleOpenRecordModal}
                    disabled={isUploading}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50/80 font-body font-semibold gap-2 h-10 px-5"
                  >
                    <Camera className="w-4 h-4" />
                    Record with Camera
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Custom Webcam Recording Modal */}
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <Card className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-zinc-800 flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-red-500 ${isRecording ? "animate-ping" : ""}`} />
                  {isRecording ? "Recording in Progress..." : recordedURL ? "Review Pitch Video" : "Record Your Pitch"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  onClick={handleCloseRecordModal}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 bg-black aspect-video relative flex items-center justify-center">
                {recordedURL ? (
                  <video
                    src={recordedURL}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain scale-x-[-1]"
                  />
                )}

                {/* Timer/Duration Overlay */}
                {(isRecording || recordedURL) && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                    <div className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isRecording ? "animate-pulse" : ""}`} />
                    {Math.floor(recordDuration / 60).toString().padStart(2, "0")}:
                    {(recordDuration % 60).toString().padStart(2, "0")}
                  </div>
                )}
              </CardContent>

              {/* Modal Controls */}
              <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
                <div className="text-zinc-400 text-xs font-body max-w-[280px]">
                  {!recordedURL && !isRecording && "Position yourself in front of the camera and click start when ready."}
                  {isRecording && "Speak clearly into your microphone. Keep it under 1 minute."}
                  {recordedURL && "Watch your pitch video back. Save it if you are satisfied!"}
                </div>
                <div className="flex items-center gap-3">
                  {!recordedURL ? (
                    !isRecording ? (
                      <Button
                        onClick={handleStartRecording}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold font-body h-10 px-5 gap-2 shadow-lg"
                      >
                        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopRecording}
                        className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold font-body h-10 px-5 gap-2 shadow-lg"
                      >
                        <Square className="w-4 h-4 fill-zinc-950" />
                        Stop Recording
                      </Button>
                    )
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleRetake}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white font-semibold font-body h-10 px-5 gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retake
                      </Button>
                      <Button
                        onClick={handleSaveRecordedVideo}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold font-body h-10 px-5 gap-2 shadow-lg"
                      >
                        <Check className="w-4 h-4" />
                        Save & Upload
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )/* Custom Webcam Recording Modal */}

        <Separator />

        {/* Learning Requests */}
        <section>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            {t("dashboard_requests_title")}
            {learningRequests && learningRequests.length > 0 && (
              <span className="ml-1 bg-amber-600 text-white text-xs font-body font-bold px-2 py-0.5 rounded-full">
                {learningRequests.length}
              </span>
            )}
          </h2>

          {reqLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : !learningRequests || learningRequests.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
                <div className="text-5xl">📬</div>
                <div>
                  <p className="font-display font-semibold text-foreground text-base">
                    {t("dashboard_no_requests")}
                  </p>
                  <p className="text-muted-foreground font-body text-sm mt-1">
                    {t("dashboard_requests_hint")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {learningRequests.map((req) => (
                <Card
                  key={req.id.toString()}
                  className="border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="font-body font-semibold text-sm text-foreground">
                            {req.requesterId}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Request #{req.id.toString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="font-body text-xs shrink-0"
                      >
                        {t("dashboard_pending")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-muted-foreground font-body text-sm leading-relaxed bg-muted rounded-lg px-3 py-2.5">
                      "{req.message}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Bio section if available */}
        {workerData?.bio && (
          <>
            <Separator />
            <section>
              <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                {t("dashboard_about_you")}
              </h2>
              <Card className="border border-border">
                <CardContent className="py-4">
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {workerData.bio}
                  </p>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
