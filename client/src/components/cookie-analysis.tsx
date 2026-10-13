import { motion } from "framer-motion";
import { Cookie, Check, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CookieAnalysisProps {
  cookieData: any;
}

export default function CookieAnalysis({ cookieData }: CookieAnalysisProps) {
  const { cookies = [], stats = {}, totalIssues = 0 } = cookieData;

  const badgeFor = (type: string) => {
    const m: Record<string, string> = {
      necessary: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
      tracking: "bg-rose-500/15 text-rose-200 border-rose-500/30",
      marketing: "bg-amber-500/15 text-amber-200 border-amber-500/30",
      functional: "bg-sky-500/15 text-sky-200 border-sky-500/30",
    };
    return m[type] || "bg-white/5 text-muted-foreground border-white/10";
  };
  const consentBadge = (s: string) => {
    const m: Record<string, string> = {
      not_required: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
      explicit: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
      implied: "bg-amber-500/15 text-amber-200 border-amber-500/30",
      no_consent: "bg-rose-500/15 text-rose-200 border-rose-500/30",
    };
    return m[s] || "bg-white/5 text-muted-foreground border-white/10";
  };
  const consentLabel: Record<string, string> = { not_required: "Not Required", explicit: "Explicit", implied: "Implied", no_consent: "No Consent" };

  const statCards = [
    { label: "Total Cookies", value: stats.total || 0, testid: "text-total-cookies", color: "text-sky-300", bg: "from-sky-500/15 to-transparent", icon: Cookie },
    { label: "Necessary", value: stats.necessary || 0, testid: "text-necessary-cookies", color: "text-emerald-300", bg: "from-emerald-500/15 to-transparent", icon: Check },
    { label: "Tracking / Marketing", value: (stats.tracking || 0) + (stats.marketing || 0), testid: "text-tracking-cookies", color: "text-rose-300", bg: "from-rose-500/15 to-transparent", icon: AlertTriangle },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
      <Card className="glass border-white/10 rounded-2xl overflow-hidden card-hover">
        <CardHeader className="border-b border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-3 font-display text-lg">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 to-orange-600/15 border border-amber-500/25 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-amber-300" />
              </span>
              Cookie Analysis
              <span className="hidden sm:inline text-xs font-sans font-normal text-muted-foreground">2025 consent mechanisms</span>
            </CardTitle>
            <Badge variant="secondary" data-testid="badge-issues-found" className={cn("rounded-full px-3 py-1 border", totalIssues > 0 ? "bg-rose-500/15 text-rose-200 border-rose-500/30" : "bg-emerald-500/15 text-emerald-200 border-emerald-500/30")}>
              {totalIssues} Issues Found
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {statCards.map((s) => (
              <div key={s.label} className={cn("rounded-2xl border border-white/[0.07] bg-gradient-to-b p-4 text-center transition-transform hover:scale-[1.02]", s.bg)}>
                <s.icon className={cn("w-4 h-4 mx-auto mb-2", s.color)} />
                <div className={cn("font-display text-3xl font-bold tabular-nums", s.color)} data-testid={s.testid}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {cookies.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/[0.03] hover:bg-white/[0.03] border-white/[0.07]">
                    <TableHead className="text-muted-foreground">Cookie Name</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Domain</TableHead>
                    <TableHead className="text-muted-foreground">Consent</TableHead>
                    <TableHead className="text-muted-foreground text-center">2025 OK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cookies.map((cookie: any, index: number) => {
                    const ok = cookie.gdprCompliant && cookie.dpdpCompliant;
                    return (
                      <TableRow key={index} data-testid={`row-cookie-${index}`} className="border-white/[0.06] hover:bg-blue-500/[0.05] transition-colors">
                        <TableCell className="font-mono text-[13px] text-blue-200">{cookie.name}</TableCell>
                        <TableCell><Badge className={cn("border rounded-full capitalize", badgeFor(cookie.type))}>{cookie.type}</Badge></TableCell>
                        <TableCell className="text-[13px] text-muted-foreground max-w-[180px] truncate">{cookie.domain}</TableCell>
                        <TableCell><Badge className={cn("border rounded-full", consentBadge(cookie.consentStatus))}>{consentLabel[cookie.consentStatus] || cookie.consentStatus}</Badge></TableCell>
                        <TableCell className="text-center">
                          <span className={cn("inline-flex w-6 h-6 rounded-full items-center justify-center", ok ? "bg-emerald-500/15" : "bg-rose-500/15")}>
                            {ok
                              ? <Check className="w-3.5 h-3.5 text-emerald-300" data-testid={`icon-compliant-${index}`} />
                              : <X className="w-3.5 h-3.5 text-rose-300" data-testid={`icon-non-compliant-${index}`} />}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-emerald-300" />
              </div>
              <p className="text-muted-foreground text-sm">No cookies found — clean slate.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
