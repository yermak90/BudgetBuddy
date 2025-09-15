import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TenantForm } from "@/components/forms/tenant-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Building, Users, TrendingUp } from "lucide-react";

export default function Tenants() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["/api/tenants"],
    queryFn: () => api.getTenants(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header title="Tenant Management" description="Manage tenant organizations and settings" />
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" data-testid="tenants-page">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Tenant Management" description="Manage tenant organizations and settings" />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">All Tenants</h3>
              <p className="text-muted-foreground">{tenants?.length || 0} organizations</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} data-testid="create-tenant-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>

          {tenants?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tenants yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first tenant organization to get started
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Tenant
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants?.map((tenant: any) => (
                <Card key={tenant.id} data-testid={`tenant-card-${tenant.slug}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">
                            {tenant.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                        </div>
                      </div>
                      <Badge variant={tenant.isActive ? "default" : "secondary"}>
                        {tenant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tenant.description || "No description provided"}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="capitalize">{tenant.industry || "Not specified"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Users className="w-4 h-4 mr-1" />
                        Users
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm 
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
