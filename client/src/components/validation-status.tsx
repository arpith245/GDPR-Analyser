import { motion } from "framer-motion";
import { UserCheck, Download, Trash2, Bell, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ValidationStatusProps {
  validationData: any;
}

export default function ValidationStatus({ validationData }: ValidationStatusProps) {
  const {
    consentManagement = "missing",
    dataPortability = "missing",
    rightToErasure = "missing",
    breachNotification = "missing",
  } = validationData;

  const iconFor = (s: string) =>
    s === "implemented" || s === "compliant" ? CheckCircle2 : s === "partial" ? AlertTriangle : s === "missing" ? XCircle : HelpCircle;
  const colorFor = (s: string) =>
    s === "implemented" || s === "compliant" ? "text-emerald-300" : s === "partial" ? "text-amber-300" : s === "missing" ? "text-rose-300" : "text-muted-foreground";
  const ringFor = (s: string) =>
    s === "implemented" || s === "compliant"
      ? "from-emerald-500/25 to-teal-500/10 border-emerald-500/30"
      : s === "partial"
        ? "from-amber-500/25 to-orange-500/10 border-amber-500/30"
        : "from-rose-500/25 to-red-500/10 border-rose-500/30";
  const labelFor = (s: string) =>
    s === "implemented" ? "Implemented" : s === "partial" ? "Partial" : s === "missing" ? "Missing" : s === "compliant" ? "Compliant" : s;

  const items = [
    { key: "consent-management", title: "Consent Management", desc: "Banner & preferences", status: consentManagement, icon: UserCheck },
    { key: "data-portability", title: "Data Portability", desc: "Export user data", status: dataPortability, icon: Download },
    { key: "right-erasure", title: "Right to Erasure", desc: "Delete on request", status: rightToErasure, icon: Trash2 },
    { key: "breach-notification", title: "Breach Notification", desc: "72h disclosure", status: breachNotification, icon: Bell },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <Card className="glass border-white/10 rounded-2xl overflow-hidden card-hover">
        <CardHeader className="border-b border-white/[0.06] bg-white/[0.015]">
          <CardTitle className="flex items-center gap-3 font-display text-lg">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/25 to-violet-600/15 border border-blue-500/25 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-300" />
            </span>
            Data Subject Rights
            <span className="hidden sm:inline text-xs font-sans font-normal text-muted-foreground">real-time validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {items.map((item, i) => {
              const StatusIcon = iconFor(item.status);
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-white/15 hover:bg-white/[0.04] transition-all group"
                  data-testid={`card-${item.key}`}
                >
                  <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br border flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110", ringFor(item.status))}>
                    <item.icon className={cn("w-6 h-6", colorFor(item.status))} />
                  </div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-[11px] text-muted-foreground mb-2">{item.desc}</div>
                  <div className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04]", colorFor(item.status))} data-testid={`text-${item.key}-status`}>
                    <StatusIcon className="w-3 h-3" />
                    {labelFor(item.status)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
