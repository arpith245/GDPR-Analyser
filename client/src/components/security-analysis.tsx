import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SecurityAnalysisProps {
  securityData: any;
}

export default function SecurityAnalysis({ securityData }: SecurityAnalysisProps) {
  const {
    tlsVersion = "Unknown",
    certificateGrade = "F",
    hstsEnabled = false,
    perfectForwardSecrecy = false,
    crossBorderTransfers = []
  } = securityData;

  const getCertificateGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-chart-1',
      'A': 'text-chart-1',
      'B': 'text-chart-2',
      'C': 'text-chart-2',
      'D': 'text-destructive',
      'F': 'text-destructive'
    };
    return colors[grade] || 'text-muted-foreground';
  };

  const getAdequacyBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Data Privacy Framework': 'bg-chart-1/20 text-chart-1',
      'Approved': 'bg-chart-1/20 text-chart-1',
      'Review Needed': 'bg-chart-2/20 text-chart-2',
      'Restricted': 'bg-destructive/20 text-destructive'
    };
    return variants[status] || 'bg-muted/20 text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <i className="fas fa-shield-alt text-chart-1 mr-3"></i>
            Transmission Security & Cross-Border Transfer Analysis
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${certificateGrade === 'A+' ? 'bg-chart-1/20 text-chart-1' : 'bg-chart-2/20 text-chart-2'}`}>
              {certificateGrade === 'A+' ? 'Secure' : 'Needs Review'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">SSL/TLS Configuration</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">TLS Version</span>
                <span className="text-sm font-medium text-chart-1" data-testid="text-tls-version">
                  {tlsVersion}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Certificate Grade</span>
                <span className={`text-sm font-medium ${getCertificateGradeColor(certificateGrade)}`} data-testid="text-certificate-grade">
                  {certificateGrade}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">HSTS Enabled</span>
                <i className={`fas fa-${hstsEnabled ? 'check text-chart-1' : 'times text-destructive'}`} data-testid={`icon-hsts-${hstsEnabled ? 'enabled' : 'disabled'}`}></i>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Perfect Forward Secrecy</span>
                <i className={`fas fa-${perfectForwardSecrecy ? 'check text-chart-1' : 'times text-destructive'}`} data-testid={`icon-pfs-${perfectForwardSecrecy ? 'enabled' : 'disabled'}`}></i>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Cross-Border Data Flows</h4>
            {crossBorderTransfers.length > 0 ? (
              <div className="space-y-2">
                {crossBorderTransfers.map((transfer: any, index: number) => (
                  <div key={index} className="border border-border rounded-lg p-3" data-testid={`card-transfer-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">→ {transfer.destination}</span>
                      <Badge className={getAdequacyBadge(transfer.adequacyStatus)}>
                        {transfer.adequacyStatus}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Safeguards: {transfer.safeguards.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No cross-border transfers detected.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
