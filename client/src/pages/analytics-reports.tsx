import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Download,
  Filter,
  DollarSign,
  Users,
  Package,
  Clock,
  Star,
  Target,
  Activity
} from "lucide-react";

interface AnalyticsData {
  daily: Array<{
    date: string;
    orders: number;
    revenue: number;
    drivers: number;
    completion: number;
  }>;
  weekly: Array<{
    week: string;
    orders: number;
    revenue: number;
    avgRating: number;
  }>;
  monthly: Array<{
    month: string;
    orders: number;
    revenue: number;
    growth: number;
  }>;
}

export default function AnalyticsReports() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dateFilter, setDateFilter] = useState('7days');

  // Fetch analytics data
  const { data: analyticsData } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange, dateFilter],
  });

  // Mock data untuk demo
  const mockDailyData = [
    { date: '1 Jan', orders: 45, revenue: 2250000, drivers: 12, completion: 92 },
    { date: '2 Jan', orders: 52, revenue: 2680000, drivers: 15, completion: 89 },
    { date: '3 Jan', orders: 38, revenue: 1920000, drivers: 10, completion: 95 },
    { date: '4 Jan', orders: 61, revenue: 3150000, drivers: 18, completion: 88 },
    { date: '5 Jan', orders: 49, revenue: 2580000, drivers: 14, completion: 91 },
    { date: '6 Jan', orders: 57, revenue: 2890000, drivers: 16, completion: 93 },
    { date: '7 Jan', orders: 43, revenue: 2280000, drivers: 11, completion: 90 }
  ];

  const mockVehicleData = [
    { name: 'Motor', value: 65, color: '#3B82F6' },
    { name: 'Mobil', value: 25, color: '#10B981' },
    { name: 'Pickup', value: 10, color: '#F59E0B' }
  ];

  const mockPerformanceData = [
    { metric: 'Completion Rate', value: 91.2, target: 90, color: '#10B981' },
    { metric: 'Avg Response Time', value: 4.8, target: 5.0, color: '#3B82F6' },
    { metric: 'Customer Rating', value: 4.6, target: 4.5, color: '#F59E0B' },
    { metric: 'On-Time Delivery', value: 88.5, target: 85, color: '#8B5CF6' }
  ];

  const totalOrders = mockDailyData.reduce((sum, day) => sum + day.orders, 0);
  const totalRevenue = mockDailyData.reduce((sum, day) => sum + day.revenue, 0);
  const avgRating = 4.6;
  const completionRate = 91.2;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">📊 Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Analisis performa dan laporan komprehensif Bakusam Express
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Hari</SelectItem>
              <SelectItem value="30days">30 Hari</SelectItem>
              <SelectItem value="90days">90 Hari</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-xs text-green-600 mt-1">↗ +12.5% vs minggu lalu</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-green-600 mt-1">↗ +8.3% vs minggu lalu</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">{avgRating}/5</p>
                <p className="text-xs text-green-600 mt-1">↗ +2.1% vs minggu lalu</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                <p className="text-xs text-green-600 mt-1">↗ +1.8% vs minggu lalu</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'daily', label: 'Harian' },
          { id: 'weekly', label: 'Mingguan' },
          { id: 'monthly', label: 'Bulanan' }
        ].map((range) => (
          <Button
            key={range.id}
            variant={timeRange === range.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange(range.id as any)}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders & Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>📈 Orders & Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'orders' ? value : formatCurrency(Number(value)),
                    name === 'orders' ? 'Orders' : 'Revenue'
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>🚗 Distribusi Kendaraan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockVehicleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockVehicleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {mockVehicleData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>🎯 Performance vs Target</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPerformanceData.map((metric) => (
                <div key={metric.metric} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{metric.metric}</span>
                    <span className="font-medium">
                      {metric.value}{metric.metric.includes('Time') ? 'm' : metric.metric.includes('Rating') ? '/5' : '%'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                          backgroundColor: metric.color
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Target: {metric.target}{metric.metric.includes('Time') ? 'm' : metric.metric.includes('Rating') ? '/5' : '%'}</span>
                      <Badge 
                        className={metric.value >= metric.target ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {metric.value >= metric.target ? '✅ Achieved' : '⚠️ Below Target'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>⏱️ Completion Rate Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[80, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>📋 Laporan Detail 7 Hari Terakhir</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Tanggal</th>
                  <th className="text-right p-3">Orders</th>
                  <th className="text-right p-3">Revenue</th>
                  <th className="text-right p-3">Active Drivers</th>
                  <th className="text-right p-3">Completion %</th>
                  <th className="text-right p-3">Avg Revenue/Order</th>
                </tr>
              </thead>
              <tbody>
                {mockDailyData.map((day) => (
                  <tr key={day.date} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{day.date}</td>
                    <td className="p-3 text-right">{day.orders}</td>
                    <td className="p-3 text-right">{formatCurrency(day.revenue)}</td>
                    <td className="p-3 text-right">{day.drivers}</td>
                    <td className="p-3 text-right">
                      <Badge className={day.completion >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {day.completion}%
                      </Badge>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(day.revenue / day.orders)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="p-3">Total/Rata-rata</td>
                  <td className="p-3 text-right">{totalOrders}</td>
                  <td className="p-3 text-right">{formatCurrency(totalRevenue)}</td>
                  <td className="p-3 text-right">{Math.round(mockDailyData.reduce((sum, d) => sum + d.drivers, 0) / mockDailyData.length)}</td>
                  <td className="p-3 text-right">{completionRate}%</td>
                  <td className="p-3 text-right">{formatCurrency(totalRevenue / totalOrders)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>📤 Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}