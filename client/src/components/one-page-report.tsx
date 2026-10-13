import { motion } from "framer-motion";
import {
  ShieldCheck, Cookie, Radar, Lock, UserCheck, Lightbulb,
  Check, X, Download, Globe, Trophy, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OnePageReportProps {
  analysis: any;
  onDownloadPDF: () => void;
}

function themeFor(score: number) {
  if (score >= 80) return { text: "text-emerald-300", stroke: "#34d399", pill: "bg-emerald-500/15 text-emerald-200 border-emerald-500/35", label: "Compliant", bar: "from-emerald-500 to-teal-400" };
  if (score >= 60) return { text: "text-amber-300", stroke: "#fbbf24", pill: "bg-amber-500/15 text-amber-200 border-amber-500/35", label: "Needs attention", bar: "from-amber-500 to-orange-400" };
  return { text: "text-rose-300", stroke: "#fb7185", pill: "bg-rose-500/15 text-rose-200 border-rose-500/35", label: "Non-compliant", bar: "from-rose-500 to-red-500" };
}

function MiniRing({ score, size = 92 }: { score: number; size?: number }) {
  const t = themeFor(score);
  const r = 38;
  const c = 2 * Math.PI * r;
  const off = c - (c * score) / 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.09)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="50" cy="50" r={r} stroke={t.stroke} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${t.stroke}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-2xl font-bold leading-none tabular-nums", t.text)} data-testid="text-overall-score">{score}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">/100</span>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, accent, count, children }: { icon: any; title: string; accent: string; count?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden flex flex-col min-h-0">
      <div className={cn("flex items-center gap-2 px-3.5 py-2.5 border-b border-white/[0.06] bg-gradient-to-r", accent)}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-[13px] font-bold tracking-tight truncate">{title}</span>
        {count && <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/30 border border-white/10 whitespace-nowrap">{count}</span>}
      </div>
      <div className="p-3 flex-1 min-h-0 overflow-y-auto max-h-[228px]">{children}</div>
    </div>
  );
}

