import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RevenueChart from "@/components/charts/revenue-chart";
import OrdersChart from "@/components/charts/orders-chart";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  Star,
  Download,
  Calendar,
  BarChart3
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

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

export default function Reports() {
  const [dateRange, setDateRange] = useState("7days");

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: drivers } = useQuery({
    queryKey: ["/api/drivers"],
  });

  // Calculate additional metrics
  const averageOrderValue = stats?.revenue.thisMonth && stats?.orders.completed 
    ? stats.revenue.thisMonth / stats.orders.completed 
    : 0;

  const completionRate = stats?.orders.total 
    ? (stats.orders.completed / stats.orders.total) * 100 
    : 0;

  const driverUtilization = stats?.drivers.total 
    ? (stats.drivers.active / stats.drivers.total) * 100 
    : 0;

  const averageRating = drivers?.length 
    ? drivers.reduce((acc: number, driver: any) => acc + parseFloat(driver.rating || "0"), 0) / drivers.length 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Laporan & Analitik</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Laporan & Analitik</h1>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="90days">90 Hari Terakhir</SelectItem>
              <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Laporan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
          <TabsTrigger value="performance">Performa</TabsTrigger>
          <TabsTrigger value="customers">Customer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(stats?.revenue.thisMonth || 0)}
                    </p>
                    <p className="text-sm text-success flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15% vs bulan lalu
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-success text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rata-rata Order</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(averageOrderValue)}
                    </p>
                    <p className="text-sm text-success flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% vs bulan lalu
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Package className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tingkat Penyelesaian</p>
                    <p className="text-2xl font-bold text-foreground">
                      {completionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-success flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +3% vs bulan lalu
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rating Rata-rata</p>
                    <p className="text-2xl font-bold text-foreground">
                      {averageRating.toFixed(1)}
                    </p>
                    <p className="text-sm text-success flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +0.2 vs bulan lalu
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <Star className="text-warning text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trend Pendapatan</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Order</CardTitle>
              </CardHeader>
              <CardContent>
                <OrdersChart data={stats?.orders} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Hari Ini</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats?.revenue.today || 0)}
                  </p>
                  <p className="text-sm text-success">+12% vs kemarin</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Minggu Ini</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats?.revenue.thisWeek || 0)}
                  </p>
                  <p className="text-sm text-success">+8% vs minggu lalu</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Bulan Ini</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats?.revenue.thisMonth || 0)}
                  </p>
                  <p className="text-sm text-success">+15% vs bulan lalu</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analisis Pendapatan Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Driver Aktif</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.drivers.active || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    dari {stats?.drivers.total || 0} total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Utilisasi Driver</p>
                  <p className="text-2xl font-bold text-foreground">
                    {driverUtilization.toFixed(1)}%
                  </p>
                  <p className="text-sm text-success">+5% vs bulan lalu</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Waktu Respon Rata-rata</p>
                  <p className="text-2xl font-bold text-foreground">4.2 menit</p>
                  <p className="text-sm text-success">-1.2 menit vs bulan lalu</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pembatalan Order</p>
                  <p className="text-2xl font-bold text-foreground">
                    {((stats?.orders.cancelled || 0) / (stats?.orders.total || 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-error">+2% vs bulan lalu</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Customer Baru</p>
                  <p className="text-2xl font-bold text-foreground">124</p>
                  <p className="text-sm text-success">+18% vs bulan lalu</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Customer Aktif</p>
                  <p className="text-2xl font-bold text-foreground">89%</p>
                  <p className="text-sm text-success">+3% vs bulan lalu</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Retensi Customer</p>
                  <p className="text-2xl font-bold text-foreground">73%</p>
                  <p className="text-sm text-success">+5% vs bulan lalu</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
