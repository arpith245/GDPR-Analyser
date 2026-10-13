import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Globe, ScanLine, Cookie, Radar, Lock, Sparkles, Play, Loader2, Info, ShieldCheck, Zap } from "lucide-react";
import { analysisRequestSchema, type AnalysisRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface AnalysisFormProps {
  onAnalysisStarted: (analysisId: string, url: string) => void;
  onScanStart?: (url: string) => void;
  isScanning?: boolean;
}

const OPTION_META = [
  { key: "cookieAnalysis" as const, label: "Cookies", desc: "Consent & types", icon: Cookie, grad: "from-amber-400/20 to-orange-500/10 text-amber-300" },
  { key: "beaconDetection" as const, label: "Beacons", desc: "Pixels & trackers", icon: Radar, grad: "from-cyan-400/20 to-blue-500/10 text-cyan-300" },
  { key: "securityCheck" as const, label: "Security", desc: "TLS & headers", icon: Lock, grad: "from-emerald-400/20 to-teal-500/10 text-emerald-300" },
  { key: "aiConsent" as const, label: "AI Consent", desc: "AI processing", icon: Sparkles, grad: "from-violet-400/20 to-purple-500/10 text-violet-300" },
];

const TYPE_META: Record<string, { label: string; desc: string; icon: any }> = {
  full: { label: "Full Analysis", desc: "Everything", icon: ScanLine },
  gdpr: { label: "GDPR Only", desc: "EU focus", icon: ShieldCheck },
  dpdp: { label: "DPDP Only", desc: "India focus", icon: Globe },
  quick: { label: "Quick Scan", desc: "~10s overview", icon: Zap },
};

export default function AnalysisForm({ onAnalysisStarted, onScanStart, isScanning }: AnalysisFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AnalysisRequest>({
    resolver: zodResolver(analysisRequestSchema),
    defaultValues: {
      url: "",
      analysisType: "full",
      options: {
        cookieAnalysis: true,
        beaconDetection: true,
        securityCheck: true,
        aiConsent: true,
      },
    },
  });

  const analysisMutation = useMutation({
    mutationFn: async (data: AnalysisRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return response.json();
    },
    // Fire instantly on click — dashboard shows the working window immediately,
    // no waiting for the server round-trip
    onMutate: (data) => {
      onScanStart?.(data.url);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        onAnalysisStarted(data.analysisId, variables?.url || "");
        queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
        toast({
          title: "Scan running…",
          description: "Follow live progress just below — results land here automatically.",
        });
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to start analysis",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnalysisRequest) => {
    analysisMutation.mutate(data);
  };

  const watchType = form.watch("analysisType");

  return (
    <section className="mb-10 animate-fade-up">
      <div className="gradient-border">
        <div className="gradient-border-content p-6 md:p-8 relative overflow-hidden">
          {/* glow orbs inside card */}
          <div className="aurora-orb w-72 h-72 bg-blue-600/20 -top-24 -right-16" />
          <div className="aurora-orb w-64 h-64 bg-violet-600/15 top-20 -left-20" />

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center shrink-0"
              >
                <ScanLine className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-700 font-bold tracking-tight">
                  Website Privacy Analysis
                </h2>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  GDPR 2025 + DPDP Act engine · live headless scan
                </p>
              </div>
              <div className="md:ml-auto flex items-center gap-2 text-xs">
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <span
                    key={k}
                    className={cn(
                      "hidden lg:inline-flex px-2.5 py-1 rounded-full border transition-all",
                      watchType === k
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-200"
                        : "border-white/10 text-muted-foreground"
                    )}
                  >
                    {v.label}
                  </span>
                ))}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Website URL</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                            <Input
                              placeholder="https://example.com"
                              data-testid="input-website-url"
                              className="pl-11 h-13 py-3.5 text-base bg-white/[0.04] border-white/10 rounded-xl focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-muted-foreground/60"
                              {...field}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
                              <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">https://</kbd>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="analysisType"
                    render={({ field }) => (
                      <FormItem className="md:w-56">
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Analysis type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-analysis-type" className="h-[52px] rounded-xl bg-white/[0.04] border-white/10 focus:border-blue-500/60">
                              <SelectValue placeholder="Select analysis type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-strong border-white/10">
                            {Object.entries(TYPE_META).map(([k, v]) => (
                              <SelectItem key={k} value={k}>
                                <span className="flex items-center gap-2">
                                  <v.icon className="w-4 h-4" /> {v.label}
                                  <span className="text-xs text-muted-foreground">· {v.desc}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {OPTION_META.map((opt, i) => (
                    <FormField
                      key={opt.key}
                      control={form.control}
                      name={`options.${opt.key}`}
                      render={({ field }) => {
                        const on = !!field.value;
                        const Icon = opt.icon;
                        return (
                          <button
                            type="button"
                            onClick={() => field.onChange(!on)}
                            data-testid={`checkbox-${opt.key === "cookieAnalysis" ? "cookie-analysis" : opt.key === "beaconDetection" ? "beacon-detection" : opt.key === "securityCheck" ? "security-check" : "ai-consent"}`}
                            className={cn(
                              "relative text-left rounded-2xl border p-3.5 transition-all duration-200 group overflow-hidden",
                              on
                                ? "border-blue-500/40 bg-blue-500/[0.08] shadow-[0_0_24px_rgba(59,130,246,0.15)]"
                                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                            )}
                            style={{ animationDelay: `${i * 80}ms` }}
                          >
                            <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110", opt.grad)}>
                              <Icon className="w-[18px] h-[18px]" />
                            </div>
                            <div className="text-sm font-semibold leading-none">{opt.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                            <div
                              className={cn(
                                "absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                on ? "bg-blue-500 border-blue-500 scale-100" : "border-white/20 scale-90"
                              )}
                            >
                              {on && (
                                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M2.5 6.2 4.8 8.5 9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    Includes 2025 GDPR updates, DPDP Act rules & AI-consent checks
                  </div>
                  <Button
                    type="submit"
                    disabled={analysisMutation.isPending || isScanning}
                    data-testid="button-start-analysis"
                    className="gradient-btn rounded-xl px-7 h-12 text-[15px] font-semibold text-white border-0 min-w-[190px]"
                  >
                    {analysisMutation.isPending || isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning… see progress below
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
