import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Analysis } from "@shared/schema";

interface ComplianceDashboardProps {
  analysis: Analysis;
  isLoading?: boolean;
}

export default function ComplianceDashboard({ analysis, isLoading }: ComplianceDashboardProps) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-1";
    if (score >= 60) return "text-chart-2";
    return "text-destructive";
  };

  const getComplianceLabel = (score: number) => {
    if (score >= 80) return "Excellent Compliance";
    if (score >= 60) return "Good Compliance";
    if (score >= 40) return "Needs Improvement";
    return "Poor Compliance";
  };

  const overallScore = analysis.overallScore || 0;
  const gdprScore = analysis.gdprScore || 0;
  const dpdpScore = analysis.dpdpScore || 0;
  const privacyDesignScore = analysis.privacyDesignScore || 0;

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Compliance Score */}
        <div className="lg:col-span-1">
          <div className="gradient-border">
            <div className="gradient-border-content p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Overall Compliance Score</h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="hsl(240 3.7% 15.9%)" strokeWidth="8" fill="none"/>
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="hsl(173 58% 39%)" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray={`${2.51 * overallScore} 251`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`} data-testid="text-overall-score">
                        {overallScore}
                      </div>
                      <div className="text-xs text-muted-foreground">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className={`font-medium ${getScoreColor(overallScore)}`}>
                  {getComplianceLabel(overallScore)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Analyzed: <span data-testid="text-analyzed-url">{analysis.url}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regulation Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Regulation Compliance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* GDPR Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <div className="font-medium">GDPR 2025</div>
                    <div className="text-sm text-muted-foreground">EU Data Protection</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress value={gdprScore} className="w-24" />
                  <span className="text-sm font-medium w-8" data-testid="text-gdpr-score">
                    {gdprScore}
                  </span>
                </div>
              </div>

              {/* DPDP Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                  <div>
                    <div className="font-medium">DPDP Act 2023</div>
                    <div className="text-sm text-muted-foreground">India Digital Protection</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress value={dpdpScore} className="w-24" />
                  <span className="text-sm font-medium w-8" data-testid="text-dpdp-score">
                    {dpdpScore}
                  </span>
                </div>
              </div>

              {/* Privacy by Design */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                  <div>
                    <div className="font-medium">Privacy by Design</div>
                    <div className="text-sm text-muted-foreground">Mandatory 2025 Requirements</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress value={privacyDesignScore} className="w-24" />
                  <span className="text-sm font-medium w-8" data-testid="text-privacy-design-score">
                    {privacyDesignScore}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
