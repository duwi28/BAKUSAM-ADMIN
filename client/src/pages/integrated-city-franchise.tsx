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
  DollarSign,
  Handshake,
  Award,
  Target,
  CheckCircle,
  Clock,
  Star
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
  franchisePartners: number;
  franchiseRevenue: number;
}

interface FranchisePartner {
  id: number;
  partnerName: string;
  cityId: number;
  cityName: string;
  tier: 'Premium' | 'Standard' | 'Basic';
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  totalInvestment: number;
  monthlyFee: number;
  revenueShare: number;
  performance: number;
  driversManaged: number;
  ordersHandled: number;
  contactPerson: string;
  contactPhone: string;
  territory: string;
  rating: number;
}

export default function IntegratedCityFranchise() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cities } = useQuery({
    queryKey: ['/api/cities'],
  });

  const { data: franchisePartners } = useQuery({
    queryKey: ['/api/franchise/partners'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
      suspended: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Premium': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'Standard': return <Award className="h-4 w-4 text-blue-600" />;
      case 'Basic': return <Target className="h-4 w-4 text-green-600" />;
      default: return <Building2 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="h-8 w-8 mr-3 text-blue-600" />
            Multi-City & Franchise Management
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola operasi multi-kota dan sistem franchise dalam satu dashboard terpadu
          </p>
        </div>
        <div className="flex space-x-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kota Baru
          </Button>
          <Button variant="outline">
            <Handshake className="h-4 w-4 mr-2" />
            Rekrut Partner Franchise
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Kota</p>
                <p className="text-3xl font-bold text-blue-900">{cities?.length || 0}</p>
                <p className="text-sm text-blue-700 mt-1">+2 bulan ini</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Partner Franchise</p>
                <p className="text-3xl font-bold text-green-900">{franchisePartners?.length || 0}</p>
                <p className="text-sm text-green-700 mt-1">+5 partner baru</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Handshake className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-yellow-900">Rp 2.8M</p>
                <p className="text-sm text-yellow-700 mt-1">+15% vs bulan lalu</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Coverage Area</p>
                <p className="text-3xl font-bold text-purple-900">85%</p>
                <p className="text-sm text-purple-700 mt-1">Indonesia</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cities">Cities Management</TabsTrigger>
          <TabsTrigger value="franchise">Franchise Partners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Performance */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Top Performing Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cities?.slice(0, 5).map((city: any, index: number) => (
                    <div key={city.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{city.name}</p>
                          <p className="text-sm text-gray-600">{city.province}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">Rp 485K</p>
                        <p className="text-sm text-gray-600">{city.totalDrivers} drivers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Franchise Performance */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Crown className="h-5 w-5 mr-2 text-yellow-600" />
                  Top Franchise Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {franchisePartners?.slice(0, 5).map((partner: any, index: number) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getTierIcon(partner.tier)}
                          <div>
                            <p className="font-semibold text-gray-900">{partner.partnerName}</p>
                            <p className="text-sm text-gray-600">{partner.cityName} • {partner.tier}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-gray-900">{partner.rating}</span>
                        </div>
                        <p className="text-sm text-gray-600">{partner.driversManaged} drivers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Add New City</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Handshake className="h-6 w-6 text-green-600" />
                  <span className="text-sm">Recruit Partner</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">View Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Settings className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cities Management Tab */}
        <TabsContent value="cities" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg font-bold">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                Cities Management
              </CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kota
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {cities?.map((city: any) => (
                  <div key={city.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{city.name}</h3>
                          <p className="text-gray-600">{city.province}, Indonesia</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={getStatusBadge(city.status)}>
                              {city.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{city.totalDrivers} drivers</span>
                            <span className="text-sm text-gray-600">{city.franchisePartners || 0} partners</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">Rp 485K</p>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Franchise Partners Tab */}
        <TabsContent value="franchise" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg font-bold">
                <Handshake className="h-5 w-5 mr-2 text-green-600" />
                Franchise Partners
              </CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Partner
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {franchisePartners?.map((partner: any) => (
                  <div key={partner.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                          {getTierIcon(partner.tier)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg text-gray-900">{partner.partnerName}</h3>
                            <Badge className={
                              partner.tier === 'Premium' ? 'bg-yellow-100 text-yellow-800' :
                              partner.tier === 'Standard' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {partner.tier}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{partner.cityName} • {partner.territory}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={getStatusBadge(partner.status)}>
                              {partner.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{partner.driversManaged} drivers</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">{partner.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(partner.totalInvestment)}</p>
                        <p className="text-sm text-gray-600">Total Investment</p>
                        <p className="text-sm text-gray-600 mt-1">{partner.revenueShare}% revenue share</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Revenue by City
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cities?.map((city: any, index: number) => (
                    <div key={city.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">{city.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">Rp 485K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Crown className="h-5 w-5 mr-2 text-yellow-600" />
                  Franchise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-800">5</div>
                      <div className="text-sm text-yellow-600">Premium</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-800">8</div>
                      <div className="text-sm text-blue-600">Standard</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-800">12</div>
                      <div className="text-sm text-green-600">Basic</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Average Performance</span>
                      <span className="text-sm font-bold">87.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Key Performance Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-800">95.2%</div>
                  <div className="text-sm text-blue-600">Partner Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-800">23%</div>
                  <div className="text-sm text-green-600">Growth Rate</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-800">4.2 days</div>
                  <div className="text-sm text-yellow-600">Avg. Setup Time</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-800">Rp 2.8M</div>
                  <div className="text-sm text-purple-600">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}