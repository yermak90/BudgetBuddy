import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function DemandTracking() {
  const { selectedTenant } = useTenantContext();

  const { data: demandData, isLoading } = useQuery({
    queryKey: ["/api/analytics/demand-tracking", selectedTenant?.id],
    queryFn: () => selectedTenant ? api.getDemandTracking(selectedTenant.id) : Promise.resolve([]),
    enabled: !!selectedTenant,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demand Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topMissedQueries = demandData?.filter((item: any) => item.noResultsCount > 0).slice(0, 5) || [];
  const totalLostRevenue = topMissedQueries.reduce((sum: number, item: any) => 
    sum + parseFloat(item.potentialRevenue || 0), 0);

  return (
    <Card data-testid="demand-tracking-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Demand Tracking</CardTitle>
          <Button variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedTenant ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a tenant to view demand tracking data
          </div>
        ) : (
          <div className="space-y-4">
            {totalLostRevenue > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="font-medium text-destructive">Stock Gap Alert</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {topMissedQueries.length} product queries with no results found
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lost Revenue:</span>
                    <span className="font-medium text-foreground">
                      ~${totalLostRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recommendation:</span>
                    <span className="font-medium text-accent">Review catalog gaps</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Top Search Queries (No Results)</h4>
              {topMissedQueries.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No missed queries found
                </div>
              ) : (
                topMissedQueries.map((query: any) => (
                  <div 
                    key={query.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded"
                    data-testid={`missed-query-${query.query.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{query.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {query.searchCount} searches • {query.noResultsCount} no results
                      </p>
                    </div>
                    <Button size="sm" variant="outline" data-testid={`add-product-${query.id}`}>
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Button 
              className="w-full mt-4" 
              variant="outline"
              data-testid="generate-procurement-report-button"
            >
              Generate Procurement Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
