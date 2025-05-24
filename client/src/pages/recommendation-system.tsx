import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Target,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  Fuel,
  Award,
  Users,
  BarChart3,
  Zap,
  ThumbsUp,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DriverRecommendation {
  driverId: number;
  driverName: string;
  vehicleType: string;
  vehiclePlate: string;
  priority: 'priority' | 'normal';
  performanceScore: number;
  completionRate: number;
  averageRating: number;
  responseTime: number;
  distanceFromPickup: number;
  currentWorkload: number;
  estimatedDeliveryTime: number;
  confidenceLevel: 'Tinggi' | 'Sedang' | 'Rendah';
  reasons: string[];
  strengths: string[];
  potentialConcerns: string[];
  recommendationScore: number;
  availability: 'available' | 'busy' | 'break';
  lastActive: string;
}

interface RouteRecommendation {
  routeId: number;
  routeName: string;
  distance: number;
  estimatedTime: number;
  fuelConsumption: number;
  trafficLevel: 'ringan' | 'sedang' | 'padat';
  tollCost: number;
  roadCondition: 'baik' | 'sedang' | 'buruk';
  recommendationScore: number;
  advantages: string[];
  disadvantages: string[];
  bestTimeToUse: string[];
  weatherSuitability: number;
}

interface CustomerRecommendation {
  customerId: number;
  customerName: string;
  segment: 'VIP' | 'Regular' | 'New';
  orderFrequency: number;
  averageOrderValue: number;
  preferredDeliveryTime: string;
  locationArea: string;
  loyaltyScore: number;
  recommendedActions: string[];
  upsellOpportunities: string[];
  retentionRisk: 'rendah' | 'sedang' | 'tinggi';
  nextOrderPrediction: string;
}

