import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Route,
  Navigation,
  Clock,
  Fuel,
  MapPin,
  TrendingDown,
  Zap,
  Target,
  Activity,
  Truck,
  BarChart3,
  RefreshCw,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RoutePoint {
  id: number;
  type: 'start' | 'pickup' | 'delivery' | 'end';
  orderId?: number;
  lat: number;
  lng: number;
  address: string;
  estimatedTime: string;
  status: 'pending' | 'current' | 'completed';
  priority: 'normal' | 'urgent';
}

interface RealtimeRoute {
  id: number;
  driverId: number;
  driverName: string;
  vehicleType: string;
  vehiclePlate: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  routePoints: RoutePoint[];
  optimization: {
    totalDistance: number;
    totalTime: number;
    fuelConsumption: number;
    estimatedCost: number;
    co2Emission: number;
    efficiency: number;
  };
  trafficConditions: {
    severity: 'light' | 'moderate' | 'heavy';
    affectedSegments: number;
    delayMinutes: number;
  };
  alternatives: Array<{
    id: number;
    name: string;
    distanceDiff: number;
    timeDiff: number;
    fuelDiff: number;
    score: number;
  }>;
  isActive: boolean;
  lastUpdated: string;
}

export default function RealtimeRouteOptimization() {
  const [selectedDriver, setSelectedDriver] = useState<number | 'all'>('all');
  const [mapView, setMapView] = useState<'satellite' | 'roadmap' | 'hybrid'>('roadmap');
  const [showTraffic, setShowTraffic] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [simulationMode, setSimulationMode] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real-time routes data
  const { data: routes = [], isLoading } = useQuery<RealtimeRoute[]>({
    queryKey: ["/api/realtime-routes", selectedDriver, showTraffic],
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Fetch drivers list
  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
  });

  // Optimize route mutation
  const optimizeRouteMutation = useMutation({
    mutationFn: (data: { driverId: number; options: any }) =>
      apiRequest("POST", "/api/optimize-realtime-route", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/realtime-routes"] });
      toast({
        title: "🚀 Rute Dioptimalkan",
        description: "Rute real-time telah diperbarui dengan kondisi terbaru",
      });
    },
  });

  // Apply alternative route mutation
  const applyAlternativeMutation = useMutation({
    mutationFn: (data: { driverId: number; alternativeId: number }) =>
      apiRequest("POST", "/api/apply-alternative-route", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/realtime-routes"] });
      toast({
        title: "🛣️ Rute Alternatif Diterapkan",
        description: "Driver akan menerima notifikasi rute baru",
      });
    },
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -6.2088, lng: 106.8456 }, // Jakarta center
      zoom: 12,
      mapTypeId: mapView,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    if (showTraffic) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }

    // Add route visualization
    routes.forEach((route, index) => {
      // Driver marker
      new window.google.maps.Marker({
        position: route.currentLocation,
        map: map,
        title: route.driverName,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${route.isActive ? '#10B981' : '#6B7280'}" stroke="#fff" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Route points markers
      route.routePoints.forEach((point, pointIndex) => {
        const markerColor = point.status === 'completed' ? '#10B981' : 
                           point.status === 'current' ? '#F59E0B' : '#6B7280';
        const markerIcon = point.type === 'pickup' ? '📦' : 
                          point.type === 'delivery' ? '🎯' : '📍';

        new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: map,
          title: `${point.address} - ${point.estimatedTime}`,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${markerColor}" stroke="#fff" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="8">${pointIndex + 1}</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(24, 24)
          }
        });
      });

      // Route path
      const routePath = new window.google.maps.Polyline({
        path: [
          route.currentLocation,
          ...route.routePoints.map(p => ({ lat: p.lat, lng: p.lng }))
        ],
        geodesic: true,
        strokeColor: route.isActive ? '#3B82F6' : '#9CA3AF',
        strokeOpacity: 1.0,
        strokeWeight: route.isActive ? 4 : 2
      });

      routePath.setMap(map);
    });

  }, [routes, mapView, showTraffic]);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motor': return '🏍️';
      case 'mobil': return '🚗';
      case 'pickup': return '🚛';
      default: return '🚚';
    }
  };

  const getTrafficSeverityColor = (severity: string) => {
    switch (severity) {
      case 'light': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'heavy': return 'bg-red-100 text-red-800';
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

  const activeRoutes = routes.filter(r => r.isActive);
  const totalOptimization = routes.reduce((acc, route) => ({
    distance: acc.distance + route.optimization.totalDistance,
    time: acc.time + route.optimization.totalTime,
    fuel: acc.fuel + route.optimization.fuelConsumption,
    cost: acc.cost + route.optimization.estimatedCost
  }), { distance: 0, time: 0, fuel: 0, cost: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🗺️ Real-Time Route Optimization</h1>
          <p className="text-muted-foreground">
            Peta interaktif dengan optimisasi rute real-time berdasarkan kondisi lalu lintas terkini
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {autoRefresh ? '🟢 Auto Refresh' : '⭕ Manual'}
          </Badge>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {autoRefresh ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver</label>
              <Select value={selectedDriver.toString()} onValueChange={(value) => setSelectedDriver(value === 'all' ? 'all' : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Driver</SelectItem>
                  {drivers.map((driver: any) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tampilan Peta</label>
              <Select value={mapView} onValueChange={(value: any) => setMapView(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roadmap">🗺️ Roadmap</SelectItem>
                  <SelectItem value="satellite">🛰️ Satellite</SelectItem>
                  <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Traffic Layer</label>
              <Button
                onClick={() => setShowTraffic(!showTraffic)}
                variant={showTraffic ? "default" : "outline"}
                className="w-full"
              >
                {showTraffic ? '🟢 Aktif' : '⭕ Nonaktif'}
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Refresh (detik)</label>
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 detik</SelectItem>
                  <SelectItem value="30">30 detik</SelectItem>
                  <SelectItem value="60">1 menit</SelectItem>
                  <SelectItem value="120">2 menit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Simulasi</label>
              <Button
                onClick={() => setSimulationMode(!simulationMode)}
                variant={simulationMode ? "default" : "outline"}
                className="w-full"
              >
                {simulationMode ? '🔄 ON' : '⭕ OFF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Driver Aktif</p>
                <p className="text-2xl font-bold text-blue-600">{activeRoutes.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jarak</p>
                <p className="text-2xl font-bold text-green-600">{totalOptimization.distance.toFixed(1)} km</p>
              </div>
              <Route className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Waktu</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(totalOptimization.time)} min</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimasi Biaya</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalOptimization.cost)}</p>
              </div>
              <Fuel className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🗺️ Peta Interaktif Real-Time
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    <Eye className="h-3 w-3 mr-1" />
                    Live View
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Map Container */}
                <div 
                  ref={mapRef}
                  className="w-full h-[500px] rounded-lg border bg-muted/50 flex items-center justify-center"
                >
                  {!window.google ? (
                    <div className="text-center space-y-3">
                      <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium">Google Maps Integration</h3>
                        <p className="text-muted-foreground">
                          Untuk menampilkan peta interaktif real-time, diperlukan Google Maps API key.
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          API key tersedia di environment variable GOOGLE_MAPS_API_KEY
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Memuat peta interaktif...</p>
                    </div>
                  )}
                </div>

                {/* Map Legend */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Driver Aktif</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs">Sedang Pickup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs">Traffic Heavy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Route Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Efisiensi Rata-rata</span>
                  <span className="font-bold text-green-600">92.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hemat BBM</span>
                  <span className="font-bold text-blue-600">15.2L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hemat Waktu</span>
                  <span className="font-bold text-orange-600">45 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">CO₂ Reduced</span>
                  <span className="font-bold text-green-600">28.3 kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Routes */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Memuat data real-time...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeRoutes.slice(0, 3).map((route) => (
                <Card key={route.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getVehicleIcon(route.vehicleType)}</span>
                        <div>
                          <p className="font-medium text-sm">{route.driverName}</p>
                          <p className="text-xs text-muted-foreground">{route.vehiclePlate}</p>
                        </div>
                      </div>
                      <Badge className={getTrafficSeverityColor(route.trafficConditions.severity)}>
                        {route.trafficConditions.severity === 'light' ? '🟢 Lancar' :
                         route.trafficConditions.severity === 'moderate' ? '🟡 Sedang' : '🔴 Macet'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Jarak:</span>
                          <span className="ml-1 font-medium">{route.optimization.totalDistance}km</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Waktu:</span>
                          <span className="ml-1 font-medium">{route.optimization.totalTime}min</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">BBM:</span>
                          <span className="ml-1 font-medium">{route.optimization.fuelConsumption}L</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Efisiensi:</span>
                          <span className="ml-1 font-medium text-green-600">{route.optimization.efficiency}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium">Rute Alternatif:</p>
                        {route.alternatives.slice(0, 2).map((alt) => (
                          <div key={alt.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                            <span>{alt.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className={alt.timeDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                                {alt.timeDiff > 0 ? '+' : ''}{alt.timeDiff}min
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2"
                                onClick={() => applyAlternativeMutation.mutate({ driverId: route.driverId, alternativeId: alt.id })}
                              >
                                Terapkan
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full h-8"
                        size="sm"
                        onClick={() => optimizeRouteMutation.mutate({ driverId: route.driverId, options: { realtime: true } })}
                        disabled={optimizeRouteMutation.isPending}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Optimasi Ulang
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Traffic Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>🚦 Traffic Alerts Real-Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-red-800">Heavy Traffic</span>
              </div>
              <p className="text-sm text-red-700">Jl. Sudirman - Semanggi</p>
              <p className="text-xs text-red-600">Delay: +25 menit</p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-yellow-800">Moderate Traffic</span>
              </div>
              <p className="text-sm text-yellow-700">Jl. Gatot Subroto - Kuningan</p>
              <p className="text-xs text-yellow-600">Delay: +12 menit</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Clear Roads</span>
              </div>
              <p className="text-sm text-green-700">Jl. Casablanca - TB Simatupang</p>
              <p className="text-xs text-green-600">Normal flow</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}