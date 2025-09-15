import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TenantProvider } from "./hooks/use-tenant-context";
import Dashboard from "@/pages/dashboard";
import Tenants from "@/pages/tenants";
import Catalog from "@/pages/catalog";
import Orders from "@/pages/orders";
import Conversations from "@/pages/conversations";
import KnowledgeBase from "@/pages/knowledge-base";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tenants" component={Tenants} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/orders" component={Orders} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TenantProvider>
          <Toaster />
          <Router />
        </TenantProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
