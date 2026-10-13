import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BeaconAnalysisProps {
  beaconData: any;
}

export default function BeaconAnalysis({ beaconData }: BeaconAnalysisProps) {
  const { beacons = [], stats = {}, totalViolations = 0 } = beaconData;

  const getBeaconIcon = (type: string) => {
    const icons: Record<string, string> = {
      pixel: "fas fa-eye",
      ai: "fas fa-robot",
      marketing: "fas fa-bullseye",
      analytics: "fas fa-chart-line"
    };
    return icons[type] || "fas fa-wifi";
  };

  const getBeaconIconColor = (type: string) => {
    const colors: Record<string, string> = {
      pixel: "text-chart-3",
      ai: "text-chart-4",
      marketing: "text-chart-2",
      analytics: "text-chart-1"
    };
    return colors[type] || "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <i className="fas fa-wifi text-chart-3 mr-3"></i>
            Web Beacon & AI System Privacy Assessment
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" data-testid="badge-beacons-detected">
              {beacons.length} Beacons Detected
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-chart-3" data-testid="text-pixel-beacons">
              {stats.pixel || 0}
            </div>
            <div className="text-sm text-muted-foreground">Pixel Beacons</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-chart-4" data-testid="text-ai-beacons">
              {stats.ai || 0}
            </div>
            <div className="text-sm text-muted-foreground">AI Trackers</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-chart-1" data-testid="text-cross-border">
              {stats.crossBorder || 0}
            </div>
            <div className="text-sm text-muted-foreground">Cross-Border</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-destructive" data-testid="text-violations">
              {totalViolations}
            </div>
            <div className="text-sm text-muted-foreground">Violations</div>
          </div>
        </div>

        {beacons.length > 0 && (
          <div className="space-y-3">
            {beacons.map((beacon: any, index: number) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border border-border rounded-lg"
                data-testid={`card-beacon-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-chart-3/20 rounded-full flex items-center justify-center">
                    <i className={`${getBeaconIcon(beacon.type)} ${getBeaconIconColor(beacon.type)} text-xs`}></i>
                  </div>
                  <div>
                    <div className="font-medium">{beacon.name}</div>
                    <div className="text-sm text-muted-foreground">{beacon.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {beacon.gdprViolation && (
                    <Badge className="bg-destructive/20 text-destructive">GDPR Violation</Badge>
                  )}
                  {beacon.dpdpViolation && (
                    <Badge className="bg-chart-2/20 text-chart-2">DPDP Warning</Badge>
                  )}
                  {beacon.aiConsentRequired && (
                    <Badge className="bg-chart-4/20 text-chart-4">AI Consent Required</Badge>
                  )}
                  {!beacon.gdprViolation && !beacon.dpdpViolation && (
                    <Badge className="bg-chart-1/20 text-chart-1">Compliant</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {beacons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No web beacons detected in the analysis.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
