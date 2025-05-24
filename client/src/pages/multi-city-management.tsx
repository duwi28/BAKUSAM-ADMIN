import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Building2,
  Users,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
  Globe,
  Crown,
  Truck,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface City {
  id: number;
  name: string;
  province: string;
  country: string;
  status: 'active' | 'pending' | 'inactive';
  adminName: string;
  adminPhone: string;
  totalDrivers: number;
  activeDrivers: number;
  totalOrders: number;
  monthlyRevenue: number;
  operationalSince: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  priceMultiplier: number;
  marketPotential: 'high' | 'medium' | 'low';
}

interface RegionalAdmin {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  cityId: number;
  cityName: string;
  status: 'active' | 'inactive';
  permissions: string[];
  performanceScore: number;
  totalManaged: {
    drivers: number;
    orders: number;
    revenue: number;
  };
}

export default function MultiCityManagement() {
  const [activeTab, setActiveTab] = useState('cities');
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cities data
  const { data: cities = [], isLoading: loadingCities } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  // Fetch regional admins
  const { data: regionalAdmins = [], isLoading: loadingAdmins } = useQuery<RegionalAdmin[]>({
    queryKey: ["/api/regional-admins"],
  });

  // Add new city mutation
  const addCityMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "🏙️ Kota Baru Ditambahkan",
        description: "Ekspansi ke kota baru berhasil! Regional admin dapat mulai operasi.",
      });
    },
  });

  // Assign regional admin mutation
  const assignAdminMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/regional-admins/assign", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regional-admins"] });
      toast({
        title: "👑 Regional Admin Ditugaskan",
        description: "Admin regional berhasil ditugaskan untuk mengelola operasi kota.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarketPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredCities = cities.filter(city => 
    filterStatus === 'all' || city.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🌍 Multi-City Management</h1>
          <p className="text-muted-foreground">
            Kelola ekspansi Bakusam Express ke berbagai kota dengan regional admin
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Globe className="h-3 w-3 mr-1" />
            {cities.length} Cities
          </Badge>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kota
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cities</p>
                <div className="text-2xl font-bold">{cities.length}</div>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +2 kota baru bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regional Admins</p>
                <div className="text-2xl font-bold">{regionalAdmins.length}</div>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {regionalAdmins.filter(a => a.status === 'active').length} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
                <div className="text-2xl font-bold">
                  {cities.reduce((sum, city) => sum + city.totalDrivers, 0)}
                </div>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all cities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Revenue</p>
                <div className="text-2xl font-bold">
                  {formatCurrency(cities.reduce((sum, city) => sum + city.monthlyRevenue, 0))}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Monthly across network
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="cities">🏙️ Cities</TabsTrigger>
            <TabsTrigger value="admins">👑 Regional Admins</TabsTrigger>
            <TabsTrigger value="analytics">📊 Network Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🏙️ City Operations ({filteredCities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCities ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>Loading cities data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCities.map((city) => (
                    <Card key={city.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{city.name}</h3>
                              <p className="text-sm text-muted-foreground">{city.province}, {city.country}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(city.status)}>
                                {city.status.toUpperCase()}
                              </Badge>
                              <Badge className={`${getMarketPotentialColor(city.marketPotential)} mt-1`}>
                                {city.marketPotential.toUpperCase()} POTENTIAL
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Drivers: {city.totalDrivers}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Orders: {city.totalOrders}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">Revenue: {formatCurrency(city.monthlyRevenue)}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Admin:</span>
                                <span className="ml-1 font-medium">{city.adminName}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Since:</span>
                                <span className="ml-1">{city.operationalSince}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Price Multiplier:</span>
                                <span className="ml-1 font-medium">{city.priceMultiplier}x</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Settings className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Admins Tab */}
        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>👑 Regional Administrators ({regionalAdmins.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAdmins ? (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 animate-pulse text-purple-600 mx-auto mb-4" />
                  <p>Loading regional admins...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {regionalAdmins.map((admin) => (
                    <Card key={admin.id}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{admin.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{admin.phone}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                            <Badge className={getStatusColor(admin.status)}>
                              {admin.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Managing:</span>
                              <span className="ml-1 font-medium">{admin.cityName}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Performance:</span>
                              <span className="ml-1 font-medium text-green-600">{admin.performanceScore}%</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Drivers:</span>
                              <span className="ml-1 font-medium">{admin.totalManaged.drivers}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Orders:</span>
                              <span className="ml-1 font-medium">{admin.totalManaged.orders}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Revenue:</span>
                              <span className="ml-1 font-medium">{formatCurrency(admin.totalManaged.revenue)}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button size="sm" variant="outline" className="w-full">
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Permissions
                            </Button>
                            <Button size="sm" variant="outline" className="w-full">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Performance Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📈 Network Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cities Operational</span>
                    <span className="font-bold">{cities.filter(c => c.status === 'active').length}/{cities.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Network Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(cities.reduce((sum, city) => sum + city.monthlyRevenue, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Revenue per City</span>
                    <span className="font-bold">
                      {formatCurrency(cities.reduce((sum, city) => sum + city.monthlyRevenue, 0) / cities.length || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Network Driver Count</span>
                    <span className="font-bold">{cities.reduce((sum, city) => sum + city.totalDrivers, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Top Performing Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cities
                    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                    .slice(0, 5)
                    .map((city, index) => (
                      <div key={city.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{city.name}</span>
                        </div>
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(city.monthlyRevenue)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}