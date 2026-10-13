import { motion } from "framer-motion";
import { ShieldCheck, Check, X, Globe2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SecurityAnalysisProps {
  securityData: any;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-300", A: "text-emerald-300", B: "text-amber-300",
  C: "text-amber-300", D: "text-rose-300", F: "text-rose-300",
};

export default function SecurityAnalysis({ securityData }: SecurityAnalysisProps) {
  const {
    tlsVersion = "Unknown",
    certificateGrade = "F",
    hstsEnabled = false,
    perfectForwardSecrecy = false,
    crossBorderTransfers = [],
  } = securityData;

  const secure = certificateGrade === "A+" || certificateGrade === "A";

  const checks = [
    { label: "TLS Version", value: tlsVersion, testid: "text-tls-version", ok: tlsVersion !== "Unknown" && !String(tlsVersion).includes("1.0"), valueCls: "text-emerald-300 font-mono" },
    { label: "Certificate Grade", value: certificateGrade, testid: "text-certificate-grade", ok: secure, valueCls: cn("font-display font-bold", GRADE_COLORS[certificateGrade] || "text-muted-foreground") },
    { label: "HSTS Enabled", bool: hstsEnabled, testid: `icon-hsts-${hstsEnabled ? "enabled" : "disabled"}` },
    { label: "Forward Secrecy", bool: perfectForwardSecrecy, testid: `icon-pfs-${perfectForwardSecrecy ? "enabled" : "disabled"}` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <Card className="glass border-white/10 rounded-2xl overflow-hidden card-hover">
        <CardHeader className="border-b border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-3 font-display text-lg">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/25 to-teal-600/15 border border-emerald-500/25 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </span>
              Security & Data Transfers
            </CardTitle>
            <Badge className={cn("rounded-full px-3 py-1 border", secure ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" : "bg-amber-500/15 text-amber-200 border-amber-500/30")}>
              <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", secure ? "bg-emerald-400" : "bg-amber-400")} />
              {secure ? "Secure" : "Needs Review"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">SSL / TLS configuration</h4>
              <div className="space-y-3">
                {checks.map((c) => (
                  <div key={c.label} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.05] last:border-0">
                    <span className="text-sm text-muted-foreground">{c.label}</span>
                    {"bool" in c ? (
                      <span data-testid={c.testid} className={cn("inline-flex items-center gap-1.5 text-sm font-medium", c.bool ? "text-emerald-300" : "text-rose-300")}>
                        <span className={cn("w-5 h-5 rounded-full flex items-center justify-center", c.bool ? "bg-emerald-500/15" : "bg-rose-500/15")}>
                          {c.bool ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </span>
                        {c.bool ? "On" : "Off"}
                      </span>
                    ) : (
                      <span className={cn("text-sm", c.valueCls)} data-testid={c.testid}>{c.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5" /> Cross-border flows
              </h4>
              {crossBorderTransfers.length > 0 ? (
                <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                  {crossBorderTransfers.map((transfer: any, index: number) => (
                    <div key={index} className="border border-white/[0.07] rounded-xl p-3 bg-white/[0.02]" data-testid={`card-transfer-${index}`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-medium">→ {transfer.destination}</span>
                        <Badge className={cn("rounded-full border text-[11px]",
                          transfer.adequacyStatus === "Approved" || transfer.adequacyStatus === "Data Privacy Framework"
                            ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
                            : transfer.adequacyStatus === "Review Needed"
                              ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-200 border-rose-500/30")}>
                          {transfer.adequacyStatus}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">Safeguards: {transfer.safeguards.join(", ")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-2.5">
                    <Check className="w-5 h-5 text-emerald-300" />
                  </div>
                  <p className="text-sm text-muted-foreground">No cross-border transfers — data stays local.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
