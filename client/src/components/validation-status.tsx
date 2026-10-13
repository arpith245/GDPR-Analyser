import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationStatusProps {
  validationData: any;
}

export default function ValidationStatus({ validationData }: ValidationStatusProps) {
  const {
    consentManagement = "missing",
    dataPortability = "missing", 
    rightToErasure = "missing",
    breachNotification = "missing"
  } = validationData;

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      implemented: "fas fa-check-circle",
      partial: "fas fa-exclamation-triangle",
      missing: "fas fa-times-circle",
      compliant: "fas fa-check-circle"
    };
    return icons[status] || "fas fa-question-circle";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      implemented: "text-chart-1",
      partial: "text-chart-2", 
      missing: "text-destructive",
      compliant: "text-chart-1"
    };
    return colors[status] || "text-muted-foreground";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      implemented: "Implemented",
      partial: "Partial",
      missing: "Missing",
      compliant: "Compliant"
    };
    return labels[status] || status;
  };

  const validationItems = [
    {
      key: "consent-management",
      title: "Consent Management",
      status: consentManagement,
      icon: "fas fa-user-check"
    },
    {
      key: "data-portability",
      title: "Data Portability",
      status: dataPortability,
      icon: "fas fa-download"
    },
    {
      key: "right-erasure",
      title: "Right to Erasure",
      status: rightToErasure,
      icon: "fas fa-trash"
    },
    {
      key: "breach-notification",
      title: "Breach Notification",
      status: breachNotification,
      icon: "fas fa-bell"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-tasks text-primary mr-3"></i>
          Real-time Validation & Data Subject Rights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {validationItems.map((item) => (
            <div key={item.key} className="text-center" data-testid={`card-${item.key}`}>
              <div className={`w-16 h-16 ${item.status === 'implemented' || item.status === 'compliant' 
                  ? 'bg-chart-1/20' 
                  : item.status === 'partial' 
                  ? 'bg-chart-2/20' 
                  : 'bg-destructive/20'
                } rounded-full flex items-center justify-center mx-auto mb-2`}>
                <i className={`${item.icon} ${getStatusColor(item.status)} text-xl`}></i>
              </div>
              <div className="text-sm font-medium">{item.title}</div>
              <div className={`text-xs ${getStatusColor(item.status)}`} data-testid={`text-${item.key}-status`}>
                {getStatusLabel(item.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
