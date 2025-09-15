import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export function TenantActivity() {
  const { data: activity, isLoading } = useQuery({
    queryKey: ["/api/analytics/tenant-activity"],
    queryFn: () => api.getTenantActivity(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent';
      case 'moderate': return 'bg-chart-3';
      default: return 'bg-muted-foreground';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card data-testid="tenant-activity-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tenant Activity</CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity?.map((item: any) => (
            <div 
              key={item.tenant.id} 
              className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              data-testid={`tenant-activity-${item.tenant.slug}`}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {getInitials(item.tenant.name)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.tenant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.conversationCount} conversations • {item.orderCount} orders • ${item.revenue.toFixed(2)} revenue
                </p>
              </div>
              <div className="text-right">
                <div className={`w-2 h-2 ${getStatusColor(item.status)} rounded-full mb-1`}></div>
                <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-center text-muted-foreground hover:text-foreground text-sm font-medium"
          data-testid="view-all-tenants-button"
        >
          View All Tenants
        </Button>
      </CardContent>
    </Card>
  );
}
