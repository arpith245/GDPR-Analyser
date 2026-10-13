import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActionItemsProps {
  recommendations: any[];
}

export default function ActionItems({ recommendations }: ActionItemsProps) {
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-destructive/20 text-destructive border-destructive",
      high: "bg-chart-4/20 text-chart-4 border-chart-4",
      medium: "bg-chart-2/20 text-chart-2 border-chart-2",
      low: "bg-chart-1/20 text-chart-1 border-chart-1"
    };
    return colors[priority] || "bg-muted/20 text-muted-foreground border-muted";
  };

  const getPriorityNumber = (priority: string) => {
    const numbers: Record<string, string> = {
      critical: "bg-destructive/20 text-destructive",
      high: "bg-chart-4/20 text-chart-4", 
      medium: "bg-chart-2/20 text-chart-2",
      low: "bg-chart-1/20 text-chart-1"
    };
    return numbers[priority] || "bg-muted/20 text-muted-foreground";
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      critical: "Critical Priority",
      high: "High Priority",
      medium: "Medium Priority", 
      low: "Low Priority"
    };
    return labels[priority] || "Unknown Priority";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-lightbulb text-chart-2 mr-3"></i>
          Recommended Actions for 2025 Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((item, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-4 border border-border rounded-lg"
                data-testid={`card-recommendation-${index}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getPriorityNumber(item.priority)}`}>
                  <span className="font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${item.priority === 'critical' ? 'text-destructive' : 
                    item.priority === 'high' ? 'text-chart-4' :
                    item.priority === 'medium' ? 'text-chart-2' : 'text-chart-1'}`}>
                    {item.priority === 'critical' ? 'Critical: ' : 
                     item.priority === 'high' ? 'High: ' :
                     item.priority === 'medium' ? 'Medium: ' : 'Low: '}
                    {item.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {getPriorityLabel(item.priority)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.regulation}
                      {item.article && ` - ${item.article}`}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-check-circle text-4xl text-chart-1 mb-4"></i>
            <div className="text-lg font-medium">Excellent Compliance!</div>
            <div className="text-sm">No critical issues found. Your website meets 2025 compliance requirements.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
