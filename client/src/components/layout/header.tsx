import { useTenantContext } from "@/hooks/use-tenant-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TenantForm } from "@/components/forms/tenant-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { selectedTenant, setSelectedTenant } = useTenantContext();
  const [showCreateTenant, setShowCreateTenant] = useState(false);

  const { data: tenants } = useQuery({
    queryKey: ["/api/tenants"],
    queryFn: () => api.getTenants(),
  });

  const handleTenantChange = (value: string) => {
    if (value === "all") {
      setSelectedTenant(null);
    } else {
      const tenant = tenants?.find((t: any) => t.id === value);
      if (tenant) {
        setSelectedTenant(tenant);
      }
    }
  };

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground" data-testid="page-description">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Tenant Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Active Tenant:
              </label>
              <Select 
                value={selectedTenant?.id || "all"} 
                onValueChange={handleTenantChange}
                data-testid="tenant-selector"
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {tenants?.map((tenant: any) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => setShowCreateTenant(true)}
              data-testid="add-tenant-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={showCreateTenant} onOpenChange={setShowCreateTenant}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
          </DialogHeader>
          <TenantForm 
            onSuccess={() => setShowCreateTenant(false)}
            onCancel={() => setShowCreateTenant(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
