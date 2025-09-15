import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from "lucide-react";

export function AIPerformance() {
  const metrics = [
    { name: "Response Accuracy", value: 94.2, color: "bg-accent" },
    { name: "Intent Recognition", value: 89.7, color: "bg-primary" },
    { name: "Handoff Rate", value: 8.3, color: "bg-chart-4" },
    { name: "User Satisfaction", value: 92, color: "bg-chart-3", display: "4.6/5" },
  ];

  return (
    <Card data-testid="ai-performance-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Performance</CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.name} data-testid={`ai-metric-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{metric.name}</span>
                <span className="text-sm font-medium text-foreground">
                  {metric.display || `${metric.value}%`}
                </span>
              </div>
              <Progress value={metric.value} className="h-2" />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <span className="font-medium text-accent">AI Insight</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Response accuracy improved by 3.2% this week. Consider expanding the knowledge base for construction materials category.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
