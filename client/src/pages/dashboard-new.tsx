import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package, Users, DollarSign, Star, TrendingUp, TrendingDown,
  UserPlus, Plus, ClipboardList, Navigation, MapPin, Wallet, Search,
  Calculator, Settings, Brain, Zap, Route, Target, Activity,
  MessageSquare, CreditCard, Shield, Send, Globe, Handshake,
  BarChart3, FileText, Download, Calendar, Truck, CheckCircle,
  Clock, Gauge, PieChart, Award
} from "lucide-react";

import RevenueChart from "@/components/charts/revenue-chart";
import OrdersChart from "@/components/charts/orders-chart";
import DriverModal from "@/components/modals/driver-modal";

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Ensure stats has default structure
  const safeStats = stats || {
    orders: { total: 0, pending: 0, completed: 0, cancelled: 0 },
    drivers: { total: 0, active: 0, suspended: 0, pending: 0 },
    revenue: { today: 0, thisWeek: 0, thisMonth: 0 }
  };

  const stats_data = [
    {
      title: "Total Order",
      value: safeStats.orders.total || 0,
      change: "+12% dari kemarin",
      icon: Package,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      positive: true,
    },
    {
      title: "Driver Aktif",
      value: safeStats.drivers.active || 0,
      change: "+3 driver baru",
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      positive: true,
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatCurrency(safeStats.revenue.today || 0),
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

      <div className="relative space-y-6 p-6">
        {/* Header Section */}
        <div className={`transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bakusam Express Dashboard
                  </h1>
                  <p className="text-gray-600">Platform Logistik Terpadu Multi-Kota</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                Live System
              </Badge>
            </div>
          </div>
        </div>

        {/* Baris 1: Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats_data.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group">
              <div className={`absolute inset-0 bg-gradient-to-br ${safeStats.bgGradient} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{safeStats.title}</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${safeStats.gradient} bg-clip-text text-transparent`}>
                      {safeStats.value}
                    </p>
                    <p className={`text-sm ${safeStats.positive ? 'text-green-600' : 'text-red-600'} flex items-center mt-2`}>
                      {safeStats.positive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {safeStats.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${safeStats.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <safeStats.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Baris 2: Core Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                Driver Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={() => setIsDriverModalOpen(true)} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Driver Baru
                </Button>
                <div className="text-sm text-gray-600">
                  Total: {safeStats.drivers.total || 0} | Aktif: {safeStats.drivers.active || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Manual Order Entry
                </Button>
                <div className="text-sm text-gray-600">
                  Pending: {safeStats.orders.pending || 0} | Completed: {safeStats.orders.completed || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Navigation className="h-5 w-5 mr-2 text-green-600" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Live Map
                </Button>
                <div className="text-sm text-gray-600">
                  {safeStats.drivers.active || 0} drivers online
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baris 3: Financial Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Wallet className="h-5 w-5 mr-2 text-green-600" />
                Driver Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-xl font-bold text-green-800">Rp 45.2M</div>
                  <div className="text-sm text-green-600">Total Balance</div>
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search Driver Balance
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                Revenue Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-xl font-bold text-blue-800">{formatCurrency(safeStats.revenue.thisMonth || 0)}</div>
                  <div className="text-sm text-blue-600">Revenue Bulan Ini</div>
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Projections
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                Pricing Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-xl font-bold text-purple-800">Rp 8,500</div>
                  <div className="text-sm text-purple-600">Avg. Trip Value</div>
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Adjust Pricing Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baris 4: AI & Smart Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI & Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <span className="text-xs">Auto Assignment</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Route className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Smart Routes</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-xs">AI Recommendations</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="text-xs">Demand Prediction</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
                Driver Community & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Community Chat</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="text-xs">Credit Scoring</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="text-xs">Safety Alerts</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Send className="h-5 w-5 text-purple-600" />
                  <span className="text-xs">Push Notifications</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baris 5: Multi-City & Franchise */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Globe className="h-5 w-5 mr-2 text-indigo-600" />
                Multi-City Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                  <div className="text-lg font-bold text-indigo-800">5</div>
                  <div className="text-xs text-indigo-600">Cities</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-lg font-bold text-blue-800">12</div>
                  <div className="text-xs text-blue-600">Regions</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-lg font-bold text-purple-800">8</div>
                  <div className="text-xs text-purple-600">Admins</div>
                </div>
              </div>
              <Button className="w-full" variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Manage Cities
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Handshake className="h-5 w-5 mr-2 text-orange-600" />
                Franchise Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-lg font-bold text-orange-800">15</div>
                  <div className="text-xs text-orange-600">Partners</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                  <div className="text-lg font-bold text-yellow-800">3</div>
                  <div className="text-xs text-yellow-600">Tiers</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-lg font-bold text-green-800">92%</div>
                  <div className="text-xs text-green-600">Satisfaction</div>
                </div>
              </div>
              <Button className="w-full" variant="outline" size="sm">
                <Handshake className="h-4 w-4 mr-2" />
                Manage Franchise
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Baris 6: Analytics & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
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

        {/* Baris 7: Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-bold text-gray-800">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50">
                <Package className="h-6 w-6 text-blue-600" />
                <span className="text-xs">New Order</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50">
                <UserPlus className="h-6 w-6 text-green-600" />
                <span className="text-xs">Add Driver</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <span className="text-xs">View Reports</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-orange-50">
                <Settings className="h-6 w-6 text-orange-600" />
                <span className="text-xs">Settings</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-indigo-50">
                <MapPin className="h-6 w-6 text-indigo-600" />
                <span className="text-xs">Live Map</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-red-50">
                <Shield className="h-6 w-6 text-red-600" />
                <span className="text-xs">Safety</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Baris 8: Performance Overview */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-bold text-gray-800">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:scale-105 transition-transform duration-300">
                <Gauge className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">98.5%</div>
                <div className="text-sm text-blue-600">Platform Uptime</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:scale-105 transition-transform duration-300">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">94.2%</div>
                <div className="text-sm text-green-600">Customer Satisfaction</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:scale-105 transition-transform duration-300">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-800">2.5 min</div>
                <div className="text-sm text-purple-600">Avg Response Time</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:scale-105 transition-transform duration-300">
                <PieChart className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-indigo-800">87.3%</div>
                <div className="text-sm text-indigo-600">Operational Efficiency</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Baris 9: Quick Reports */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-bold text-gray-800">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Quick Reports
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom Range
                </Button>
              </div>
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

        {/* Baris 10: Operational Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Bulk Driver Import</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="text-xs">Mass Order Update</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Send className="h-5 w-5 text-purple-600" />
                  <span className="text-xs">Bulk Notifications</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Download className="h-5 w-5 text-orange-600" />
                  <span className="text-xs">Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold text-gray-800">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Safety & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="text-xs">Safety Alerts</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Emergency Tracking</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="text-xs">Incident Reports</span>
                </Button>
                <Button className="h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-xs">Driver Verification</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baris 11: System Status & Notifications */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-bold text-gray-800">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              System Status & Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">System Health</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GPS Service</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Recent Activity</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 5 orders completed in last hour</div>
                  <div>• 2 new drivers registered</div>
                  <div>• System backup completed</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Alerts</h4>
                <div className="space-y-2">
                  <Badge className="bg-yellow-100 text-yellow-800 w-full justify-center">
                    3 pending approvals
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 w-full justify-center">
                    System update available
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Modal */}
      <DriverModal 
        isOpen={isDriverModalOpen} 
        onClose={() => setIsDriverModalOpen(false)} 
      />
    </div>
  );
}