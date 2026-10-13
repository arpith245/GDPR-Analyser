import { motion } from "framer-motion";
import { Lightbulb, PartyPopper, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActionItemsProps {
  recommendations: any[];
}

const PRIORITY = {
  critical: { badge: "bg-rose-500/15 text-rose-200 border-rose-500/40", dot: "bg-rose-400", text: "text-rose-300", label: "Critical", bar: "from-rose-500 to-red-500" },
  high: { badge: "bg-orange-500/15 text-orange-200 border-orange-500/40", dot: "bg-orange-400", text: "text-orange-300", label: "High", bar: "from-orange-500 to-amber-500" },
  medium: { badge: "bg-amber-500/15 text-amber-200 border-amber-500/40", dot: "bg-amber-400", text: "text-amber-300", label: "Medium", bar: "from-amber-500 to-yellow-500" },
  low: { badge: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40", dot: "bg-emerald-400", text: "text-emerald-300", label: "Low", bar: "from-emerald-500 to-teal-500" },
} as Record<string, { badge: string; dot: string; text: string; label: string; bar: string }>;

export default function ActionItems({ recommendations }: ActionItemsProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <Card className="glass border-white/10 rounded-2xl overflow-hidden card-hover">
        <CardHeader className="border-b border-white/[0.06] bg-white/[0.015]">
          <CardTitle className="flex items-center gap-3 font-display text-lg">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 to-orange-600/15 border border-amber-500/25 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-300" />
            </span>
            Recommended Actions
            {recommendations.length > 0 && (
              <span className="text-xs font-sans px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                {recommendations.length} item{recommendations.length === 1 ? "" : "s"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((item, index) => {
                const p = PRIORITY[item.priority] || PRIORITY.medium;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(index * 0.06, 0.4) }}
                    className="group relative flex items-start gap-4 p-4 border border-white/[0.07] rounded-2xl bg-white/[0.02] hover:bg-white/[0.045] hover:border-white/15 transition-all overflow-hidden"
                    data-testid={`card-recommendation-${index}`}
                  >
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", p.bar)} />
                    <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 font-display font-bold", p.badge)}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] leading-snug">
                        <span className={p.text}>{p.label}: </span>
                        {item.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</div>
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <Badge className={cn("rounded-full border", p.badge)}>{p.label} Priority</Badge>
                        <Badge variant="outline" className="text-xs rounded-full border-white/15 text-muted-foreground">
                          {item.regulation}
                          {item.article && ` · ${item.article}`}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 stat-glow-green"
              >
                <PartyPopper className="w-7 h-7 text-emerald-300" />
              </motion.div>
              <div className="font-display text-lg font-bold">Excellent Compliance!</div>
              <div className="text-sm text-muted-foreground mt-1">No critical issues — your site meets 2025 requirements.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