export default function RecommendationSystem() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [filterCriteria, setFilterCriteria] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch driver recommendations
  const { data: driverRecommendations = [], isLoading: loadingDrivers } = useQuery<DriverRecommendation[]>({
    queryKey: ["/api/recommendations/drivers", selectedOrder, filterCriteria],
  });

  // Fetch route recommendations
  const { data: routeRecommendations = [], isLoading: loadingRoutes } = useQuery<RouteRecommendation[]>({
    queryKey: ["/api/recommendations/routes", selectedOrder],
  });

  // Fetch customer recommendations
  const { data: customerRecommendations = [], isLoading: loadingCustomers } = useQuery<CustomerRecommendation[]>({
    queryKey: ["/api/recommendations/customers", filterCriteria],
  });

  // Fetch available orders
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Apply recommendation mutation
  const applyRecommendationMutation = useMutation({
    mutationFn: (data: { type: string; recommendationId: number; orderId?: number }) =>
      apiRequest("POST", "/api/recommendations/apply", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "🎯 Rekomendasi Diterapkan",
        description: "Rekomendasi berhasil diterapkan dan akan meningkatkan efisiensi operasional",
      });
    },
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motor': return '🏍️';
      case 'mobil': return '🚗';
      case 'pickup': return '🚛';
      default: return '🚚';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'Tinggi': return 'bg-green-100 text-green-800';
      case 'Sedang': return 'bg-yellow-100 text-yellow-800';
      case 'Rendah': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'ringan': return 'bg-green-100 text-green-800';
      case 'sedang': return 'bg-yellow-100 text-yellow-800';
      case 'padat': return 'bg-red-100 text-red-800';
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

  const filteredDrivers = driverRecommendations.filter(driver =>
    filterCriteria === 'all' || 
    (filterCriteria === 'available' && driver.availability === 'available') ||
    (filterCriteria === 'high-score' && driver.performanceScore >= 85) ||
    (filterCriteria === 'priority' && driver.priority === 'priority')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🤖 Sistem Rekomendasi AI</h1>
          <p className="text-muted-foreground">
            Rekomendasi cerdas untuk driver, rute, dan customer berdasarkan analisis data mendalam
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order untuk Rekomendasi</label>
              <Select value={selectedOrder?.toString() || 'all'} onValueChange={(value) => setSelectedOrder(value === 'all' ? null : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih order..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Order</SelectItem>
                  {orders.map((order: any) => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      Order #{order.id} - {order.pickupAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter Kriteria</label>
              <Select value={filterCriteria} onValueChange={setFilterCriteria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="available">🟢 Available</SelectItem>
                  <SelectItem value="high-score">⭐ High Performance</SelectItem>
                  <SelectItem value="priority">🚀 Priority Drivers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari driver, rute, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drivers">🚚 Driver Terbaik</TabsTrigger>
          <TabsTrigger value="routes">🗺️ Rute Optimal</TabsTrigger>
          <TabsTrigger value="customers">👥 Customer Insights</TabsTrigger>
        </TabsList>

        {/* Driver Recommendations */}
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Rekomendasi Driver ({filteredDrivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDrivers ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>AI sedang menganalisis driver terbaik...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDrivers.map((driver) => (
                    <Card key={driver.driverId} className="relative">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Driver Info */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getVehicleIcon(driver.vehicleType)}</span>
                              <div>
                                <h3 className="font-semibold">{driver.driverName}</h3>
                                <p className="text-sm text-muted-foreground">{driver.vehiclePlate}</p>
                              </div>
                              <Badge className={driver.priority === 'priority' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                                {driver.priority === 'priority' ? '🚀 Priority' : '📋 Normal'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Performance:</span>
                                <span className={`ml-1 font-bold ${getScoreColor(driver.performanceScore)}`}>
                                  {driver.performanceScore}%
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rating:</span>
                                <span className="ml-1 font-medium text-yellow-600">
                                  ⭐ {driver.averageRating.toFixed(1)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Completion:</span>
                                <span className="ml-1 font-medium text-green-600">{driver.completionRate}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Response:</span>
                                <span className="ml-1 font-medium">{driver.responseTime}min</span>
                              </div>
                            </div>
                          </div>

                          {/* Analysis */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-green-600 mb-2">✅ Kelebihan:</h4>
                              <ul className="text-sm space-y-1">
                                {driver.strengths.map((strength, index) => (
                                  <li key={index} className="text-green-700">• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-blue-600 mb-2">💡 Alasan Direkomendasikan:</h4>
                              <ul className="text-sm space-y-1">
                                {driver.reasons.slice(0, 2).map((reason, index) => (
                                  <li key={index} className="text-blue-700">• {reason}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Recommendation Score & Action */}
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className={`text-3xl font-bold ${getScoreColor(driver.recommendationScore)}`}>
                                {driver.recommendationScore}
                              </div>
                              <p className="text-sm text-muted-foreground">Skor Rekomendasi</p>
                              <Badge className={getConfidenceColor(driver.confidenceLevel)}>
                                {driver.confidenceLevel} Confidence
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <MapPin className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                                <p className="font-medium">{driver.distanceFromPickup.toFixed(1)} km</p>
                                <p className="text-muted-foreground">Jarak</p>
                              </div>
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
                                <p className="font-medium">{driver.estimatedDeliveryTime} min</p>
                                <p className="text-muted-foreground">ETA</p>
                              </div>
                            </div>

                            <Button
                              className="w-full"
                              onClick={() => applyRecommendationMutation.mutate({
                                type: 'driver',
                                recommendationId: driver.driverId,
                                orderId: selectedOrder || undefined
                              })}
                              disabled={applyRecommendationMutation.isPending}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Pilih Driver
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

        {/* Route Recommendations */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Rekomendasi Rute Optimal ({routeRecommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRoutes ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 animate-pulse text-green-600 mx-auto mb-4" />
                  <p>Menganalisis rute terbaik...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routeRecommendations.map((route) => (
                    <Card key={route.routeId}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{route.routeName}</h3>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${getScoreColor(route.recommendationScore)}`}>
                                {route.recommendationScore}
                              </div>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span>{route.distance} km</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span>{route.estimatedTime} min</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Fuel className="h-4 w-4 text-orange-600" />
                              <span>{route.fuelConsumption}L</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>💰</span>
                              <span>{formatCurrency(route.tollCost)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge className={getTrafficColor(route.trafficLevel)}>
                              🚦 {route.trafficLevel.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              🛣️ {route.roadCondition.toUpperCase()}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="font-medium text-green-600 mb-2">✅ Keunggulan:</h4>
                            <ul className="text-sm space-y-1">
                              {route.advantages.slice(0, 2).map((advantage, index) => (
                                <li key={index} className="text-green-700">• {advantage}</li>
                              ))}
                            </ul>
                          </div>

                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => applyRecommendationMutation.mutate({
                              type: 'route',
                              recommendationId: route.routeId,
                              orderId: selectedOrder || undefined
                            })}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Gunakan Rute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Recommendations */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer Insights & Rekomendasi ({customerRecommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCustomers ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 animate-pulse text-purple-600 mx-auto mb-4" />
                  <p>Menganalisis data customer...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerRecommendations.map((customer) => (
                    <Card key={customer.customerId}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{customer.customerName}</h3>
                              <Badge className={
                                customer.segment === 'VIP' ? 'bg-purple-100 text-purple-800' :
                                customer.segment === 'Regular' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {customer.segment === 'VIP' ? '👑 VIP' :
                                 customer.segment === 'Regular' ? '👤 Regular' : '🆕 New'}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <p><span className="text-muted-foreground">Area:</span> {customer.locationArea}</p>
                              <p><span className="text-muted-foreground">Loyalty Score:</span> <span className="font-medium text-purple-600">{customer.loyaltyScore}%</span></p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium">📊 Statistics</h4>
                            <div className="text-sm space-y-1">
                              <p>Order Frequency: <span className="font-medium">{customer.orderFrequency}/bulan</span></p>
                              <p>Avg Order Value: <span className="font-medium">{formatCurrency(customer.averageOrderValue)}</span></p>
                              <p>Preferred Time: <span className="font-medium">{customer.preferredDeliveryTime}</span></p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-blue-600">💡 Recommended Actions</h4>
                            <ul className="text-sm space-y-1">
                              {customer.recommendedActions.slice(0, 2).map((action, index) => (
                                <li key={index} className="text-blue-700">• {action}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <Badge className={
                              customer.retentionRisk === 'rendah' ? 'bg-green-100 text-green-800' :
                              customer.retentionRisk === 'sedang' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              📈 Risk: {customer.retentionRisk.toUpperCase()}
                            </Badge>
                            
                            <div className="text-sm">
                              <p className="text-muted-foreground">Next Order Prediction:</p>
                              <p className="font-medium">{customer.nextOrderPrediction}</p>
                            </div>

                            <Button size="sm" variant="outline" className="w-full">
                              <Award className="h-4 w-4 mr-2" />
                              Apply Strategy
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
      </Tabs>

      {/* AI Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle>🧠 AI Insights Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">🚚 Driver Performance</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Top Performer:</span>
                  <span className="font-medium">Budi Santoso (95%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response Time:</span>
                  <span className="font-medium">8.5 menit</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Drivers:</span>
                  <span className="font-medium text-green-600">12/15</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-green-600">🗺️ Route Efficiency</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Fastest Route:</span>
                  <span className="font-medium">Via Tol Dalam Kota</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Efficient:</span>
                  <span className="font-medium">Via Jl. Panglima Polim</span>
                </div>
                <div className="flex justify-between">
                  <span>Traffic Level:</span>
                  <span className="font-medium text-yellow-600">Moderate</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-purple-600">👥 Customer Insights</h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>VIP Customers:</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between">
                  <span>High Retention Risk:</span>
                  <span className="font-medium text-red-600">5 customers</span>
                </div>
                <div className="flex justify-between">
                  <span>Upsell Potential:</span>
                  <span className="font-medium text-green-600">18 opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}