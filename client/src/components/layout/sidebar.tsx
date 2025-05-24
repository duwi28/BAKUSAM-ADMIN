import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Package, 
  Car, 
  Tags, 
  BarChart3, 
  Bell, 
  Settings,
  Truck,
  MapPin,
  PlusCircle,
  Smartphone,
  Brain,
  BookOpen,
  Shield,
  Cloud,
  TrendingUp,
  Navigation,
  Send,
  Camera,
  Route,
  Edit,
  Calculator,
  MessageSquare,
  Zap,
  Building2,
  Handshake,
  CreditCard,
  Target,
  Globe
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Driver", href: "/drivers", icon: Users },
  { name: "Saldo & Komisi Driver", href: "/driver-balance", icon: CreditCard },
  { name: "Customer", href: "/customers", icon: UserCheck },
  { name: "Order", href: "/orders", icon: Package },
  { name: "Order Manual", href: "/manual-order", icon: PlusCircle },
  { name: "Live GPS Tracking", href: "/live-tracking", icon: Navigation },
  { name: "Push Notifications", href: "/push-notifications", icon: Send },
  { name: "Auto-Assignment", href: "/auto-assignment", icon: Zap },
  { name: "Bulk Operations", href: "/bulk-operations", icon: Edit },
  { name: "Revenue Calculator", href: "/revenue-calculator", icon: Calculator },
  { name: "Smart Route Optimization", href: "/smart-route-optimization", icon: Route },
  { name: "Sistem Rekomendasi AI", href: "/recommendation-system", icon: Brain },
  { name: "Driver Community Chat", href: "/driver-community-chat", icon: MessageSquare },
  { name: "Multi-City Management", href: "/multi-city-management", icon: Globe },
  { name: "Franchise System", href: "/franchise-system", icon: Handshake },
  { name: "Driver Credit Scoring", href: "/driver-credit-scoring", icon: CreditCard },
  { name: "Smart Demand Prediction", href: "/smart-demand-prediction", icon: Target },
  { name: "Dynamic Route Learning", href: "/dynamic-route-learning", icon: Brain },
  { name: "Kendaraan", href: "/vehicles", icon: Car },
  { name: "Tracking & Assignment", href: "/tracking", icon: MapPin },
  { name: "Tarif & Promo", href: "/pricing", icon: Tags },
  { name: "Laporan", href: "/reports", icon: BarChart3 },
  { name: "Notifikasi", href: "/notifications", icon: Bell },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 shadow-lg flex-shrink-0 transition-all duration-300 border-r border-border",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="text-primary-foreground text-lg" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-foreground">Bakusam Express</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
