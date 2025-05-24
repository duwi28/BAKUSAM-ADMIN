import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Navigation, 
  Users, 
  Activity, 
  Car,
  Truck,
  Clock,
  Battery,
  Wifi,
  Gauge,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Phone,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Route,
  Timer,
  Signal
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface DriverLocation {
  id: number;
  driverId: number;
  fullName: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'online' | 'offline' | 'busy' | 'break';
  isOnDuty: boolean;
  currentOrderId?: number;
  speed: number; // km/h
  heading: number; // degrees
  batteryLevel: number; // %
  signalStrength: number; // %
  lastUpdated: string;
  distanceFromBase: number; // km
  totalDistanceToday: number; // km
  ordersCompleted: number;
  rating: number;
  estimatedArrival?: string;
  destination?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface TrafficCondition {
  area: string;
  condition: 'smooth' | 'moderate' | 'heavy' | 'blocked';
  averageSpeed: number;
  estimatedDelay: number; // minutes
}

export default function DriverMap() {
  const [mounted, setMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -6.2088, lng: 106.8456 });
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("map");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Query untuk posisi driver real-time
  const { data: driverLocations, isLoading } = useQuery({
    queryKey: ["/api/driver-locations"],
    refetchInterval: 5000 // Update setiap 5 detik untuk real-time
  });

  // Query untuk kondisi lalu lintas
  const { data: trafficData } = useQuery({
    queryKey: ["/api/traffic-conditions"],
    refetchInterval: 30000 // Update setiap 30 detik
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'break': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />;
      case 'busy': return <Activity className="h-3 w-3" />;
      case 'break': return <Clock className="h-3 w-3" />;
      case 'offline': return <XCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'motor': return <Navigation className="h-5 w-5" />;
      case 'mobil': return <Car className="h-5 w-5" />;
      case 'truck': return <Truck className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 70) return 'text-green-600';
    if (strength > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Sample data untuk demonstrasi
  const mockDriverLocations: DriverLocation[] = [
    {
      id: 1,
      driverId: 1,
      fullName: "Budi Santoso",
      phone: "081234567890",
      vehicleType: "motor",
      vehicleNumber: "B 1234 ABC",
      currentLocation: {
        lat: -6.2088,
        lng: 106.8456,
        address: "Jl. Sudirman, Jakarta Pusat"
      },
      status: 'busy',
      isOnDuty: true,
      currentOrderId: 12345,
      speed: 25,
      heading: 45,
      batteryLevel: 85,
      signalStrength: 95,
      lastUpdated: new Date(Date.now() - 30000).toISOString(),
      distanceFromBase: 3.2,
      totalDistanceToday: 87.5,
      ordersCompleted: 12,
      rating: 4.8,
      estimatedArrival: "5 menit",
      destination: {
        lat: -6.2144,
        lng: 106.8294,
        address: "Plaza Indonesia, Jakarta"
      }
    },
    {
      id: 2,
      driverId: 2,
      fullName: "Siti Rahayu",
      phone: "082345678901",
      vehicleType: "mobil",
      vehicleNumber: "B 5678 DEF",
      currentLocation: {
        lat: -6.2444,
        lng: 106.7991,
        address: "Blok M, Jakarta Selatan"
      },
      status: 'online',
      isOnDuty: true,
      speed: 0,
      heading: 0,
      batteryLevel: 42,
      signalStrength: 78,
      lastUpdated: new Date(Date.now() - 60000).toISOString(),
      distanceFromBase: 5.8,
      totalDistanceToday: 125.3,
      ordersCompleted: 18,
      rating: 4.6
    },
    {
      id: 3,
      driverId: 3,
      fullName: "Ahmad Rizki",
      phone: "083456789012",
      vehicleType: "motor",
      vehicleNumber: "B 9012 GHI",
      currentLocation: {
        lat: -6.1675,
        lng: 106.7853,
        address: "Grogol, Jakarta Barat"
      },
      status: 'break',
      isOnDuty: true,
      speed: 0,
      heading: 180,
      batteryLevel: 68,
      signalStrength: 65,
      lastUpdated: new Date(Date.now() - 120000).toISOString(),
      distanceFromBase: 8.1,
      totalDistanceToday: 156.7,
      ordersCompleted: 15,
      rating: 4.4
    }
  ];

  const mockTrafficData: TrafficCondition[] = [
    { area: "Jakarta Pusat", condition: 'heavy', averageSpeed: 15, estimatedDelay: 12 },
    { area: "Jakarta Selatan", condition: 'moderate', averageSpeed: 25, estimatedDelay: 5 },
    { area: "Jakarta Barat", condition: 'smooth', averageSpeed: 40, estimatedDelay: 0 },
    { area: "Jakarta Timur", condition: 'moderate', averageSpeed: 30, estimatedDelay: 3 },
    { area: "Jakarta Utara", condition: 'heavy', averageSpeed: 18, estimatedDelay: 8 }
  ];

  const filteredDrivers = mockDriverLocations.filter(driver => {
    const matchesSearch = driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || driver.status === filterStatus;
    const matchesVehicle = filterVehicle === "all" || driver.vehicleType === filterVehicle;
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const onlineDrivers = filteredDrivers.filter(d => d.status === 'online').length;
  const busyDrivers = filteredDrivers.filter(d => d.status === 'busy').length;
  const totalDistance = filteredDrivers.reduce((sum, d) => sum + d.totalDistanceToday, 0);
  const totalOrders = filteredDrivers.reduce((sum, d) => sum + d.ordersCompleted, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Header */}
        <div 
          className={`transform transition-all duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Navigation className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Peta Real-Time Driver
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-blue-500 animate-pulse" />
                    Monitoring posisi dan status driver secara langsung
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">LIVE TRACKING</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Update: {formatDateTime(new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transform transition-all duration-1000 delay-200 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Driver Online</p>
                  <p className="text-3xl font-bold text-green-600">{onlineDrivers}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Siap Menerima Order
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Driver Sibuk</p>
                  <p className="text-3xl font-bold text-orange-600">{busyDrivers}</p>
                  <p className="text-sm text-orange-600 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Sedang Mengantarkan
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Jarak Hari Ini</p>
                  <p className="text-3xl font-bold text-blue-600">{totalDistance.toFixed(1)} km</p>
                  <p className="text-sm text-blue-600 flex items-center">
                    <Route className="w-3 h-3 mr-1" />
                    Semua Driver
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Navigation className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Hari Ini</p>
                  <p className="text-3xl font-bold text-purple-600">{totalOrders}</p>
                  <p className="text-sm text-purple-600 flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Telah Diselesaikan
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div 
          className={`transform transition-all duration-1000 delay-400 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                    Cari Driver
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Nama atau nomor kendaraan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status Driver
                  </Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="busy">Sibuk</SelectItem>
                      <SelectItem value="break">Istirahat</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehicle" className="text-sm font-medium text-gray-700">
                    Jenis Kendaraan
                  </Label>
                  <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kendaraan</SelectItem>
                      <SelectItem value="motor">Motor</SelectItem>
                      <SelectItem value="mobil">Mobil</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Peta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
          <div 
            className={`transform transition-all duration-1000 delay-600 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-lg">
              <TabsTrigger value="map" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Peta Real-Time
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Daftar Driver
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Peta Posisi Driver
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {filteredDrivers.length} Driver Terpantau
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Simulated Map View */}
                <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
                    <p className="text-gray-600 text-lg font-medium">Peta Real-Time Driver</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Integrasi dengan Google Maps atau Mapbox untuk tracking posisi driver secara real-time
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
                      {filteredDrivers.slice(0, 4).map((driver, index) => (
                        <div key={driver.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
                          <div className={`w-3 h-3 rounded-full ${
                            driver.status === 'online' ? 'bg-green-500' :
                            driver.status === 'busy' ? 'bg-orange-500' :
                            driver.status === 'break' ? 'bg-yellow-500' : 'bg-gray-500'
                          } animate-pulse`}></div>
                          <div className="text-left">
                            <div className="text-xs font-medium text-gray-800">{driver.fullName}</div>
                            <div className="text-xs text-gray-500">{driver.currentLocation.address}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Traffic Conditions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                  {mockTrafficData.map((traffic, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{traffic.area}</span>
                        <Badge className={`${
                          traffic.condition === 'smooth' ? 'bg-green-100 text-green-800' :
                          traffic.condition === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          traffic.condition === 'heavy' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {traffic.condition === 'smooth' ? 'Lancar' :
                           traffic.condition === 'moderate' ? 'Sedang' :
                           traffic.condition === 'heavy' ? 'Padat' : 'Macet'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Kecepatan: {traffic.averageSpeed} km/h
                      </div>
                      {traffic.estimatedDelay > 0 && (
                        <div className="text-xs text-red-600">
                          Delay: +{traffic.estimatedDelay} menit
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <div className="grid gap-6">
              {filteredDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className={`transform transition-all duration-700 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <Card className="group hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-green-400 text-white">
                              {driver.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{driver.fullName}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(driver.status)}>
                                {getStatusIcon(driver.status)}
                                <span className="ml-1 capitalize">{driver.status}</span>
                              </Badge>
                              <Badge variant="outline">{driver.vehicleType}</Badge>
                              <Badge variant="outline">{driver.vehicleNumber}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Location Info */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Lokasi & Status
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Navigation className="h-3 w-3 mr-2" />
                              {driver.currentLocation.address}
                            </div>
                            {driver.destination && (
                              <div className="flex items-center text-gray-600">
                                <Target className="h-3 w-3 mr-2" />
                                Tujuan: {driver.destination.address}
                              </div>
                            )}
                            <div className="flex items-center text-gray-600">
                              <Timer className="h-3 w-3 mr-2" />
                              Update: {formatDateTime(new Date(driver.lastUpdated))}
                            </div>
                          </div>
                        </div>

                        {/* Technical Info */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 flex items-center">
                            <Activity className="h-4 w-4 mr-2" />
                            Info Teknis
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center text-gray-600">
                                <Gauge className="h-3 w-3 mr-2" />
                                Kecepatan:
                              </span>
                              <span className="font-medium">{driver.speed} km/h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center text-gray-600">
                                <Battery className="h-3 w-3 mr-2" />
                                Baterai:
                              </span>
                              <span className={`font-medium ${getBatteryColor(driver.batteryLevel)}`}>
                                {driver.batteryLevel}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center text-gray-600">
                                <Signal className="h-3 w-3 mr-2" />
                                Sinyal:
                              </span>
                              <span className={`font-medium ${getSignalColor(driver.signalStrength)}`}>
                                {driver.signalStrength}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Info */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            Performa Hari Ini
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Order:</span>
                              <span className="font-medium">{driver.ordersCompleted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Jarak:</span>
                              <span className="font-medium">{driver.totalDistanceToday} km</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Rating:</span>
                              <span className="font-medium">⭐ {driver.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {driver.estimatedArrival && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-blue-800">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="font-medium">
                              Estimasi tiba di tujuan: {driver.estimatedArrival}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}