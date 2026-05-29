import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  LogOut,
  RefreshCw,
  Trash2,
  Users,
  Video,
  FileText,
  Shield,
  Activity,
  Play,
  Check,
  CheckCircle,
  X,
  MapPin,
  Mail,
  Award,
  Search,
  Globe,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLang } from "../contexts/LanguageContext";
import { LANGUAGE_OPTIONS, type LangCode } from "../utils/translations";
import { getAuthUser } from "../utils/auth";
import { api } from "../utils/api";
import { useDynamicTranslation } from "../utils/dynamicTranslation";
import { getAdSettings, saveAdSettings, type AdSettings } from "../components/PopupAd";

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
    <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="font-sans font-bold text-3xl text-foreground leading-none">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DynamicText({ text }: { text: string }) {
  const translated = useDynamicTranslation(text);
  return <span className="font-medium">{translated}</span>;
}

function BadgePill({ level }: { level?: string }) {
  const { t } = useLang();
  
  const safeLevel = level || "none";
  let color = "bg-slate-100 text-slate-800";
  if (safeLevel.toLowerCase() === "bronze") color = "bg-amber-100 text-amber-800";
  if (safeLevel.toLowerCase() === "silver") color = "bg-slate-200 text-slate-700";
  if (safeLevel.toLowerCase() === "gold") color = "bg-yellow-100 text-yellow-800";
  if (safeLevel.toLowerCase() === "platinum") color = "bg-indigo-100 text-indigo-800";

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {t(("badge_" + safeLevel.toLowerCase()) as any) || safeLevel}
    </span>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const queryClient = useQueryClient();
  const { lang, setLang, t } = useLang();
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Ad Settings State
  const [adProvider, setAdProvider] = useState<"fallback" | "propeller" | "adsterra">("fallback");
  const [propellerZoneId, setPropellerZoneId] = useState("");
  const [adsterraPopunder, setAdsterraPopunder] = useState("");
  const [adsterraSocialBar, setAdsterraSocialBar] = useState("");
  const [adsterraBanner728, setAdsterraBanner728] = useState("");
  const [adsterraBanner300, setAdsterraBanner300] = useState("");
  const [adsterraDirectLink, setAdsterraDirectLink] = useState("");

  // Load initial settings
  useEffect(() => {
    const settings = getAdSettings();
    setAdProvider(settings.provider);
    setPropellerZoneId(settings.propellerZoneId);
    setAdsterraPopunder(settings.adsterraPopunderUrl);
    setAdsterraSocialBar(settings.adsterraSocialBarUrl);
    setAdsterraBanner728(settings.adsterraBannerKey728x90);
    setAdsterraBanner300(settings.adsterraBannerKey300x250);
    setAdsterraDirectLink(settings.adsterraDirectLink);
  }, []);

  const handleSaveAdSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdSettings = {
      provider: adProvider,
      propellerZoneId: propellerZoneId.trim(),
      adsterraPopunderUrl: adsterraPopunder.trim(),
      adsterraSocialBarUrl: adsterraSocialBar.trim(),
      adsterraBannerKey728x90: adsterraBanner728.trim(),
      adsterraBannerKey300x250: adsterraBanner300.trim(),
      adsterraDirectLink: adsterraDirectLink.trim(),
    };
    saveAdSettings(updated);
    toast.success(t("admin_ads_save_success") || "Ad configuration updated successfully");
  };

  useEffect(() => {
    if (!authUser || authUser.role !== "admin") {
      navigate({ to: "/login" });
    }
  }, [authUser, navigate]);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.getAdminStats(),
    staleTime: 1000 * 60,
  });

  const { data: workers = [], refetch: refetchWorkers } = useQuery({
    queryKey: ["admin-workers"],
    queryFn: () => api.getAllUsers(true),
  });

  const { data: citizens = [], refetch: refetchCitizens } = useQuery({
    queryKey: ["admin-citizens"],
    queryFn: () => api.getAllCitizens(),
  });

  const { data: learningRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => api.getLearningRequests(),
  });

  const { data: practicalSubmissions = [], refetch: refetchVideos } = useQuery({
    queryKey: ["admin-practical-pending"],
    queryFn: () => api.getPendingPracticalVideos(),
  });

  const handleRefresh = () => {
    refetchStats();
    refetchWorkers();
    refetchCitizens();
    refetchRequests();
    refetchVideos();
    toast.success("Dashboard refreshed");
  };

  const handleClearData = async () => {
    if (confirm(t("admin_clear_warning") || "Are you sure you want to clear all platform data? This is irreversible.")) {
      try {
        await api.clearAllData();
        toast.success("Platform data cleared");
        handleRefresh();
      } catch (err: any) {
        toast.error("Failed to clear data: " + err.message);
      }
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approvePracticalVideo(id);
      toast.success("Worker approved!");
      handleRefresh();
    } catch (e: any) {
      toast.error("Failed to approve: " + e.message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectPracticalVideo(id);
      toast.success("Worker rejected.");
      handleRefresh();
    } catch (e: any) {
      toast.error("Failed to reject: " + e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("knot_auth_token");
    localStorage.removeItem("knot_jwt_token");
    localStorage.removeItem("knot_user");
    window.location.href = "/";
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Are you sure you want to delete this worker? This action is permanent.")) {
      try {
        await api.deleteUser(id);
        toast.success("Worker deleted successfully");
        handleRefresh();
      } catch (err: any) {
        toast.error("Failed to delete worker: " + err.message);
      }
    }
  };

  const handleToggleVerification = async (user: any) => {
    try {
      const newStatus = !user.verified;
      await api.toggleUserVerification(Number(user.id), newStatus);
      toast.success(newStatus ? `${user.name} is now verified!` : `Verification for ${user.name} revoked.`);
      handleRefresh();
    } catch (err: any) {
      toast.error("Failed to toggle verification: " + err.message);
    }
  };

  const handleDeleteCitizen = async (id: number) => {
    if (confirm("Are you sure you want to delete this citizen? This action is permanent.")) {
      try {
        await api.deleteCitizen(id);
        toast.success("Citizen deleted successfully");
        handleRefresh();
      } catch (err: any) {
        toast.error("Failed to delete citizen: " + err.message);
      }
    }
  };

  const currentLangOption = LANGUAGE_OPTIONS.find((o) => o.code === lang) ?? LANGUAGE_OPTIONS[0];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-6">
                {/* Logo Brand */}
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all relative">
                    <img
                      src="/assets/uploads/image-27-4.png"
                      alt="KNOT Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-display font-extrabold text-xl text-primary tracking-tight">KNOT</span>
                    <span className="text-[9px] text-muted-foreground tracking-widest uppercase font-body font-bold">
                      {t("admin_badge") || "ADMIN"}
                    </span>
                  </div>
                </Link>

                {/* Vertical Separator */}
                <div className="hidden sm:block w-px h-8 bg-border" />

                {/* Title and access text */}
                <div>
                  <h1 className="text-xl font-display font-bold text-foreground">
                    {t("admin_welcome")} <DynamicText text={authUser?.name ?? t("admin_administrator")} />
                  </h1>
                  <p className="text-xs text-muted-foreground font-body">
                    {t("admin_secure_access") || "Secure Administrator Access"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Language selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent hover:text-accent-foreground gap-1.5 font-body"
                      title="Change language"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">
                        {currentLangOption.flag} {currentLangOption.shortLabel}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.code}
                        onSelect={() => setLang(opt.code as LangCode)}
                        className={`cursor-pointer font-body text-sm gap-2 ${lang === opt.code ? "bg-accent font-semibold" : ""}`}
                      >
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                        {lang === opt.code && (
                          <span className="ml-auto text-primary">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={handleRefresh} className="hidden sm:flex border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                  <RefreshCw className="w-4 h-4 mr-2" /> {t("admin_refresh")}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleClearData} className="hidden sm:flex bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/30">
                  <Trash2 className="w-4 h-4 mr-2" /> {t("admin_clear_data")}
                </Button>
                <Button variant="default" size="sm" onClick={handleLogout} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <LogOut className="w-4 h-4 mr-2" /> {t("admin_logout")}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label={t("admin_stat_workers") || "Total Workers"}
              value={stats?.totalWorkers || workers.length}
              color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              icon={Users}
              label={t("admin_stat_citizens") || "Total Citizens"}
              value={stats?.totalCitizens || citizens.length}
              color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            />
            <StatCard
              icon={FileText}
              label={t("admin_stat_requests") || "Learning Requests"}
              value={stats?.totalLearningRequests ?? learningRequests.length}
              color="bg-green-500/10 text-green-600 dark:text-green-400"
            />
            <StatCard
              icon={Activity}
              label={t("profile_endorsements") || "Total Endorsements"}
              value={stats?.totalEndorsements ?? 0}
              color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="verifications" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-muted/50 p-1 rounded-xl h-auto mb-8 border border-border">
              <TabsTrigger value="verifications" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Video className="w-4 h-4 mr-2" />
                {t("admin_practical_approval")} ({practicalSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="workers" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Users className="w-4 h-4 mr-2" />
                {t("admin_tab_workers") || "Workers"} ({workers.length})
              </TabsTrigger>
              <TabsTrigger value="citizens" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Users className="w-4 h-4 mr-2" />
                {t("admin_tab_citizens") || "Citizens"} ({citizens.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <FileText className="w-4 h-4 mr-2" />
                {t("admin_tab_requests") || "Learning Requests"} ({learningRequests.length})
              </TabsTrigger>
              <TabsTrigger value="ad-settings" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Globe className="w-4 h-4 mr-2" />
                {t("admin_tab_ad_settings") || "Ad Configuration"}
              </TabsTrigger>
            </TabsList>

          <TabsContent value="verifications" className="mt-0">
            <Card className="border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" /> {t("admin_verifications_title") || "Pending Practical Verifications"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {practicalSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">{t("admin_verifications_empty") || "All caught up!"}</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm">{t("admin_no_requests") || "There are no pending practical video verifications to review at this time."}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="font-semibold w-[200px]">{t("admin_th_worker") || "Worker Name"}</TableHead>
                          <TableHead className="font-semibold">{t("admin_th_skill") || "Skill Under Review"}</TableHead>
                          <TableHead className="font-semibold text-right">{t("admin_th_actions") || "Actions"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {practicalSubmissions.map((v: any) => (
                          <TableRow key={v.workerId} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium text-foreground"><DynamicText text={v.workerName} /></TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-medium">
                                <DynamicText text={v.skill} />
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-4">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
                                  onClick={async () => {
                                    try {
                                      let videoUrl = "";
                                      if (v.videoDataURI && v.videoDataURI.startsWith("data:")) {
                                        // Convert base64 dataURI to binary Blob to bypass browser dataURI length limits in video players
                                        const parts = v.videoDataURI.split(";base64,");
                                        const contentType = parts[0].split(":")[1];
                                        const raw = window.atob(parts[1]);
                                        const rawLength = raw.length;
                                        const uInt8Array = new Uint8Array(rawLength);
                                        for (let i = 0; i < rawLength; ++i) {
                                          uInt8Array[i] = raw.charCodeAt(i);
                                        }
                                        const blob = new Blob([uInt8Array], { type: contentType });
                                        videoUrl = URL.createObjectURL(blob);
                                      } else {
                                        videoUrl = v.videoDataURI || (api.getVideoStreamUrl ? api.getVideoStreamUrl(Number(v.workerId)) : "");
                                      }
                                      
                                      setActiveVideo({
                                        url: videoUrl,
                                        title: `${v.workerName} - ${v.skill}`
                                      });
                                    } catch (err: any) {
                                      toast.error("Failed to load video: " + err.message);
                                    }
                                  }}
                                >
                                  <Play className="w-4 h-4 mr-1.5" /> {t("admin_th_video") || "Watch Video"}
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white border-0"
                                  onClick={() => handleApprove(Number(v.workerId))}
                                >
                                  <Check className="w-4 h-4 mr-1.5" /> {t("admin_btn_approve") || "Approve"}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleReject(Number(v.workerId))}
                                >
                                  <X className="w-4 h-4 mr-1.5" /> {t("admin_btn_reject") || "Reject"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers" className="mt-0">
            <Card className="border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> {t("admin_tab_workers") || "Platform Workers"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold w-[80px]">{t("admin_th_id") || "ID"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_worker") || "Worker"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_skill") || "Skill"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_location") || "Location"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_badge") || "Badge"}</TableHead>
                        <TableHead className="font-semibold text-right">{t("admin_th_trust") || "Trust Score"}</TableHead>
                        <TableHead className="font-semibold text-right">{t("admin_th_actions") || "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workers.length > 0 ? workers.map((w: any) => (
                        <TableRow key={w.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground font-mono">#{w.id}</TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground flex items-center gap-1">
                              <DynamicText text={w.name} />
                              {w.verified && (
                                <span
                                  className="text-emerald-500 hover:text-emerald-600 transition-colors shrink-0"
                                  title="Official Verified Worker"
                                >
                                  <svg
                                    className="w-4 h-4 fill-current"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {w.contact || "No contact"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal bg-background">
                              <DynamicText text={w.skill} />
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              <DynamicText text={w.location || ""} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <BadgePill level={w.badgeLevel} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center justify-center bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-2.5 py-1 rounded-md text-sm">
                              {w.trustScore}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-8 px-2.5 mr-2 font-body font-medium text-xs gap-1.5 transition-all ${
                                w.verified
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400"
                                  : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                              }`}
                              onClick={() => handleToggleVerification(w)}
                              title={w.verified ? "Revoke Verification" : "Verify Worker"}
                            >
                              <CheckCircle
                                className={`w-3.5 h-3.5 transition-all ${
                                  w.verified
                                    ? "fill-emerald-500 text-white dark:fill-emerald-400 dark:text-emerald-950"
                                    : "text-muted-foreground group-hover:text-foreground"
                                }`}
                              />
                              {w.verified ? "Verified" : "Verify"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteUser(Number(w.id))}
                              title="Delete Worker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("admin_no_workers") || "No workers registered yet."}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="citizens" className="mt-0">
            <Card className="border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> {t("admin_tab_citizens") || "Registered Citizens"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold w-[80px]">{t("admin_th_id") || "ID"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_name") || "Citizen"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_address") || "Address"}</TableHead>
                        <TableHead className="font-semibold text-right">{t("admin_th_trust") || "Points"}</TableHead>
                        <TableHead className="font-semibold text-right">{t("admin_th_actions") || "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {citizens.length > 0 ? citizens.map((c: any) => (
                        <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground font-mono">#{c.id}</TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground"><DynamicText text={c.name} /></div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {c.email || "No email"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              <DynamicText text={c.address || ""} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-semibold">
                              {c.points || 0} pts
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteCitizen(Number(c.id))}
                              title="Delete Citizen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("admin_no_citizens") || "No citizens registered yet."}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
            <Card className="border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> {t("admin_tab_requests") || "Active Learning Requests"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold w-[80px]">{t("admin_th_id") || "ID"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_requester") || "Requester"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_skill") || "Target Skill"}</TableHead>
                        <TableHead className="font-semibold">{t("admin_th_message") || "Message"}</TableHead>
                        <TableHead className="font-semibold text-right">{t("admin_th_status") || "Status"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {learningRequests.length > 0 ? learningRequests.map((r: any) => (
                        <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground font-mono">#{r.id}</TableCell>
                          <TableCell className="font-medium text-foreground"><DynamicText text={r.citizenName} /></TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal bg-background">
                              <DynamicText text={r.targetSkill} />
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                            <DynamicText text={r.message} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={r.status === "pending" ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-0" : "bg-green-100 text-green-800 hover:bg-green-200 border-0"}>
                              {r.status || "pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("admin_no_requests") || "No learning requests found."}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ad-settings" className="mt-0 animate-fade-in">
            <Card className="border-border shadow-md bg-card/60 backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground font-display font-bold">
                  <Globe className="w-5 h-5 text-primary" />
                  {t("admin_ads_title") || "Monetization & Ad Settings"}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {t("admin_ads_hint") || "Configure your approved Adsterra codes below to start earning. You can paste the direct link or specific ad format scripts you received from your Adsterra dashboard."}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSaveAdSettings} className="space-y-6 max-w-2xl">
                  {/* Active Ad Network Select */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground font-body">
                      {t("admin_ads_provider") || "Active Ad Network Provider"}
                    </label>
                    <div className="relative">
                      <select
                        value={adProvider}
                        onChange={(e) => setAdProvider(e.target.value as any)}
                        className="w-full h-11 px-3 bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground font-body transition-all outline-none appearance-none"
                      >
                        <option value="fallback">{t("admin_ads_provider_fallback") || "Demo / Fallback Sponsorship Cards"}</option>
                        <option value="propeller">{t("admin_ads_provider_propeller") || "Propeller Ads Network"}</option>
                        <option value="adsterra">{t("admin_ads_provider_adsterra") || "Adsterra Monetization Network"}</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                        ▼
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Dynamic fields depending on selected provider */}
                  {adProvider === "propeller" && (
                    <div className="space-y-2 animate-slide-down">
                      <label className="block text-sm font-semibold text-foreground font-body">
                        {t("admin_ads_propeller_zone_label") || "Propeller Ads Zone ID"}
                      </label>
                      <input
                        type="text"
                        value={propellerZoneId}
                        onChange={(e) => setPropellerZoneId(e.target.value)}
                        placeholder="e.g. 4887601"
                        className="w-full h-11 px-4 bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground font-body font-mono transition-all outline-none"
                      />
                    </div>
                  )}

                  {adProvider === "adsterra" && (
                    <div className="space-y-5 animate-slide-down">
                      {/* Direct Link */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground font-body flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                          {t("admin_ads_adsterra_direct_link_label") || "Adsterra Direct Link URL (highly profitable)"}
                        </label>
                        <input
                          type="text"
                          value={adsterraDirectLink}
                          onChange={(e) => setAdsterraDirectLink(e.target.value)}
                          placeholder="e.g. https://www.highrateprofit.com/abcdef0123/"
                          className="w-full h-11 px-4 bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground font-body font-mono transition-all outline-none"
                        />
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-body">
                          Tip: We will link all banner card clicks to this direct link. This is one of the highest paying formats on Adsterra.
                        </p>
                      </div>

                      {/* Popunder Ad */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground font-body">
                          {t("admin_ads_adsterra_popunder_label") || "Adsterra Popunder Script Tag or URL"}
                        </label>
                        <textarea
                          value={adsterraPopunder}
                          onChange={(e) => setAdsterraPopunder(e.target.value)}
                          placeholder="Paste your popunder script tag or source URL here..."
                          rows={2}
                          className="w-full p-3 bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground font-body font-mono transition-all outline-none resize-none"
                        />
                      </div>

                      {/* Social Bar */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground font-body">
                          {t("admin_ads_adsterra_socialbar_label") || "Adsterra Social Bar / In-Page Push Script Tag or URL"}
                        </label>
                        <textarea
                          value={adsterraSocialBar}
                          onChange={(e) => setAdsterraSocialBar(e.target.value)}
                          placeholder="Paste your social bar script tag or source URL here..."
                          rows={2}
                          className="w-full p-3 bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground font-body font-mono transition-all outline-none resize-none"
                        />
                      </div>

                      {/* Banner Keys */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-foreground font-body">
                            {t("admin_ads_adsterra_banner_728_label") || "Adsterra Horizontal Banner (728x90) Key"}
                          </label>
                          <input
                            type="text"
                            value={adsterraBanner728}
                            onChange={(e) => setAdsterraBanner728(e.target.value)}
                            placeholder="e.g. e8de9553f1f1d1de41f21db5a507204f"
                            className="w-full h-11 px-4 bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground font-body font-mono transition-all outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-foreground font-body">
                            {t("admin_ads_adsterra_banner_300_label") || "Adsterra Card Banner (300x250) Key"}
                          </label>
                          <input
                            type="text"
                            value={adsterraBanner300}
                            onChange={(e) => setAdsterraBanner300(e.target.value)}
                            placeholder="e.g. bcdef0123456789a"
                            className="w-full h-11 px-4 bg-background border border-border hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground font-body font-mono transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="bg-border/60 pt-2" />

                  {/* Save Button */}
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-6 h-11 rounded-lg transition-all"
                    >
                      {t("admin_ads_save_btn") || "Save Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      </div>

    {/* Footer */}

      <footer className="bg-navy py-8 mt-auto border-t border-white/10 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-2 ring-white/20">
                <img
                  src="/assets/uploads/image-27-4.png"
                  alt="KNOT Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display font-extrabold text-sm text-white tracking-tight">KNOT</span>
                <span className="text-[8px] text-white/60 tracking-widest uppercase font-body font-bold">
                  {t("admin_badge") || "ADMIN"}
                </span>
              </div>
            </div>
            
            <p className="text-white/40 text-xs font-body text-center sm:text-right">
              © 2026 KNOT. <DynamicText text="All rights reserved. Secure Administrator Portal." />
            </p>
          </div>
        </div>
      </footer>

      {/* Premium Glassmorphic Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-500 animate-pulse" /> {activeVideo.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                onClick={() => setActiveVideo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Video Content Container */}
            <div className="aspect-video bg-slate-950 flex items-center justify-center p-2 relative">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain rounded-lg shadow-lg border border-slate-850"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex justify-end gap-3">
              <Button
                onClick={() => setActiveVideo(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-body font-semibold px-6 border border-slate-750"
              >
                {t("close") || "Close"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
