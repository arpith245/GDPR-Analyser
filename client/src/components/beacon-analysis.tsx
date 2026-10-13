import { motion } from "framer-motion";
import { Radar, Eye, Bot, Megaphone, BarChart3, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BeaconAnalysisProps {
  beaconData: any;
}

const ICONS: Record<string, any> = { pixel: Eye, ai: Bot, marketing: Megaphone, analytics: BarChart3 };
const COLORS: Record<string, string> = {
  pixel: "text-sky-300 bg-sky-500/15 border-sky-500/25",
  ai: "text-violet-300 bg-violet-500/15 border-violet-500/25",
  marketing: "text-amber-300 bg-amber-500/15 border-amber-500/25",
  analytics: "text-emerald-300 bg-emerald-500/15 border-emerald-500/25",
};

export default function BeaconAnalysis({ beaconData }: BeaconAnalysisProps) {
  const { beacons = [], stats = {}, totalViolations = 0 } = beaconData;

  const tiles = [
    { label: "Pixel Beacons", value: stats.pixel || 0, testid: "text-pixel-beacons", color: "text-sky-300", bar: "bg-sky-400" },
    { label: "AI Trackers", value: stats.ai || 0, testid: "text-ai-beacons", color: "text-violet-300", bar: "bg-violet-400" },
    { label: "Cross-Border", value: stats.crossBorder || 0, testid: "text-cross-border", color: "text-emerald-300", bar: "bg-emerald-400" },
    { label: "Violations", value: totalViolations, testid: "text-violations", color: "text-rose-300", bar: "bg-rose-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <Card className="glass border-white/10 rounded-2xl overflow-hidden card-hover">
        <CardHeader className="border-b border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-3 font-display text-lg">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/25 to-blue-600/15 border border-cyan-500/25 flex items-center justify-center">
                <Radar className="w-5 h-5 text-cyan-300" />
              </span>
              Beacons & AI Tracking
            </CardTitle>
            <Badge variant="secondary" data-testid="badge-beacons-detected" className="rounded-full px-3 py-1 bg-cyan-500/10 text-cyan-200 border-cyan-500/30 border">
              {beacons.length} Detected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-center hover:border-white/15 transition-colors">
                <div className={cn("font-display text-2xl font-bold tabular-nums", t.color)} data-testid={t.testid}>{t.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.label}</div>
                <div className="h-1 rounded-full bg-white/[0.07] mt-2.5 overflow-hidden">
                  <div className={cn("h-full rounded-full opacity-70", t.bar)} style={{ width: `${Math.min(100, t.value * 18)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {beacons.length > 0 ? (
            <div className="space-y-2.5">
              {beacons.map((beacon: any, index: number) => {
                const Icon = ICONS[beacon.type] || Wifi;
                const colorCls = COLORS[beacon.type] || "text-muted-foreground bg-white/5 border-white/10";
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.05, 0.4) }}
                    className="flex items-center justify-between gap-3 p-3.5 border border-white/[0.07] rounded-2xl bg-white/[0.02] hover:bg-white/[0.045] hover:border-white/15 transition-all"
                    data-testid={`card-beacon-${index}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", colorCls)}>
                        <Icon className="w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[14px] truncate">{beacon.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{beacon.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {beacon.gdprViolation && <Badge className="bg-rose-500/15 text-rose-200 border-rose-500/30 border rounded-full">GDPR Violation</Badge>}
                      {beacon.dpdpViolation && <Badge className="bg-amber-500/15 text-amber-200 border-amber-500/30 border rounded-full">DPDP Warning</Badge>}
                      {beacon.aiConsentRequired && <Badge className="bg-violet-500/15 text-violet-200 border-violet-500/30 border rounded-full">AI Consent</Badge>}
                      {!beacon.gdprViolation && !beacon.dpdpViolation && <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-500/30 border rounded-full">Compliant</Badge>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3">
                <Radar className="w-6 h-6 text-emerald-300" />
              </div>
              <p className="text-muted-foreground text-sm">No web beacons detected — nothing phoning home.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
