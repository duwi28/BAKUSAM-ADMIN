import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Route,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
  MapPin,
  Target,
  TrendingUp,
  Users,
  Package,
  Clock,
  Zap,
  Globe,
  Percent,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Star,
  Calendar,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SystemManagement() {
  const [selectedTab, setSelectedTab] = useState("routes");
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data for different sections
  const { data: routes } = useQuery({
    queryKey: ['/api/route-optimization'],
  });

  const { data: pricingRules } = useQuery({
    queryKey: ['/api/pricing-rules'],
  });

  const { data: promotions } = useQuery({
    queryKey: ['/api/promotions'],
  });

  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const { data: systemSettings } = useQuery({
    queryKey: ['/api/system-settings'],
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2 text-indigo-600" />
            System Management
          </h1>
          <p className="text-gray-600 text-sm">
            Kelola rute, tarif, laporan, notifikasi, dan pengaturan sistem
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Active Routes</p>
                <p className="text-xl font-bold text-blue-900">{routes?.length || 0}</p>
              </div>
              <Route className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Pricing Rules</p>
                <p className="text-xl font-bold text-green-900">{pricingRules?.length || 0}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Promotions</p>
                <p className="text-xl font-bold text-purple-900">{promotions?.length || 0}</p>
              </div>
              <Percent className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-600">Notifications</p>
                <p className="text-xl font-bold text-orange-900">{notifications?.length || 0}</p>
              </div>
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600">System Health</p>
                <p className="text-xl font-bold text-red-900">98%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="routes">Smart Routes</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Promos</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Smart Route Optimization Tab */}
        <TabsContent value="routes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Route className="h-5 w-5 mr-2 text-blue-600" />
                  Route Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routes?.slice(0, 5).map((route: any) => (
                    <div key={route.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{route.driverName}</p>
                        <p className="text-xs text-gray-600">{route.totalDistance} km • {route.estimatedTime} min</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {route.optimizationLevel}% optimized
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">{route.totalOrders} orders</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Route className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Belum ada data optimasi rute</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Route Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Optimization</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Time Saved</span>
                    <span className="font-semibold text-blue-600">2.4 hours/day</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fuel Efficiency</span>
                    <span className="font-semibold text-purple-600">+15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing & Promotions Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Pricing Rules
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingRules?.map((rule: any) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm capitalize">{rule.vehicleType}</p>
                        <p className="text-xs text-gray-600">
                          Base: {formatCurrency(rule.baseFare)} • Per KM: {formatCurrency(rule.perKmRate)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Belum ada aturan pricing</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Percent className="h-5 w-5 mr-2 text-purple-600" />
                  Active Promotions
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promotions?.length > 0 ? promotions.map((promo: any) => (
                    <div key={promo.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{promo.name}</p>
                        <p className="text-xs text-purple-600">
                          {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : formatCurrency(promo.discountValue)}
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        {promo.usageCount || 0} used
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Percent className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Belum ada promosi aktif</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Promosi Pertama
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports & Analytics Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Package className="h-4 w-4 mr-3" />
                    Daily Orders Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Users className="h-4 w-4 mr-3" />
                    Driver Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <DollarSign className="h-4 w-4 mr-3" />
                    Revenue Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Route className="h-4 w-4 mr-3" />
                    Route Efficiency
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Orders Today</span>
                    <span className="font-semibold text-blue-600">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue Today</span>
                    <span className="font-semibold text-green-600">{formatCurrency(1250000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Drivers</span>
                    <span className="font-semibold text-purple-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Delivery Time</span>
                    <span className="font-semibold text-orange-600">32 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Report Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Report</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Summary</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Analytics</span>
                    <Switch />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Bell className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Notifications
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications?.slice(0, 5).map((notif: any) => (
                    <div key={notif.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Bell className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.targetType} • {new Date(notif.createdDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <Badge className={`text-xs ${notif.isRead ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-800'}`}>
                        {notif.isRead ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Belum ada notifikasi</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Order Notifications</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Driver Updates</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Alerts</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Notifications</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input defaultValue="Bakusam Express" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Timezone</label>
                    <Select defaultValue="asia/jakarta">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia/jakarta">Asia/Jakarta (WIB)</SelectItem>
                        <SelectItem value="asia/makassar">Asia/Makassar (WITA)</SelectItem>
                        <SelectItem value="asia/jayapura">Asia/Jayapura (WIT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Currency</label>
                    <Select defaultValue="idr">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idr">Indonesian Rupiah (IDR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  Operational Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Assignment</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Tracking</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Route Optimization</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bulk Operations</span>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Bulk Orders</label>
                    <Input type="number" defaultValue="10" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}