import { motion } from "framer-motion";
import { Trophy, ShieldCheck, Landmark, Fingerprint, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Analysis } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ComplianceDashboardProps {
  analysis: Analysis;
  isLoading?: boolean;
}

function scoreTheme(score: number) {
  if (score >= 80) return { text: "text-emerald-300", stroke: "#34d399", glow: "stat-glow-green", bg: "from-emerald-500/20 to-teal-500/5", label: "Excellent Compliance", emoji: "Excellent" };
  if (score >= 60) return { text: "text-amber-300", stroke: "#fbbf24", glow: "stat-glow-amber", bg: "from-amber-500/20 to-orange-500/5", label: "Good Compliance", emoji: "Good" };
  if (score >= 40) return { text: "text-orange-300", stroke: "#fb923c", glow: "stat-glow-amber", bg: "from-orange-500/20 to-red-500/5", label: "Needs Improvement", emoji: "Fair" };
  return { text: "text-rose-300", stroke: "#fb7185", glow: "stat-glow-red", bg: "from-rose-500/20 to-red-600/5", label: "Poor Compliance", emoji: "Poor" };
}

function ScoreRing({ score, size = 168 }: { score: number; size?: number }) {
  const theme = scoreTheme(score);
  const r = 62;
  const c = 2 * Math.PI * r;
  const offset = c - (c * score) / 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.06] to-transparent blur-sm" />
      <svg width={size} height={size} viewBox="0 0 160 160" className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.stroke} />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="13" fill="none" />
        <motion.circle
          cx="80" cy="80" r={r}
          stroke="url(#scoreGrad)"
          strokeWidth="13"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 10px ${theme.stroke}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className={cn("font-display text-5xl font-bold tracking-tight", theme.text)}
          data-testid="text-overall-score"
        >
          {score}
        </motion.div>
        <div className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">/ 100</div>
      </div>
    </div>
  );
}

export default function ComplianceDashboard({ analysis, isLoading }: ComplianceDashboardProps) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 shimmer min-h-[280px]" />
          <div className="lg:col-span-2 glass rounded-2xl p-6 shimmer min-h-[280px]" />
        </div>
      </section>
    );
  }

  const overallScore = analysis.overallScore || 0;
  const gdprScore = analysis.gdprScore || 0;
  const dpdpScore = analysis.dpdpScore || 0;
  const privacyDesignScore = analysis.privacyDesignScore || 0;
  const theme = scoreTheme(overallScore);

  const rows = [
    { icon: ShieldCheck, name: "GDPR 2025", sub: "EU Data Protection", score: gdprScore, testid: "text-gdpr-score", bar: "from-blue-500 to-cyan-400" },
    { icon: Landmark, name: "DPDP Act 2023", sub: "India Digital Protection", score: dpdpScore, testid: "text-dpdp-score", bar: "from-emerald-500 to-teal-400" },
    { icon: Fingerprint, name: "Privacy by Design", sub: "Mandatory 2025 requirements", score: privacyDesignScore, testid: "text-privacy-design-score", bar: "from-violet-500 to-purple-400" },
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall score hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-border"
        >
          <div className={cn("gradient-border-content p-6 relative overflow-hidden bg-gradient-to-b", theme.bg)}>
            <div className="aurora-orb w-40 h-40 bg-blue-600/20 -top-10 -right-10" />
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Overall score</h3>
            </div>
            <div className="flex justify-center mb-4">
              <ScoreRing score={overallScore} />
            </div>
            <div className="text-center">
              <div className={cn("font-display font-bold text-lg", theme.text)}>
                {theme.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 truncate max-w-full px-2">
                <span data-testid="text-analyzed-url" className="font-mono text-blue-300/90">{analysis.url}</span>
              </div>
              <div className={cn("inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-semibold border", theme.glow,
                overallScore >= 60 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200")}>
                {overallScore >= 60 ? "Passing threshold" : "Action required"}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass border-white/10 rounded-2xl h-full overflow-hidden relative">
            <div className="aurora-orb w-56 h-56 bg-violet-600/10 -bottom-20 right-10" />
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                Regulation Compliance Breakdown
                <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">live scores</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 relative">
              {rows.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.12 }}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/15 transition-all card-hover"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <r.icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="font-semibold text-[15px]">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.sub}</div>
                      </div>
                      <span className="font-display text-2xl font-bold tabular-nums" data-testid={r.testid}>
                        {r.score}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.07] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.score}%` }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className={cn("h-full rounded-full bg-gradient-to-r", r.bar)}
                        style={{ boxShadow: "0 0 12px rgba(59,130,246,0.4)" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
