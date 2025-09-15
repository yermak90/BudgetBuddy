import { Link, useLocation } from "wouter";
import { 
  Home, 
  Building, 
  Users, 
  Box, 
  ShoppingCart, 
  Warehouse, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  Brain, 
  BarChart3, 
  TrendingUp, 
  LogOut,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Tenants", href: "/tenants", icon: Building },
      { name: "Users & Roles", href: "/users", icon: Users },
    ]
  },
  {
    name: "Commerce", 
    items: [
      { name: "Product Catalog", href: "/catalog", icon: Box },
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      { name: "Inventory", href: "/inventory", icon: Warehouse },
      { name: "Documents", href: "/documents", icon: FileText },
    ]
  },
  {
    name: "AI & Support",
    items: [
      { name: "Conversations", href: "/conversations", icon: MessageSquare },
      { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
      { name: "AI Configuration", href: "/ai-config", icon: Brain },
    ]
  },
  {
    name: "Analytics",
    items: [
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Demand Tracking", href: "/demand", icon: TrendingUp },
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-foreground">AI Commerce</h1>
            <p className="text-sm text-muted-foreground">Multi-Tenant Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" data-testid="sidebar-navigation">
        {navigation.map((section) => (
          <div key={section.name} className="mb-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {section.name}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
