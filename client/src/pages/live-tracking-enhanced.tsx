import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Navigation,
  Truck,
  Clock,
  Users,
  Activity,
  Zap,
  Search,
  Filter,
  Maximize,
  RefreshCw,
  Satellite,
  Map,
  List,
  Eye,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Timer,
  Fuel,
  Route,
  Target,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DriverLocationData {
  driverId: number;
  driverName: string;
  vehicleType: string;
  status: string;
  priorityLevel: string;
  rating: string;
  phone: string;
  location: {
    type: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    accuracy?: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    batteryLevel?: number;
    signalStrength?: number;
    timestamp: string;
    lastActive: string;
  } | null;
  isOnline: boolean;
}

interface EmergencyAlert {
  type: string;
  alertType: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  status: string;
  priority: string;
  timestamp: string;
  alertId: string;
  driverId: number;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
}

export default function LiveTrackingEnhanced() {
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'grid'>('map');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle' | 'delivery'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mapStyle, setMapStyle] = useState<'normal' | 'satellite' | 'terrain'>('normal');
  const [refreshInterval, setRefreshInterval] = useState(3000);

  const { toast } = useToast();

  // Fetch real-time driver locations using the new enhanced API
  const { data: locationData, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/drivers/locations'],
    refetchInterval: refreshInterval,
  });

  // Fetch emergency alerts
  const { data: alertData } = useQuery({
    queryKey: ['/api/admin/emergency-alerts'],
    refetchInterval: 5000, // Check every 5 seconds for emergency alerts
  });

  const drivers: DriverLocationData[] = locationData?.data || [];
  const emergencyAlerts: EmergencyAlert[] = alertData?.data || [];

  // Filter drivers based on status and search
  const filteredDrivers = drivers.filter((driver: DriverLocationData) => {
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'idle': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'idle': return <Clock className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    return `${Math.floor(diff / 3600)} jam lalu`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat live tracking...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Gagal memuat data tracking</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Muat Ulang
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Navigation className="h-6 w-6 mr-2 text-blue-600" />
            Live GPS Tracking
          </h1>
          <p className="text-gray-600 text-sm">
            Real-time tracking driver dan kendaraan dengan update setiap {refreshInterval/1000} detik
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 detik</SelectItem>
              <SelectItem value="3000">3 detik</SelectItem>
              <SelectItem value="5000">5 detik</SelectItem>
              <SelectItem value="10000">10 detik</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Maximize className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Active Drivers</p>
                <p className="text-xl font-bold text-green-900">
                  {filteredLocations.filter(l => l.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">On Delivery</p>
                <p className="text-xl font-bold text-blue-900">
                  {filteredLocations.filter(l => l.status === 'delivery').length}
                </p>
              </div>
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600">Idle</p>
                <p className="text-xl font-bold text-yellow-900">
                  {filteredLocations.filter(l => l.status === 'idle').length}
                </p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600">Offline</p>
                <p className="text-xl font-bold text-red-900">
                  {filteredLocations.filter(l => l.status === 'offline').length}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Total Drivers</p>
                <p className="text-xl font-bold text-purple-900">{filteredLocations.length}</p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Filter className="h-5 w-5 mr-2 text-gray-600" />
            Filter & Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Cari driver atau nomor telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'idle' | 'delivery')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="delivery">On Delivery</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-md"
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-md"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-md"
              >
                <Globe className="h-4 w-4 mr-2" />
                Grid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <Card className="lg:col-span-2 bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-lg font-semibold">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Live Map View
            </CardTitle>
            <div className="flex space-x-2">
              <Select value={mapStyle} onValueChange={(value) => setMapStyle(value as 'normal' | 'satellite' | 'terrain')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-blue-300">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-600 font-medium mb-2">Interactive Map View</p>
                <p className="text-sm text-blue-500 mb-4">
                  Untuk menampilkan peta interaktif yang sesungguhnya, diperlukan Google Maps API key
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {filteredLocations.slice(0, 4).map((location) => (
                    <div key={location.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          location.status === 'active' ? 'bg-green-500' : 
                          location.status === 'delivery' ? 'bg-blue-500' : 
                          location.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium">{location.fullName}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{location.vehicleType}</p>
                      <p className="text-xs text-gray-500">{formatLastUpdate(location.lastUpdate)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver List */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Driver List ({filteredLocations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLocations.map((location) => (
                <div 
                  key={location.id} 
                  className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    selectedDriver === location.driverId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => setSelectedDriver(
                    selectedDriver === location.driverId ? null : location.driverId
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          location.status === 'active' ? 'bg-green-500 animate-pulse' : 
                          location.status === 'delivery' ? 'bg-blue-500 animate-pulse' : 
                          location.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <p className="font-semibold text-sm">{location.fullName}</p>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{location.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Truck className="h-3 w-3" />
                          <span>{location.vehicleType}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatLastUpdate(location.lastUpdate)}</span>
                        </div>
                      </div>

                      {location.currentOrder && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                          <p className="text-xs font-medium text-blue-800">Order #{location.currentOrder.id}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {location.currentOrder.pickup} → {location.currentOrder.delivery}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Timer className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600">
                              ETA: {location.currentOrder.estimatedTime} min
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={`text-xs ${getStatusColor(location.status)} border`}>
                        {getStatusIcon(location.status)}
                        <span className="ml-1 capitalize">{location.status}</span>
                      </Badge>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredLocations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>Tidak ada driver yang ditemukan</p>
                  <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Driver Details */}
      {selectedDriver && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Target className="h-5 w-5 mr-2 text-indigo-600" />
              Driver Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const driver = filteredLocations.find(l => l.driverId === selectedDriver);
              if (!driver) return null;
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Informasi Driver</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama:</span>
                        <span className="font-medium">{driver.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telepon:</span>
                        <span className="font-medium">{driver.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kendaraan:</span>
                        <span className="font-medium">{driver.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={`text-xs ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Lokasi & Tracking</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latitude:</span>
                        <span className="font-medium">{driver.latitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Longitude:</span>
                        <span className="font-medium">{driver.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Update Terakhir:</span>
                        <span className="font-medium">{formatLastUpdate(driver.lastUpdate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Hubungi Driver
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Kirim Pesan
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Route className="h-4 w-4 mr-2" />
                        Lihat Rute
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}