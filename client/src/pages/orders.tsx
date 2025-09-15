import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Edit, ShoppingCart, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function Orders() {
  const { selectedTenant } = useTenantContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders", selectedTenant?.id],
    queryFn: () => selectedTenant ? api.getOrders(selectedTenant.id) : Promise.resolve([]),
    enabled: !!selectedTenant,
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: newStatus }
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getSourceVariant = (source: string) => {
    switch (source) {
      case 'telegram': return 'default';
      case 'whatsapp': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredOrders = orders?.filter((order: Order) => {
    const matchesSearch = !searchQuery || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const statsCards = [
    {
      title: "Total Orders",
      value: filteredOrders.length,
      color: "primary",
    },
    {
      title: "Pending",
      value: filteredOrders.filter(o => o.status === 'pending').length,
      color: "chart-3",
    },
    {
      title: "Completed",
      value: filteredOrders.filter(o => o.status === 'completed').length,
      color: "accent",
    },
    {
      title: "Total Revenue",
      value: `$${filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0).toFixed(2)}`,
      color: "chart-1",
    },
  ];

  return (
    <div className="min-h-screen flex" data-testid="orders-page">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Order Management" description="Track and manage customer orders" />
        
        <div className="flex-1 overflow-auto p-6">
          {!selectedTenant ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a tenant</h3>
                <p className="text-muted-foreground">
                  Choose a tenant from the dropdown above to view and manage orders
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {statsCards.map((card) => (
                  <Card key={card.title} data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                          <p className="text-2xl font-bold text-foreground">{card.value}</p>
                        </div>
                        <div className={`w-10 h-10 bg-${card.color}/10 rounded-lg flex items-center justify-center`}>
                          <ShoppingCart className={`text-${card.color} w-5 h-5`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-orders"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              {isLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== "all" 
                        ? "No orders match your current filters" 
                        : "Orders will appear here once customers start placing them"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order: Order) => (
                            <TableRow key={order.id} data-testid={`order-row-${order.orderNumber}`}>
                              <TableCell className="font-medium">{order.orderNumber}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{order.customerName || "Unknown"}</p>
                                  {order.customerEmail && (
                                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(order.status)}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'outline'}>
                                  {order.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getSourceVariant(order.source || 'web')}>
                                  {order.source || 'web'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      data-testid={`order-actions-${order.orderNumber}`}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem data-testid={`view-order-${order.orderNumber}`}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                                      <>
                                        {order.status === 'pending' && (
                                          <DropdownMenuItem 
                                            onClick={() => handleStatusChange(order.id, 'processing')}
                                            data-testid={`process-order-${order.orderNumber}`}
                                          >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Mark as Processing
                                          </DropdownMenuItem>
                                        )}
                                        {order.status === 'processing' && (
                                          <DropdownMenuItem 
                                            onClick={() => handleStatusChange(order.id, 'completed')}
                                            data-testid={`complete-order-${order.orderNumber}`}
                                          >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Mark as Completed
                                          </DropdownMenuItem>
                                        )}
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
