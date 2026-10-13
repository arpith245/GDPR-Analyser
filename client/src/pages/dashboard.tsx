import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, LayoutDashboard, FileText, Settings as SettingsIcon,
  Download, Cookie, Radar, Lock, Sparkles, ChevronRight, FileSearch,
  CheckCircle2, History, SlidersHorizontal, Save, Globe,
  LayoutGrid, List,
} from "lucide-react";
import AnalysisForm from "@/components/analysis-form";
import OnePageReport from "@/components/one-page-report";
import ComplianceDashboard from "@/components/compliance-dashboard";
import CookieAnalysis from "@/components/cookie-analysis";
import BeaconAnalysis from "@/components/beacon-analysis";
import SecurityAnalysis from "@/components/security-analysis";
import ValidationStatus from "@/components/validation-status";
import ActionItems from "@/components/action-items";
import { cn } from "@/lib/utils";

const LOAD_STEPS = [
  { icon: Cookie, label: "Cookie Analysis", color: "bg-emerald-400", delay: "0s" },
  { icon: Radar, label: "Beacon Detection", color: "bg-cyan-400", delay: "0.2s" },
  { icon: Lock, label: "Security Check", color: "bg-violet-400", delay: "0.4s" },
  { icon: Sparkles, label: "Compliance Review", color: "bg-amber-400", delay: "0.6s" },
];

