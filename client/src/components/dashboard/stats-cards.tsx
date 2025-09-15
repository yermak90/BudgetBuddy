import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Card, CardContent } from "@/components/ui/card";
import { Building, MessageSquare, DollarSign, Brain, TrendingUp } from "lucide-react";

export function StatsCards() {
  const { selectedTenant } = useTenantContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/stats", selectedTenant?.id],
    queryFn: () => api.getStats(selectedTenant?.id),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Tenants",
      value: stats?.activeTenants || 0,
      change: "+3 this month",
      icon: Building,
      color: "primary",
    },
    {
      title: "Total Conversations",
      value: (stats?.totalConversations || 0).toLocaleString(),
      change: "+847 today",
      icon: MessageSquare,
      color: "accent",
    },
    {
      title: "Revenue (30d)",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "chart-3",
    },
    {
      title: "AI Accuracy",
      value: `${(stats?.aiAccuracy || 94.2).toFixed(1)}%`,
      change: "+2.1%",
      icon: Brain,
      color: "chart-5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title} data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={`stat-value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${card.color}/10 rounded-lg flex items-center justify-center`}>
                <card.icon className={`text-${card.color} text-xl`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-accent text-sm font-medium">{card.change}</span>
              <TrendingUp className="w-3 h-3 text-accent" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
