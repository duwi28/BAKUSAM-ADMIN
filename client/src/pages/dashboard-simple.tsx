import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Zap,
  Target,
  Activity,
  MapPin,
  Plus,
  Eye,
  BarChart3
} from "lucide-react";

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
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Bakusam Express</h1>
          <p className="text-gray-600">Selamat datang! Kelola operasi logistik Anda dengan mudah</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Laporan
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Order Baru
          </Button>
        </div>
      </div>

      {/* Stats Grid - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.orders.total || 0}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats?.orders.pending || 0} pending
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Drivers</p>
                <p className="text-2xl font-bold text-green-900">{stats?.drivers.active || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  dari {stats?.drivers.total || 0} total
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Revenue Hari Ini</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(stats?.revenue.today || 0)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  +{formatCurrency(stats?.revenue.thisWeek || 0)} minggu ini
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Completed</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.orders.completed || 0}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Success rate: {stats?.orders.total ? Math.round((stats.orders.completed / stats.orders.total) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">#{order.id}</p>
                      <p className="text-xs text-gray-600">{order.customerName || 'Customer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={order.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">
                      Rp {parseInt(order.totalFare || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>Belum ada order hari ini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="h-4 w-4 mr-3" />
                Buat Order Manual
              </Button>
              
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Zap className="h-4 w-4 mr-3" />
                Auto Assignment
              </Button>
              
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MapPin className="h-4 w-4 mr-3" />
                Live Tracking
              </Button>
              
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Target className="h-4 w-4 mr-3" />
                Bulk Operations
              </Button>

              <Button variant="outline" className="w-full justify-start" size="sm">
                <Activity className="h-4 w-4 mr-3" />
                Smart AI Operations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">Driver Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Rate</span>
                <span className="font-semibold text-green-600">
                  {stats?.drivers.total ? Math.round((stats.drivers.active / stats.drivers.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.drivers.total ? (stats.drivers.active / stats.drivers.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">Order Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold text-blue-600">
                  {stats?.orders.total ? Math.round((stats.orders.completed / stats.orders.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats?.orders.total ? (stats.orders.completed / stats.orders.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold text-purple-600">
                  {formatCurrency(stats?.revenue.thisMonth || 0)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+12.5% dari bulan lalu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}