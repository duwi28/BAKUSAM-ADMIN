import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import RevenueChart from "@/components/charts/revenue-chart";
import OrdersChart from "@/components/charts/orders-chart";
import DriverModal from "@/components/modals/driver-modal";
import { useState, useEffect } from "react";
import { 
  Package, 
  Users, 
  DollarSign, 
  Star, 
  UserPlus, 
  Percent, 
  Megaphone, 
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Truck,
  Zap,
  Sparkles,
  Target,
  Award,
  Gauge,
  FileText,
  PieChart,
  Bell,
  Edit,
  MapPin,
  Calendar,
  Download
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface DashboardStats {
  drivers: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export default function Dashboard() {
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCardIndex(prev => prev + 1);
    }, 200);
    
    return () => clearInterval(timer);
  }, []);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  const quickActions = [
    {
      title: "Tambah Driver",
      description: "Daftarkan driver baru",
      icon: UserPlus,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-700",
      action: () => setIsDriverModalOpen(true),
    },
    {
      title: "Push Notification",
      description: "Kirim notifikasi instan",
      icon: Bell,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50 hover:bg-red-100",
      textColor: "text-red-700",
      action: () => window.location.href = "/push-notifications",
    },
    {
      title: "Bulk Operations",
      description: "Operasi massal data",
      icon: Edit,
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
      textColor: "text-indigo-700",
      action: () => window.location.href = "/bulk-operations",
    },
    {
      title: "Smart AI Operations",
      description: "AI & machine learning",
      icon: Sparkles,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      textColor: "text-purple-700",
      action: () => window.location.href = "/smart-ai-operations",
    },
  ];

  const statsCards = [
    {
      title: "Total Order Hari Ini",
      value: stats?.orders.total || 0,
      change: "+12% dari kemarin",
      icon: Package,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      positive: true,
    },
    {
      title: "Driver Aktif",
      value: stats?.drivers.active || 0,
      change: "+3 driver baru",
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      positive: true,
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatCurrency(stats?.revenue.today || 0),
      change: "+8% dari kemarin",
      icon: DollarSign,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
      positive: true,
    },
    {
      title: "Rating Platform",
      value: "4.8",
      change: "+0.2 bulan ini",
      icon: Star,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      positive: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Animated Header */}
        <div 
          className={`transform transition-all duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Dashboard Bakusam Express
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-yellow-500 animate-pulse" />
                    Platform logistik terintegrasi dengan AI
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">SISTEM AKTIF</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Update: {formatDateTime(new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 ${
                mounted && cardIndex > index ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-50`}></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-800 mb-2 group-hover:scale-110 transition-transform duration-300">
                        {card.value}
                      </p>
                      <div className="flex items-center text-sm">
                        <TrendingUp className={`w-3 h-3 mr-1 ${card.positive ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`${card.positive ? 'text-green-600' : 'text-red-600'} font-medium`}>
                          {card.change}
                        </span>
                      </div>
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                      <card.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div 
          className={`transform transition-all duration-1000 delay-600 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <Target className="h-6 w-6 mr-2 text-blue-600" />
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                      mounted && cardIndex > index + 4 ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                    }`}
                    style={{ transitionDelay: `${(index + 6) * 100}ms` }}
                    onClick={action.action}
                  >
                    <div className={`${action.bgColor} rounded-xl p-6 transition-all duration-300 border border-transparent hover:border-white hover:shadow-lg`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className={`font-semibold text-sm ${action.textColor} mb-1`}>
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transform transition-all duration-1000 delay-800 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Grafik Pendapatan
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Trend pendapatan 7 hari terakhir</p>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                Live Data
              </Badge>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Grafik Order
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Distribusi status order</p>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                Real-time
              </Badge>
            </CardHeader>
            <CardContent>
              <OrdersChart />
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div 
          className={`transform transition-all duration-1000 delay-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <Award className="h-6 w-6 mr-2 text-yellow-600" />
                Ikhtisar Performa Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:scale-105 transition-transform duration-300">
                  <Gauge className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-800">98.5%</div>
                  <div className="text-sm text-blue-600">Uptime Platform</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:scale-105 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-800">94.2%</div>
                  <div className="text-sm text-green-600">Tingkat Kepuasan</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:scale-105 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-800">2.5 min</div>
                  <div className="text-sm text-purple-600">Rata-rata Response</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Reports Section - Integrated into Dashboard */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="h-7 w-7 mr-3 text-blue-600" />
                Analytics & Reports
              </h2>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom Range
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Analytics */}
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-xl font-bold text-green-800">{formatCurrency(stats?.revenue?.today || 0)}</div>
                        <div className="text-sm text-green-600">Hari Ini</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-xl font-bold text-blue-800">{formatCurrency(stats?.revenue?.thisMonth || 0)}</div>
                        <div className="text-sm text-blue-600">Bulan Ini</div>
                      </div>
                    </div>
                    <RevenueChart />
                  </div>
                </CardContent>
              </Card>

              {/* Orders Analytics */}
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Orders Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-xl font-bold text-purple-800">{stats?.orders?.completed || 0}</div>
                        <div className="text-sm text-purple-600">Selesai</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-xl font-bold text-orange-800">{stats?.orders?.pending || 0}</div>
                        <div className="text-sm text-orange-600">Pending</div>
                      </div>
                    </div>
                    <OrdersChart />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Reports */}
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                  <FileText className="h-5 w-5 mr-2 text-gray-600" />
                  Quick Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Driver Performance</span>
                    <span className="text-xs text-gray-500">Weekly summary</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <span className="font-medium">Revenue Report</span>
                    <span className="text-xs text-gray-500">Monthly breakdown</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50">
                    <Target className="h-6 w-6 text-purple-600" />
                    <span className="font-medium">Customer Insights</span>
                    <span className="text-xs text-gray-500">Behavior analysis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Driver Modal */}
      <DriverModal 
        isOpen={isDriverModalOpen} 
        onClose={() => setIsDriverModalOpen(false)} 
      />
    </div>
  );
}