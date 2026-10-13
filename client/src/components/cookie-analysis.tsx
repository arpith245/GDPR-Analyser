import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CookieAnalysisProps {
  cookieData: any;
}

export default function CookieAnalysis({ cookieData }: CookieAnalysisProps) {
  const { cookies = [], stats = {}, totalIssues = 0 } = cookieData;

  const getCookieTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      necessary: "bg-chart-1/20 text-chart-1",
      tracking: "bg-destructive/20 text-destructive", 
      marketing: "bg-chart-2/20 text-chart-2",
      functional: "bg-chart-3/20 text-chart-3"
    };
    return variants[type] || "bg-muted text-muted-foreground";
  };

  const getConsentStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      not_required: "bg-chart-1/20 text-chart-1",
      explicit: "bg-chart-1/20 text-chart-1",
      implied: "bg-chart-2/20 text-chart-2",
      no_consent: "bg-destructive/20 text-destructive"
    };
    return variants[status] || "bg-muted text-muted-foreground";
  };

  const getConsentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      not_required: "Not Required",
      explicit: "Explicit",
      implied: "Implied",
      no_consent: "No Consent"
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <i className="fas fa-cookie-bite text-chart-2 mr-3"></i>
            Cookie Analysis & 2025 Consent Mechanisms
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" data-testid="badge-issues-found">
              {totalIssues} Issues Found
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-1" data-testid="text-total-cookies">
              {stats.total || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Cookies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-2" data-testid="text-necessary-cookies">
              {stats.necessary || 0}
            </div>
            <div className="text-sm text-muted-foreground">Necessary</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive" data-testid="text-tracking-cookies">
              {(stats.tracking || 0) + (stats.marketing || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Tracking/Marketing</div>
          </div>
        </div>

        {cookies.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cookie Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Consent Status</TableHead>
                  <TableHead>2025 Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cookies.map((cookie: any, index: number) => (
                  <TableRow key={index} data-testid={`row-cookie-${index}`}>
                    <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                    <TableCell>
                      <Badge className={getCookieTypeBadge(cookie.type)}>
                        {cookie.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{cookie.domain}</TableCell>
                    <TableCell>
                      <Badge className={getConsentStatusBadge(cookie.consentStatus)}>
                        {getConsentStatusLabel(cookie.consentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cookie.gdprCompliant && cookie.dpdpCompliant ? (
                        <i className="fas fa-check text-chart-1" data-testid={`icon-compliant-${index}`}></i>
                      ) : (
                        <i className="fas fa-times text-destructive" data-testid={`icon-non-compliant-${index}`}></i>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {cookies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No cookies found in the analysis.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
