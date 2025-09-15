import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TenantActivity } from "@/components/dashboard/tenant-activity";
import { AIPerformance } from "@/components/dashboard/ai-performance";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { DemandTracking } from "@/components/dashboard/demand-tracking";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex" data-testid="dashboard-page">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Platform Overview" 
          description="Monitor your multi-tenant AI commerce platform"
        />
        <div className="flex-1 overflow-auto scrollbar-thin p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <TenantActivity />
            <AIPerformance />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <RecentOrders />
            <DemandTracking />
          </div>
        </div>
      </main>
    </div>
  );
}
