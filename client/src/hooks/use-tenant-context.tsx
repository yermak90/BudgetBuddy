import { createContext, useContext, useState, type ReactNode } from "react";
import type { Tenant } from "@shared/schema";

interface TenantContextValue {
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  return (
    <TenantContext.Provider value={{ selectedTenant, setSelectedTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenantContext must be used within a TenantProvider");
  }
  return context;
}
