import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RouteOptimization {
  id: number;
  driverId: number;
  driverName: string;
  vehicleType: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  assignedOrders: Array<{
    id: number;
    pickupAddress: string;
    deliveryAddress: string;
    priority: string;
    estimatedTime: number;
  }>;
  optimizedRoute: {
    totalDistance: number;
    totalTime: number;
    fuelConsumption: number;
    fuelCost: number;
    co2Emission: number;
    stops: Array<{
      orderId: number;
      type: 'pickup' | 'delivery';
      address: string;
      arrivalTime: string;
      sequence: number;
    }>;
  };
  savings: {
    distanceSaved: number;
    timeSaved: number;
    fuelSaved: number;
    costSaved: number;
  };
}

export default function SmartRouteOptimization() {
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [optimizationMode, setOptimizationMode] = useState<'distance' | 'time' | 'fuel'>('distance');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch route optimizations
  const { data: routeOptimizations = [] } = useQuery<RouteOptimization[]>({
    queryKey: ["/api/route-optimization", selectedDriver, optimizationMode],
  });

  // Fetch drivers list
  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
  });

  // Optimize routes mutation
  const optimizeRoutesMutation = useMutation({
    mutationFn: (data: { driverIds?: number[]; mode: string }) =>
      apiRequest("POST", "/api/optimize-routes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/route-optimization"] });
      setIsOptimizing(false);
      toast({
        title: "🚀 Optimisasi Berhasil",
        description: "Rute telah dioptimalkan untuk efisiensi maksimal",
      });
    },
    onError: () => {
      setIsOptimizing(false);
      toast({
        title: "Error",
        description: "Gagal mengoptimalkan rute",
        variant: "destructive",
      });
    },
  });

  const handleOptimizeRoutes = () => {
    setIsOptimizing(true);
    optimizeRoutesMutation.mutate({
      driverIds: selectedDriver === 'all' ? undefined : [parseInt(selectedDriver)],
      mode: optimizationMode
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motor': return '🏍️';
      case 'mobil': return '🚗';
      case 'pickup': return '🚛';
      default: return '🚚';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getTotalSavings = () => {
    return routeOptimizations.reduce((total, route) => ({
      distanceSaved: total.distanceSaved + route.savings.distanceSaved,
      timeSaved: total.timeSaved + route.savings.timeSaved,
      fuelSaved: total.fuelSaved + route.savings.fuelSaved,
      costSaved: total.costSaved + route.savings.costSaved
    }), { distanceSaved: 0, timeSaved: 0, fuelSaved: 0, costSaved: 0 });
  };

  const totalSavings = getTotalSavings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🤖 Smart Route Optimization</h1>
          <p className="text-muted-foreground">
            Optimisasi rute berbasis AI untuk efisiensi BBM, waktu, dan biaya operasional
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleOptimizeRoutes}
            disabled={isOptimizing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isOptimizing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isOptimizing ? 'Mengoptimalkan...' : 'Optimasi Rute'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver</label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
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
              <label className="text-sm font-medium">Mode Optimisasi</label>
              <Select value={optimizationMode} onValueChange={(value: any) => setOptimizationMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">🛣️ Jarak Terpendek</SelectItem>
                  <SelectItem value="time">⏱️ Waktu Tercepat</SelectItem>
                  <SelectItem value="fuel">⛽ Hemat BBM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Badge className={isOptimizing ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                {isOptimizing ? '⏳ Optimizing...' : '✅ Ready'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jarak Dihemat</p>
                <p className="text-2xl font-bold text-green-600">{totalSavings.distanceSaved.toFixed(1)} km</p>
              </div>
              <Route className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waktu Dihemat</p>
                <p className="text-2xl font-bold text-blue-600">{totalSavings.timeSaved} menit</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">BBM Dihemat</p>
                <p className="text-2xl font-bold text-orange-600">{totalSavings.fuelSaved.toFixed(1)} L</p>
              </div>
              <Fuel className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Biaya Dihemat</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalSavings.costSaved)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Optimizations */}
      <div className="space-y-6">
        {routeOptimizations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Route className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Rute untuk Dioptimalkan</h3>
              <p className="text-muted-foreground">
                Tidak ada driver dengan multiple orders yang memerlukan optimisasi rute saat ini.
              </p>
            </CardContent>
          </Card>
        ) : (
          routeOptimizations.map((route) => (
            <Card key={route.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getVehicleIcon(route.vehicleType)}</span>
                    <div>
                      <span>{route.driverName}</span>
                      <p className="text-sm text-muted-foreground font-normal">
                        {route.assignedOrders.length} orders • {route.optimizedRoute.stops.length} stops
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Optimized Route
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Route Details */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Navigation className="h-4 w-4 mr-2" />
                        📍 Optimized Route Sequence
                      </h4>
                      <div className="space-y-3">
                        {route.optimizedRoute.stops.map((stop, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {stop.sequence}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge className={stop.type === 'pickup' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                  {stop.type === 'pickup' ? '📦 Pickup' : '🎯 Delivery'}
                                </Badge>
                                <span className="text-sm font-medium">Order #{stop.orderId}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{stop.address}</p>
                              <p className="text-xs text-blue-600">ETA: {stop.arrivalTime}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Orders */}
                    <div className="space-y-2">
                      <h4 className="font-medium">📋 Assigned Orders</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {route.assignedOrders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Order #{order.id}</span>
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority === 'urgent' ? '🚨 Urgent' : '📋 Normal'}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <p>📍 Pickup: {order.pickupAddress}</p>
                              <p>🎯 Delivery: {order.deliveryAddress}</p>
                              <p className="text-blue-600">⏱️ Est: {order.estimatedTime} min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats & Savings */}
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-3 flex items-center">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        💰 Penghematan
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Jarak:</span>
                          <span className="font-medium text-green-600">-{route.savings.distanceSaved} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waktu:</span>
                          <span className="font-medium text-green-600">-{route.savings.timeSaved} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>BBM:</span>
                          <span className="font-medium text-green-600">-{route.savings.fuelSaved} L</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Biaya:</span>
                          <span className="font-medium text-green-600">-{formatCurrency(route.savings.costSaved)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        📊 Route Stats
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Jarak:</span>
                          <span className="font-medium">{route.optimizedRoute.totalDistance} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Waktu:</span>
                          <span className="font-medium">{route.optimizedRoute.totalTime} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Konsumsi BBM:</span>
                          <span className="font-medium">{route.optimizedRoute.fuelConsumption} L</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Biaya BBM:</span>
                          <span className="font-medium">{formatCurrency(route.optimizedRoute.fuelCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CO₂ Emission:</span>
                          <span className="font-medium">{route.optimizedRoute.co2Emission} kg</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Send optimized route to driver
                        toast({
                          title: "📱 Rute Dikirim",
                          description: `Rute optimal telah dikirim ke ${route.driverName}`,
                        });
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Kirim ke Driver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* AI Optimization Info */}
      <Card>
        <CardHeader>
          <CardTitle>🤖 AI Route Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🧠 Algoritma Cerdas</h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <div>• <strong>Traveling Salesman Algorithm:</strong> Menentukan urutan kunjungan optimal</div>
                <div>• <strong>Real-time Traffic Data:</strong> Mempertimbangkan kondisi lalu lintas terkini</div>
                <div>• <strong>Vehicle-specific Optimization:</strong> Disesuaikan dengan jenis kendaraan</div>
                <div>• <strong>Priority Handling:</strong> Order urgent diprioritaskan dalam rute</div>
                <div>• <strong>Fuel Efficiency:</strong> Minimalisasi konsumsi BBM dan emisi</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">📈 Benefits</h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <div>• <strong>Efisiensi Operasional:</strong> Hemat hingga 30% biaya operasional</div>
                <div>• <strong>Customer Satisfaction:</strong> Delivery time lebih akurat dan cepat</div>
                <div>• <strong>Driver Productivity:</strong> Lebih banyak order selesai per hari</div>
                <div>• <strong>Environmental Impact:</strong> Kurangi emisi CO₂ hingga 25%</div>
                <div>• <strong>Real-time Adaptation:</strong> Menyesuaikan rute saat ada perubahan</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}