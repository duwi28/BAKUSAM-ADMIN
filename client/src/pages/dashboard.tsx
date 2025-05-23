import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import RevenueChart from "@/components/charts/revenue-chart";
import OrdersChart from "@/components/charts/orders-chart";
import DriverModal from "@/components/modals/driver-modal";
import { useState } from "react";
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
  Activity
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

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  const recentOrders = orders?.slice(0, 5) || [];

  const quickActions = [
    {
      title: "Tambah Driver",
      description: "Daftarkan driver baru",
      icon: UserPlus,
      color: "bg-blue-50 hover:bg-blue-100 text-blue-700",
      iconBg: "bg-primary",
      action: () => setIsDriverModalOpen(true),
    },
    {
      title: "Buat Promo",
      description: "Tambah voucher diskon",
      icon: Percent,
      color: "bg-orange-50 hover:bg-orange-100 text-orange-700",
      iconBg: "bg-accent",
      action: () => alert("Fitur Buat Promo akan segera hadir!"),
    },
    {
      title: "Kirim Notifikasi",
      description: "Broadcast ke semua user",
      icon: Megaphone,
      color: "bg-green-50 hover:bg-green-100 text-green-700",
      iconBg: "bg-success",
      action: () => alert("Fitur Kirim Notifikasi akan segera hadir!"),
    },
    {
      title: "Laporan Detail",
      description: "Analytics mendalam",
      icon: BarChart3,
      color: "bg-purple-50 hover:bg-purple-100 text-purple-700",
      iconBg: "bg-purple-600",
      action: () => alert("Mengarahkan ke halaman laporan detail..."),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Order Hari Ini</p>
                <p className="text-3xl font-bold text-foreground">{stats?.orders.total || 0}</p>
                <p className="text-sm text-success flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% dari kemarin
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="text-primary text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Driver Aktif</p>
                <p className="text-3xl font-bold text-foreground">{stats?.drivers.active || 0}</p>
                <p className="text-sm text-success flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3 driver baru
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="text-success text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(stats?.revenue.today || 0)}
                </p>
                <p className="text-sm text-success flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% dari kemarin
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <DollarSign className="text-warning text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating Rata-rata</p>
                <p className="text-3xl font-bold text-foreground">4.8</p>
                <p className="text-sm text-muted-foreground">dari 5.0 bintang</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Star className="text-accent text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pendapatan Mingguan</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" variant="default">7 Hari</Button>
                <Button size="sm" variant="outline">30 Hari</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status Order</CardTitle>
              <Button size="sm" variant="ghost">Lihat Detail</Button>
            </div>
          </CardHeader>
          <CardContent>
            <OrdersChart data={stats?.orders} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Terbaru</CardTitle>
              <Button size="sm" variant="ghost">Lihat Semua</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada order terbaru</p>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">#BKS-{order.id.toString().padStart(3, "0")}</p>
                        <span className={`status-badge ${order.status === "completed" ? "status-completed" : "status-pending"}`}>
                          {order.status === "completed" ? "Selesai" : "Dalam Perjalanan"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.fullName || "Customer"} • {order.driver?.fullName || "Driver"}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(order.totalFare)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full flex items-center space-x-3 p-4 h-auto ${action.color} justify-start`}
                    onClick={action.action}
                  >
                    <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm opacity-70">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* System Status */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Status Sistem</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Server Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm font-medium text-success">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium text-foreground">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Update Terakhir</span>
                  <span className="text-sm text-muted-foreground">2 menit lalu</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DriverModal isOpen={isDriverModalOpen} onClose={() => setIsDriverModalOpen(false)} />
    </div>
  );
}