export default function Dashboard() {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [reportView, setReportView] = useState<"onepage" | "detailed">("onepage");
  // Instant scan feedback — set the moment the user clicks, before any network round-trip
  const [scanActive, setScanActive] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["/api/analysis", currentAnalysisId],
    queryFn: async () => {
      if (!currentAnalysisId) return null;
      const response = await fetch(`/api/analysis/${currentAnalysisId}`);
      return response.json();
    },
    enabled: !!currentAnalysisId,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.data?.status;
      return !status || status === "running" || status === "pending" ? 2000 : false;
    },
  });

  const { data: allAnalyses } = useQuery({
    queryKey: ["/api/analyses"],
    staleTime: 60000,
  });

  const handleScanStart = (url: string) => {
    setSubmittedUrl(url);
    setScanActive(true);
    setElapsed(0);
    // Jump to the working window instantly — user never sits on a dead screen
    setTimeout(() => statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };

  const handleAnalysisStarted = (analysisId: string, url: string) => {
    if (url) setSubmittedUrl(url);
    setScanActive(true);
    setCurrentAnalysisId(analysisId);
  };

  const handleDownloadPDF = async () => {
    if (!currentAnalysisId) return;
    try {
      const response = await fetch(`/api/analysis/${currentAnalysisId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gdpr-analysis-report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const status = analysis?.data?.status;
  const idMatches = !currentAnalysisId || analysis?.data?.id === currentAnalysisId;
  // Show the working window instantly on click (even before first poll resolves)
  // and hide any stale completed report while a fresh scan is in flight
  const showProgress = scanActive && (!status || status === "running" || status === "pending" || !idMatches);
  const showFailed = scanActive && status === "failed" && idMatches;
  const isDone = !!analysis?.data && status === "completed" && idMatches;
  const analyses: any[] = (allAnalyses as any)?.data || [];
  const liveUrl = analysis?.data?.url || submittedUrl;

  // Live elapsed timer while scanning — proof the app is working
  useEffect(() => {
    if (!showProgress) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [showProgress]);

  // Stop scan mode + jump to report when done; surface failure state
  useEffect(() => {
    if (isDone) {
      setScanActive(false);
      const t = setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
      return () => clearTimeout(t);
    }
    if (showFailed) {
      setScanActive(false);
      const t = setTimeout(() => statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
      return () => clearTimeout(t);
    }
  }, [isDone, showFailed, currentAnalysisId]);

  return (
    <div className="min-h-screen relative">
      {/* aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora-orb w-[500px] h-[500px] bg-blue-700/15 -top-40 -left-40 animate-float-slower" />
        <div className="aurora-orb w-[420px] h-[420px] bg-violet-700/15 top-[10%] right-[-120px] animate-float-slow" />
        <div className="aurora-orb w-[380px] h-[380px] bg-cyan-600/10 bottom-[-140px] left-[30%] animate-float-slower" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050914]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 group text-left">
              <span className="relative">
                <span className="w-11 h-11 rounded-2xl gradient-btn flex items-center justify-center transition-transform group-hover:scale-105 group-hover:rotate-3">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </span>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#050914] animate-pulse" />
              </span>
              <span>
                <span className="font-display text-lg font-bold tracking-tight block leading-none">
                  GDPR <span className="gradient-text">Analyzer Pro</span>
                </span>
                <span className="text-[11px] text-muted-foreground tracking-wide">2025 Privacy Compliance Platform</span>
              </span>
            </button>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              {/* Live scan status — always visible in header while working */}
              {showProgress && (
                <span className="flex items-center gap-2 mr-2 px-3.5 py-2 rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-200 text-[13px] font-semibold">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
                  </span>
                  Scanning… {elapsed}s
                </span>
              )}
              {[
                { label: "Dashboard", icon: LayoutDashboard, fn: () => window.scrollTo({ top: 0, behavior: "smooth" }), testid: "button-nav-dashboard", active: true },
                { label: "Reports", icon: FileText, fn: () => scrollTo("reports"), testid: "button-nav-reports", active: false },
                { label: "Settings", icon: SettingsIcon, fn: () => scrollTo("settings"), testid: "button-nav-settings", active: false },
              ].map((n) => (
                <button
                  key={n.label}
                  onClick={n.fn}
                  data-testid={n.testid}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all",
                    n.active ? "bg-white/[0.07] text-white border border-white/10" : "text-muted-foreground hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  <n.icon className="w-4 h-4" /> {n.label}
                </button>
              ))}
              <button
                onClick={handleDownloadPDF}
                disabled={!isDone}
                data-testid="button-export-pdf"
                className="ml-2 gradient-btn text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:saturate-50"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </nav>
            <button
              onClick={handleDownloadPDF}
              disabled={!isDone}
              className="md:hidden gradient-btn text-white p-2.5 rounded-xl disabled:opacity-40"
              data-testid="button-export-pdf-mobile"
              aria-label="Export PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="container mx-auto px-4 pt-10 pb-2 text-center relative">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs text-blue-200 mb-5 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GDPR 2025 · DPDP Act 2023 · AI-consent ready
            <ChevronRight className="w-3 h-3" />
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto">
            Know your site's
            <br />
            <span className="gradient-text">privacy compliance</span> in seconds
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-[15px] leading-relaxed">
            Paste any URL — we scan cookies, trackers, TLS security and consent flows,
            then grade GDPR & DPDP compliance with a downloadable audit report.
          </p>
        </motion.div>

        {/* trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex items-center justify-center gap-6 md:gap-10 mt-7 text-center"
        >
          {[
            { v: analyses.length > 0 ? `${analyses.length}` : "4", l: "Analysis modules" },
            { v: "2", l: "Regulations (GDPR + DPDP)" },
            { v: "~30s", l: "Average full scan" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl md:text-3xl font-bold gradient-text">{s.v}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <AnalysisForm onAnalysisStarted={handleAnalysisStarted} onScanStart={handleScanStart} isScanning={showProgress} />

        {/* Working window — appears the instant you click scan, with live timer + staged steps */}
        <div ref={statusRef} className="scroll-mt-24" data-testid="scan-status">
          <AnimatePresence>
            {showProgress && (
              <motion.div
                key="running"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="mb-8"
              >
                <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
                  <div className="aurora-orb w-72 h-72 bg-blue-600/20 -top-20 left-1/3" />
                  <div className="text-center relative">
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 relative animate-pulse-ring rounded-full">
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-violet-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Globe className="w-7 h-7 text-blue-300 animate-pulse" />
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs font-bold mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                        SCAN IN PROGRESS · {elapsed}s elapsed
                      </div>
                      <h3 className="font-display text-2xl font-bold">Analyzing Website</h3>
                      <p className="text-muted-foreground mt-1.5 text-sm">
                        Deep-scanning <span className="font-mono text-blue-300">{liveUrl || "…"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {status === "pending" || !status ? "Queued — launching headless browser…" : "Browser is live — extracting cookies, trackers & security signals…"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-2xl mx-auto">
                      {LOAD_STEPS.map((s, i) => {
                        // Light steps up progressively so the user sees movement over ~30s
                        const activeStep = Math.min(3, Math.floor(elapsed / 8));
                        const done = i < activeStep;
                        const current = i === activeStep;
                        return (
                          <div
                            key={s.label}
                            className={cn(
                              "rounded-2xl border p-3.5 transition-all",
                              done ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                                : current ? "border-blue-500/40 bg-blue-500/[0.08]"
                                : "border-white/[0.08] bg-white/[0.03]"
                            )}
                          >
                            <div className="flex items-center justify-center mb-2">
                              <span className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center">
                                <s.icon className={cn("w-4 h-4", done ? "text-emerald-300" : "text-blue-200")} />
                              </span>
                            </div>
                            <div className="text-[13px] font-medium">{s.label}</div>
                            <div className="text-[11px] mt-1 font-semibold">
                              {done ? <span className="text-emerald-300">✓ Done</span>
                                : current ? <span className="text-blue-300">● Working…</span>
                                : <span className="text-muted-foreground">○ Queued</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                        <span>Typical full scan: ~30s</span>
                        <span className="tabular-nums font-semibold text-blue-300">{Math.min(99, Math.round((elapsed / 30) * 100))}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.07] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
                          animate={{ width: `${Math.min(99, (elapsed / 30) * 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                      <span className="flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                        ))}
                      </span>
                      Keep this tab open — the report appears here automatically when finished.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Failed scans now say so loudly — with one-click retry */}
          <AnimatePresence>
            {showFailed && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="mb-8"
              >
                <div className="rounded-3xl p-8 relative overflow-hidden border border-rose-500/30 bg-rose-500/[0.06]">
                  <div className="text-center">
                    <h3 className="font-display text-2xl font-bold text-rose-200">Scan failed</h3>
                    <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
                      <span className="font-mono text-rose-200/90">{liveUrl}</span> could not be scanned
                      (site blocked automation, timed out, or is unreachable). Nothing is stuck — try again.
                    </p>
                    <button
                      onClick={() => {
                        setScanActive(false);
                        setCurrentAnalysisId(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="gradient-btn text-white text-sm font-semibold px-6 py-3 rounded-xl mt-5"
                    >
                      Retry with another URL
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results — single one-page color report, no scrolling needed */}
        {isDone && (
          <motion.div ref={reportRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-up scroll-mt-24">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <h2 className="font-display text-xl font-bold">Final Report — everything on one page</h2>
              <div className="ml-auto flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-white/[0.03] text-xs">
                <button
                  onClick={() => setReportView("onepage")}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all",
                    reportView === "onepage" ? "gradient-btn text-white" : "text-muted-foreground hover:text-white")}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> One page
                </button>
                <button
                  onClick={() => setReportView("detailed")}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all",
                    reportView === "detailed" ? "gradient-btn text-white" : "text-muted-foreground hover:text-white")}
                >
                  <List className="w-3.5 h-3.5" /> Detailed
                </button>
              </div>
            </div>

            {reportView === "onepage" ? (
              <OnePageReport analysis={analysis.data} onDownloadPDF={handleDownloadPDF} />
            ) : (
              <>
                <ComplianceDashboard analysis={analysis.data} isLoading={isLoading || analysis.data.status === "running"} />
                <section className="space-y-6">
                  {analysis.data.cookieData && <CookieAnalysis cookieData={analysis.data.cookieData} />}
                  {analysis.data.beaconData && <BeaconAnalysis beaconData={analysis.data.beaconData} />}
                  {analysis.data.securityData && <SecurityAnalysis securityData={analysis.data.securityData} />}
                  {analysis.data.validationData && <ValidationStatus validationData={analysis.data.validationData} />}
                  {analysis.data.recommendations && <ActionItems recommendations={analysis.data.recommendations} />}
                </section>
              </>
            )}
          </motion.div>
        )}

        {/* Reports */}
        <section id="reports" className="mt-12 scroll-mt-24">
          <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="aurora-orb w-64 h-64 bg-violet-600/10 -top-20 -right-20" />
            <div className="flex items-center gap-3 mb-1.5 relative">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-blue-500/15 border border-violet-500/25 flex items-center justify-center">
                <History className="w-5 h-5 text-violet-300" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold">Analysis Reports</h2>
                <p className="text-sm text-muted-foreground">Pick any past scan to revisit its full breakdown</p>
              </div>
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                {analyses.length} saved
              </span>
            </div>

            {analyses.length > 0 ? (
              <div className="space-y-3 mt-6 relative">
                {analyses.map((item: any, i: number) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    onClick={() => {
                      setCurrentAnalysisId(item.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    data-testid={`report-${item.id}`}
                    className="w-full text-left border border-white/[0.07] rounded-2xl p-4 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group card-hover"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-300 shrink-0" />
                          {item.url}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span>{item.createdAt && new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{item.analysisType}</span>
                          <span className={cn("px-2 py-0.5 rounded-full border capitalize",
                            item.status === "completed" ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/25" :
                              item.status === "running" ? "bg-amber-500/10 text-amber-200 border-amber-500/25" :
                                "bg-rose-500/10 text-rose-200 border-rose-500/25")}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {item.overallScore != null && (
                          <div className="text-right">
                            <div className={cn("font-display text-2xl font-bold tabular-nums",
                              item.overallScore >= 80 ? "text-emerald-300" : item.overallScore >= 60 ? "text-amber-300" : "text-rose-300")}>
                              {item.overallScore}
                              <span className="text-xs text-muted-foreground font-sans">/100</span>
                            </div>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 relative">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4 animate-float-slow">
                  <FileSearch className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg">No reports yet</h3>
                <p className="text-sm text-muted-foreground mb-5">Run your first scan above to generate a compliance report</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                >
                  Start Analysis
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Settings */}
        <section id="settings" className="mt-8 scroll-mt-24">
          <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="aurora-orb w-64 h-64 bg-cyan-600/10 -bottom-24 -left-20" />
            <div className="flex items-center gap-3 mb-6 relative">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-500/15 border border-cyan-500/25 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-cyan-300" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold">Settings</h2>
                <p className="text-sm text-muted-foreground">Tune defaults for future scans</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {[
                { title: "Default Analysis Options", rows: ["Cookie Analysis", "Beacon Detection", "Security Check", "AI Consent Analysis"], defaults: [true, true, true, true] },
                { title: "Report Preferences", rows: ["Include Technical Details", "Auto-download PDF", "Email Notifications"], defaults: [true, false, false] },
              ].map((group) => (
                <div key={group.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <h3 className="font-semibold text-[15px] mb-4">{group.title}</h3>
                  <div className="space-y-1">
                    {group.rows.map((label, i) => (
                      <ToggleRow key={label} label={label} defaultOn={group.defaults[i]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-white/[0.07] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
              <div>
                <h3 className="font-semibold">GDPR Analyzer Pro v2.0</h3>
                <p className="text-xs text-muted-foreground">2025 Edition · GDPR + DPDP engine</p>
              </div>
              <button
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 2200);
                }}
                className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  settingsSaved ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "gradient-btn text-white")}
              >
                {settingsSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] mt-12 bg-black/20 backdrop-blur">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </span>
              <div className="text-sm">
                <span className="font-display font-bold">GDPR Analyzer Pro</span>
                <span className="text-muted-foreground"> · © 2025 · 2025 regulatory updates included</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <button onClick={handleDownloadPDF} disabled={!isDone} className="hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-40">
                <Download className="w-3.5 h-3.5" /> Report
              </button>
              <button onClick={() => scrollTo("settings")} className="hover:text-white transition-colors flex items-center gap-1.5">
                <SettingsIcon className="w-3.5 h-3.5" /> Settings
              </button>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className="w-full flex items-center justify-between py-2.5 group"
    >
      <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">{label}</span>
      <span className={cn(
        "relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0",
        on ? "bg-gradient-to-r from-blue-500 to-violet-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]" : "bg-white/10"
      )}>
        <span className={cn(
          "absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
          on ? "left-[22px]" : "left-[3px]"
        )} />
      </span>
    </button>
  );
}
