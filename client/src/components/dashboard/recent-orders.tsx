import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RecentOrders() {
  const { selectedTenant } = useTenantContext();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders", selectedTenant?.id],
    queryFn: () => selectedTenant ? api.getOrders(selectedTenant.id) : Promise.resolve([]),
    enabled: !!selectedTenant,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      default: return 'destructive';
    }
  };

  const getSourceVariant = (source: string) => {
    switch (source) {
      case 'telegram': return 'default';
      case 'whatsapp': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentOrders = orders?.slice(0, 10) || [];

  return (
    <Card className="xl:col-span-2" data-testid="recent-orders-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button size="sm" data-testid="view-all-orders-button">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {selectedTenant ? "No orders found for this tenant" : "Select a tenant to view orders"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order: any) => (
                  <TableRow key={order.id} data-testid={`order-row-${order.orderNumber}`}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName || order.customerId || "Unknown"}</TableCell>
                    <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSourceVariant(order.source)}>
                        {order.source || "web"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
