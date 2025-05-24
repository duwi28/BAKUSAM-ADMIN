import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  Package,
  Truck,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Circle,
  Eye,
  Route,
  Zap
} from "lucide-react";

interface LiveDriverLocation {
  id: number;
  driverId: number;
  fullName: string;
  phone: string;
  vehicleType: string;
  priority: string;
  currentLat: number;
  currentLng: number;
  lastUpdate: string;
  status: 'online' | 'busy' | 'offline' | 'break';
  currentSpeed: number;
  batteryLevel: number;
  currentOrder?: {
    id: number;
    pickupAddress: string;
    deliveryAddress: string;
    customerName: string;
    eta: string;
    progress: number;
  };
}

export default function LiveTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<LiveDriverLocation | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Fetch live driver locations
  const { data: liveLocations = [], isLoading, refetch } = useQuery<LiveDriverLocation[]>({
    queryKey: ["/api/drivers/live-locations"],
    refetchInterval: isAutoRefresh ? 3000 : false, // Auto refresh every 3 seconds
  });

  const filteredDrivers = liveLocations.filter(driver => {
    const matchesSearch = driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    const matchesVehicle = vehicleFilter === "all" || driver.vehicleType === vehicleFilter;
    
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'break': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Sibuk';
      case 'break': return 'Istirahat';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <Package className="h-4 w-4" />;
      case 'break': return <Clock className="h-4 w-4" />;
      case 'offline': return <Circle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "motor": return "🏍️";
      case "mobil": return "🚗";
      case "pickup": return "🚛";
      default: return "🚚";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "priority" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";
  };

  const formatLastUpdate = (timestamp: string) => {
    const now = new Date();
    const update = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - update.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  };

  const stats = {
    total: liveLocations.length,
    online: liveLocations.filter(d => d.status === 'online').length,
    busy: liveLocations.filter(d => d.status === 'busy').length,
    offline: liveLocations.filter(d => d.status === 'offline').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">📍 Live GPS Tracking</h1>
          <p className="text-muted-foreground">
            Monitor posisi dan status kurir secara real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Manual
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Kurir</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sibuk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.busy}</p>
              </div>
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{stats.offline}</p>
              </div>
              <Circle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari kurir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="busy">Sibuk</SelectItem>
                <SelectItem value="break">Istirahat</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kendaraan</SelectItem>
                <SelectItem value="motor">Motor</SelectItem>
                <SelectItem value="mobil">Mobil</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredDrivers.length} dari {liveLocations.length} kurir
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Map & Driver List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Daftar Kurir Live</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredDrivers.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || vehicleFilter !== "all"
                      ? "Tidak ada kurir yang sesuai dengan filter"
                      : "Belum ada data tracking kurir"}
                  </div>
                ) : (
                  filteredDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedDriver?.id === driver.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <div className="space-y-3">
                        {/* Driver Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{getVehicleIcon(driver.vehicleType)}</div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-foreground">{driver.fullName}</h3>
                                <Badge className={getPriorityColor(driver.priority)}>
                                  {driver.priority === "priority" ? "Priority" : "Normal"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">📞 {driver.phone}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(driver.status)}>
                            {getStatusIcon(driver.status)}
                            <span className="ml-1">{getStatusText(driver.status)}</span>
                          </Badge>
                        </div>

                        {/* Location & Speed */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Navigation className="h-3 w-3 text-blue-600" />
                            <span>{driver.currentSpeed} km/h</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="h-3 w-3 text-green-600" />
                            <span>{driver.batteryLevel}%</span>
                          </div>
                        </div>

                        {/* Current Order */}
                        {driver.currentOrder && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Sedang Mengantarkan</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><strong>Order #{driver.currentOrder.id}</strong></p>
                              <p>📍 Dari: {driver.currentOrder.pickupAddress}</p>
                              <p>🎯 Ke: {driver.currentOrder.deliveryAddress}</p>
                              <p>👤 Customer: {driver.currentOrder.customerName}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-600 h-2 rounded-full transition-all"
                                    style={{ width: `${driver.currentOrder.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-yellow-700">
                                  ETA: {driver.currentOrder.eta}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Last Update */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Update: {formatLastUpdate(driver.lastUpdate)}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>🗺️ Peta Live Tracking</span>
                {selectedDriver && (
                  <Badge variant="secondary" className="ml-2">
                    Fokus: {selectedDriver.fullName}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-[600px] flex items-center justify-center">
                {/* Simulated Map */}
                <div className="absolute inset-4 bg-white rounded-lg shadow-inner overflow-hidden">
                  {/* Map Grid */}
                  <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="border-b border-gray-300" style={{ height: '10%' }} />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="absolute border-r border-gray-300 h-full" style={{ 
                        left: `${i * 10}%`, 
                        width: '1px' 
                      }} />
                    ))}
                  </div>

                  {/* Driver Markers */}
                  {filteredDrivers.map((driver, index) => (
                    <div
                      key={driver.id}
                      className={`absolute transition-all duration-300 ${
                        selectedDriver?.id === driver.id ? 'z-20 scale-125' : 'z-10'
                      }`}
                      style={{
                        left: `${(driver.currentLat % 1) * 80 + 10}%`,
                        top: `${(driver.currentLng % 1) * 80 + 10}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className={`relative group cursor-pointer ${
                        selectedDriver?.id === driver.id ? 'animate-pulse' : ''
                      }`}>
                        {/* Driver Marker */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 ${
                          driver.status === 'online' ? 'bg-green-500 border-green-300 text-white' :
                          driver.status === 'busy' ? 'bg-yellow-500 border-yellow-300 text-white' :
                          driver.status === 'break' ? 'bg-blue-500 border-blue-300 text-white' :
                          'bg-gray-500 border-gray-300 text-white'
                        }`}>
                          {getVehicleIcon(driver.vehicleType)}
                        </div>

                        {/* Pulse Animation for Active Drivers */}
                        {driver.status === 'online' && (
                          <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></div>
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          {driver.fullName} - {getStatusText(driver.status)}
                          {driver.currentSpeed > 0 && ` (${driver.currentSpeed} km/h)`}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Map Controls */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <Button size="sm" variant="secondary" className="bg-white/90">
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/90">
                      <Route className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-3 shadow">
                    <h4 className="font-medium text-sm mb-2">Status Kurir</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Online</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Sibuk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Istirahat</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span>Offline</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Maps Integration Notice */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="bg-white/95 rounded-lg p-6 shadow-lg border">
                      <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Google Maps Live Tracking</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Menampilkan posisi real-time semua kurir aktif di Jakarta
                      </p>
                      <Badge className="bg-green-100 text-green-800">
                        🔄 Auto-refresh setiap 3 detik
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}