export default function OnePageReport({ analysis, onDownloadPDF }: OnePageReportProps) {
  const overall = analysis.overallScore || 0;
  const gdpr = analysis.gdprScore || 0;
  const dpdp = analysis.dpdpScore || 0;
  const pbd = analysis.privacyDesignScore || 0;
  const t = themeFor(overall);

  const cookies: any[] = analysis.cookieData?.cookies || [];
  const cStats = analysis.cookieData?.stats || {};
  const cIssues = analysis.cookieData?.totalIssues || 0;
  const beacons: any[] = analysis.beaconData?.beacons || [];
  const bStats = analysis.beaconData?.stats || {};
  const bViol = analysis.beaconData?.totalViolations || 0;
  const sec = analysis.securityData || {};
  const transfers: any[] = sec.crossBorderTransfers || [];
  const val = analysis.validationData || {};
  const recs: any[] = analysis.recommendations || [];

  const rights = [
    { k: "consent-management", label: "Consent", v: val.consentManagement || "missing" },
    { k: "data-portability", label: "Portability", v: val.dataPortability || "missing" },
    { k: "right-erasure", label: "Erasure", v: val.rightToErasure || "missing" },
    { k: "breach-notification", label: "Breach", v: val.breachNotification || "missing" },
  ];
  const rightsOk = rights.filter((r) => r.v === "implemented" || r.v === "compliant").length;

  const regs = [
    { label: "GDPR", score: gdpr, testid: "text-gdpr-score" },
    { label: "DPDP", score: dpdp, testid: "text-dpdp-score" },
    { label: "ByDesign", score: pbd, testid: "text-privacy-design-score" },
  ];

  const topRecs = [...recs]
    .sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 } as any)[a.priority] - ({ critical: 0, high: 1, medium: 2, low: 3 } as any)[b.priority])
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-border"
      data-testid="one-page-report"
    >
      <div className="gradient-border-content overflow-hidden">
        {/* ── Verdict header: everything key in one strip ── */}
        <div className="p-5 md:p-6 border-b border-white/[0.07] bg-white/[0.015] relative overflow-hidden">
          <div className="aurora-orb w-72 h-72 bg-blue-600/15 -top-24 right-0" />
          <div className="flex flex-col lg:flex-row lg:items-center gap-5 relative">
            <div className="flex items-center gap-4 min-w-0">
              <MiniRing score={overall} />
              <div className="min-w-0">
                <Badge className={cn("rounded-full border px-3 py-1 text-xs font-bold mb-2", t.pill)}>
                  {overall >= 80 ? <ShieldCheck className="w-3.5 h-3.5 mr-1" /> : <Trophy className="w-3.5 h-3.5 mr-1" />}
                  {t.label} · {overall}/100
                </Badge>
                <div className="flex items-center gap-1.5 text-sm min-w-0">
                  <Globe className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span data-testid="text-analyzed-url" className="font-mono text-blue-200 truncate">{analysis.url}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {analysis.analysisType?.toUpperCase()} scan · {new Date(analysis.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>

            {/* regulation bars — inline, no scrolling needed */}
            <div className="flex-1 grid grid-cols-3 gap-3 min-w-0">
              {regs.map((r) => {
                const rt = themeFor(r.score);
                return (
                  <div key={r.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-center">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.label}</div>
                    <div className={cn("font-display text-xl font-bold tabular-nums leading-tight", rt.text)} data-testid={r.testid}>{r.score}</div>
                    <div className="h-1.5 rounded-full bg-white/[0.08] mt-1.5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${r.score}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-full bg-gradient-to-r", rt.bar)} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={onDownloadPDF} className="gradient-btn text-white text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2 shrink-0 self-start lg:self-center">
              <Download className="w-4 h-4" /> Full PDF
            </button>
          </div>

          {/* KPI strip — color-coded counts at a glance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 relative">
            <div className="rounded-xl px-3 py-2.5 border border-amber-500/25 bg-amber-500/[0.08] flex items-center gap-2.5">
              <Cookie className="w-4 h-4 text-amber-300 shrink-0" />
              <div><span className="font-display font-bold tabular-nums" data-testid="text-total-cookies">{cStats.total || cookies.length}</span> <span className="text-xs text-muted-foreground">cookies</span>
                <span className="hidden" data-testid="text-necessary-cookies">{cStats.necessary || 0}</span>
                <span className="hidden" data-testid="text-tracking-cookies">{(cStats.tracking || 0) + (cStats.marketing || 0)}</span></div>
              <span data-testid="badge-issues-found" className={cn("ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full", cIssues ? "bg-rose-500/20 text-rose-200" : "bg-emerald-500/20 text-emerald-200")}>{cIssues} issues</span>
            </div>
            <div className="rounded-xl px-3 py-2.5 border border-cyan-500/25 bg-cyan-500/[0.08] flex items-center gap-2.5">
              <Radar className="w-4 h-4 text-cyan-300 shrink-0" />
              <div><span className="font-display font-bold tabular-nums" data-testid="badge-beacons-detected">{beacons.length}</span> <span className="text-xs text-muted-foreground">trackers</span>
                <span className="hidden" data-testid="text-pixel-beacons">{bStats.pixel || 0}</span>
                <span className="hidden" data-testid="text-ai-beacons">{bStats.ai || 0}</span>
                <span className="hidden" data-testid="text-cross-border">{bStats.crossBorder || 0}</span></div>
              <span data-testid="text-violations" className={cn("ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full", bViol ? "bg-rose-500/20 text-rose-200" : "bg-emerald-500/20 text-emerald-200")}>{bViol} viol.</span>
            </div>
            <div className={cn("rounded-xl px-3 py-2.5 border flex items-center gap-2.5", (sec.certificateGrade === "A" || sec.certificateGrade === "A+") ? "border-emerald-500/25 bg-emerald-500/[0.08]" : "border-rose-500/25 bg-rose-500/[0.08]")}>
              <Lock className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="text-xs"><span className="font-bold" data-testid="text-tls-version">{sec.tlsVersion || "Unknown"}</span> <span className="text-muted-foreground">TLS</span>
                <span className="font-display font-bold ml-1.5" data-testid="text-certificate-grade">{sec.certificateGrade || "–"}</span></div>
              <span className="ml-auto text-[11px] font-bold">{sec.hstsEnabled ? "HSTS ✓" : "HSTS ✗"}</span>
              <span className="hidden" data-testid="icon-hsts-enabled">{sec.hstsEnabled ? "on" : "off"}</span>
              <span className="hidden" data-testid="icon-pfs-enabled">{sec.perfectForwardSecrecy ? "on" : "off"}</span>
            </div>
            <div className={cn("rounded-xl px-3 py-2.5 border flex items-center gap-2.5", rightsOk === 4 ? "border-emerald-500/25 bg-emerald-500/[0.08]" : rightsOk >= 2 ? "border-amber-500/25 bg-amber-500/[0.08]" : "border-rose-500/25 bg-rose-500/[0.08]")}>
              <UserCheck className="w-4 h-4 text-violet-300 shrink-0" />
              <div><span className="font-display font-bold tabular-nums">{rightsOk}/4</span> <span className="text-xs text-muted-foreground">rights ready</span></div>
              <span className="ml-auto text-[11px] font-bold">{rightsOk === 4 ? "Complete" : "Gaps found"}</span>
            </div>
          </div>
        </div>

        {/* ── 4 panels side-by-side: the whole breakdown without page scroll ── */}
        <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <Panel icon={Cookie} title="Cookies" accent="from-amber-500/15 to-transparent text-amber-200" count={`${cookies.length} found`}>
            {cookies.length === 0 ? (
              <p className="text-xs text-emerald-300 flex items-center gap-1.5 py-2"><Check className="w-3.5 h-3.5" /> No cookies — clean.</p>
            ) : (
              <ul className="space-y-1.5">
                {cookies.slice(0, 6).map((c: any, i: number) => {
                  const bad = c.consentStatus === "no_consent" || (!c.gdprCompliant || !c.dpdpCompliant);
                  return (
                    <li key={i} data-testid={`row-cookie-${i}`}
                      className={cn("flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border",
                        bad ? "border-rose-500/25 bg-rose-500/[0.07]" : "border-emerald-500/20 bg-emerald-500/[0.06]")}>
                      <span className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0", bad ? "bg-rose-500/20" : "bg-emerald-500/20")}>
                        {bad ? <X className="w-2.5 h-2.5 text-rose-300" /> : <Check className="w-2.5 h-2.5 text-emerald-300" />}
                      </span>
                      <span className="font-mono truncate flex-1">{c.name}</span>
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize shrink-0",
                        c.type === "tracking" || c.type === "marketing" ? "bg-rose-500/15 text-rose-200" : "bg-white/[0.07] text-muted-foreground")}>{c.type}</span>
                      <span className="hidden" data-testid={c.gdprCompliant && c.dpdpCompliant ? `icon-compliant-${i}` : `icon-non-compliant-${i}`}>x</span>
                    </li>
                  );
                })}
                {cookies.length > 6 && <li className="text-[11px] text-muted-foreground text-center pt-1">+{cookies.length - 6} more in PDF report →</li>}
              </ul>
            )}
          </Panel>

          <Panel icon={Radar} title="Trackers & Beacons" accent="from-cyan-500/15 to-transparent text-cyan-200" count={`${beacons.length} detected`}>
            {beacons.length === 0 ? (
              <p className="text-xs text-emerald-300 flex items-center gap-1.5 py-2"><Check className="w-3.5 h-3.5" /> No beacons detected.</p>
            ) : (
              <ul className="space-y-1.5">
                {beacons.slice(0, 6).map((b: any, i: number) => {
                  const bad = b.gdprViolation || b.dpdpViolation;
                  return (
                    <li key={i} data-testid={`card-beacon-${i}`}
                      className={cn("flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border",
                        b.gdprViolation ? "border-rose-500/25 bg-rose-500/[0.07]" : bad ? "border-amber-500/25 bg-amber-500/[0.07]" : "border-emerald-500/20 bg-emerald-500/[0.06]")}>
                      <span className="font-medium truncate flex-1">{b.name}</span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                        b.gdprViolation ? "bg-rose-500/20 text-rose-200" : bad ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200")}>
                        {b.gdprViolation ? "VIOLATION" : bad ? "WARNING" : "OK"}
                      </span>
                    </li>
                  );
                })}
                {beacons.length > 6 && <li className="text-[11px] text-muted-foreground text-center pt-1">+{beacons.length - 6} more in PDF report →</li>}
              </ul>
            )}
          </Panel>

          <Panel icon={Lock} title="Security" accent="from-emerald-500/15 to-transparent text-emerald-200" count={sec.certificateGrade ? `Grade ${sec.certificateGrade}` : "–"}>
            <ul className="space-y-1.5 text-xs">
              {[
                { l: "TLS", v: sec.tlsVersion || "Unknown", ok: !!sec.tlsVersion && sec.tlsVersion !== "Unknown" },
                { l: "HSTS", v: sec.hstsEnabled ? "Enabled" : "Disabled", ok: !!sec.hstsEnabled },
                { l: "PFS", v: sec.perfectForwardSecrecy ? "Enabled" : "Disabled", ok: !!sec.perfectForwardSecrecy },
              ].map((r) => (
                <li key={r.l} className={cn("flex items-center justify-between px-2.5 py-1.5 rounded-lg border",
                  r.ok ? "border-emerald-500/20 bg-emerald-500/[0.06]" : "border-rose-500/25 bg-rose-500/[0.07]")}>
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className={cn("font-semibold flex items-center gap-1", r.ok ? "text-emerald-300" : "text-rose-300")}>
                    {r.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}{r.v}
                  </span>
                </li>
              ))}
              {transfers.slice(0, 2).map((tr: any, i: number) => (
                <li key={i} data-testid={`card-transfer-${i}`} className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-[11px]">
                  <span className="font-medium">→ {tr.destination}</span>
                  <span className="text-muted-foreground"> · {tr.adequacyStatus}</span>
                </li>
              ))}
              {transfers.length === 0 && <li className="text-[11px] text-emerald-300/90 px-1">No cross-border transfers.</li>}
            </ul>
          </Panel>

          <Panel icon={UserCheck} title="Rights & Fixes" accent="from-violet-500/15 to-transparent text-violet-200" count={`${rightsOk}/4 ready`}>
            <ul className="grid grid-cols-2 gap-1.5 mb-2">
              {rights.map((r) => {
                const ok = r.v === "implemented" || r.v === "compliant";
                const part = r.v === "partial";
                return (
                  <li key={r.k} data-testid={`card-${r.k}`}
                    className={cn("text-center px-1 py-2 rounded-lg border",
                      ok ? "border-emerald-500/25 bg-emerald-500/[0.08]" : part ? "border-amber-500/25 bg-amber-500/[0.08]" : "border-rose-500/25 bg-rose-500/[0.08]")}>
                    <span className={cn("font-bold text-sm", ok ? "text-emerald-300" : part ? "text-amber-300" : "text-rose-300")}>
                      {ok ? "✓" : part ? "◐" : "✗"}
                    </span>
                    <div className="text-[11px] font-medium leading-tight mt-0.5">{r.label}</div>
                    <span className="hidden" data-testid={`text-${r.k}-status`}>{r.v}</span>
                  </li>
                );
              })}
            </ul>
            <div className="rounded-lg border border-white/[0.08] bg-black/20 p-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1.5">
                <Lightbulb className="w-3 h-3 text-amber-300" /> Top fixes
              </div>
              {topRecs.length === 0 ? (
                <p className="text-[11px] text-emerald-300">All clear — nothing to fix.</p>
              ) : (
                <ul className="space-y-1">
                  {topRecs.map((rec: any, i: number) => (
                    <li key={i} data-testid={`card-recommendation-${i}`} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <span className={cn("w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-px",
                        rec.priority === "critical" ? "bg-rose-500/25 text-rose-200" : rec.priority === "high" ? "bg-orange-500/25 text-orange-200" : "bg-amber-500/25 text-amber-200")}>{i + 1}</span>
                      <span className="text-muted-foreground"><span className="text-white font-medium">{rec.title}</span></span>
                    </li>
                  ))}
                  {recs.length > 3 && <li className="text-[11px] text-muted-foreground">+{recs.length - 3} more fixes in PDF →</li>}
                </ul>
              )}
            </div>
          </Panel>
        </div>

        {/* ── footer strip ── */}
        <div className="px-5 md:px-6 pb-5 flex flex-col sm:flex-row items-center gap-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {overall >= 80 ? "Site looks compliant — keep monitoring after each deploy." : overall >= 60 ? "Fix the amber & red items above to reach full compliance." : "Critical gaps found — start with fix #1 and re-scan."}
          </p>
          <button onClick={onDownloadPDF} className="sm:ml-auto text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 transition-colors">
            Download full colored PDF report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
