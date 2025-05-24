import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  Clock,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Target,
  RefreshCw,
  Download,
  Eye,
  Navigation,
  Timer,
  DollarSign,
  Flame,
  Thermometer,
  Wind,
  Search
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface HeatMapData {
  id: number;
  area: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  orderCount: number;
  revenue: number;
  averageDistance: number;
  averageWaitTime: number;
  peakHours: string[];
  temperature: 'cold' | 'warm' | 'hot' | 'blazing';
  growthRate: number;
  driverCount: number;
  customerSatisfaction: number;
  lastUpdated: string;
}

interface TimeSlotData {
  hour: number;
  orderCount: number;
  revenue: number;
  driverAvailability: number;
}

export default function HeatMap() {
  const [mounted, setMounted] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const [selectedArea, setSelectedArea] = useState("all");
  const [viewMode, setViewMode] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Query untuk data heat map
  const { data: heatMapData, isLoading: heatMapLoading } = useQuery({
    queryKey: ["/api/heat-map", selectedTimeRange, viewMode],
    refetchInterval: 30000 // Update setiap 30 detik
  });

  // Query untuk data time slots
  const { data: timeSlotData, isLoading: timeSlotLoading } = useQuery({
    queryKey: ["/api/heat-map/time-slots", selectedTimeRange],
    refetchInterval: 60000 // Update setiap 1 menit
  });

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'blazing': return 'bg-red-600 text-white border-red-700';
      case 'hot': return 'bg-orange-500 text-white border-orange-600';
      case 'warm': return 'bg-yellow-500 text-white border-yellow-600';
      case 'cold': return 'bg-blue-500 text-white border-blue-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case 'blazing': return <Flame className="h-4 w-4" />;
      case 'hot': return <Thermometer className="h-4 w-4" />;
      case 'warm': return <Wind className="h-4 w-4" />;
      case 'cold': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const mockHeatMapData: HeatMapData[] = [
    {
      id: 1,
      area: "Jakarta Pusat - Menteng",
      coordinates: { lat: -6.1944, lng: 106.8294 },
      orderCount: 245,
      revenue: 1850000,
      averageDistance: 3.2,
      averageWaitTime: 4.5,
      peakHours: ["07:00-09:00", "12:00-14:00", "17:00-19:00"],
      temperature: 'blazing',
      growthRate: 23.5,
      driverCount: 18,
      customerSatisfaction: 4.8,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 2,
      area: "Jakarta Selatan - Blok M",
      coordinates: { lat: -6.2444, lng: 106.7991 },
      orderCount: 189,
      revenue: 1420000,
      averageDistance: 4.1,
      averageWaitTime: 6.2,
      peakHours: ["11:00-13:00", "18:00-20:00"],
      temperature: 'hot',
      growthRate: 18.2,
      driverCount: 14,
      customerSatisfaction: 4.6,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 3,
      area: "Jakarta Barat - Grogol",
      coordinates: { lat: -6.1675, lng: 106.7853 },
      orderCount: 156,
      revenue: 1180000,
      averageDistance: 5.5,
      averageWaitTime: 8.1,
      peakHours: ["08:00-10:00", "19:00-21:00"],
      temperature: 'warm',
      growthRate: 12.8,
      driverCount: 11,
      customerSatisfaction: 4.4,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 4,
      area: "Jakarta Timur - Cawang",
      coordinates: { lat: -6.2383, lng: 106.8742 },
      orderCount: 98,
      revenue: 740000,
      averageDistance: 6.8,
      averageWaitTime: 12.3,
      peakHours: ["07:00-08:00", "17:00-18:00"],
      temperature: 'cold',
      growthRate: 5.4,
      driverCount: 7,
      customerSatisfaction: 4.2,
      lastUpdated: new Date().toISOString()
    }
  ];

  const mockTimeSlotData: TimeSlotData[] = [
    { hour: 6, orderCount: 15, revenue: 112500, driverAvailability: 85 },
    { hour: 7, orderCount: 45, revenue: 337500, driverAvailability: 72 },
    { hour: 8, orderCount: 65, revenue: 487500, driverAvailability: 58 },
    { hour: 9, orderCount: 38, revenue: 285000, driverAvailability: 67 },
    { hour: 10, orderCount: 28, revenue: 210000, driverAvailability: 78 },
    { hour: 11, orderCount: 42, revenue: 315000, driverAvailability: 65 },
    { hour: 12, orderCount: 58, revenue: 435000, driverAvailability: 52 },
    { hour: 13, orderCount: 48, revenue: 360000, driverAvailability: 61 },
    { hour: 14, orderCount: 35, revenue: 262500, driverAvailability: 73 },
    { hour: 15, orderCount: 29, revenue: 217500, driverAvailability: 81 },
    { hour: 16, orderCount: 31, revenue: 232500, driverAvailability: 76 },
    { hour: 17, orderCount: 52, revenue: 390000, driverAvailability: 48 },
    { hour: 18, orderCount: 61, revenue: 457500, driverAvailability: 42 },
    { hour: 19, orderCount: 44, revenue: 330000, driverAvailability: 59 },
    { hour: 20, orderCount: 33, revenue: 247500, driverAvailability: 68 },
    { hour: 21, orderCount: 25, revenue: 187500, driverAvailability: 79 },
    { hour: 22, orderCount: 18, revenue: 135000, driverAvailability: 88 },
    { hour: 23, orderCount: 12, revenue: 90000, driverAvailability: 92 }
  ];

  const filteredData = mockHeatMapData.filter(area => {
    const matchesSearch = area.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === "all" || area.area.includes(selectedArea);
    return matchesSearch && matchesArea;
  });

  const totalOrders = filteredData.reduce((sum, area) => sum + area.orderCount, 0);
  const totalRevenue = filteredData.reduce((sum, area) => sum + area.revenue, 0);
  const averageGrowthRate = filteredData.reduce((sum, area) => sum + area.growthRate, 0) / filteredData.length;
  const totalDrivers = filteredData.reduce((sum, area) => sum + area.driverCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Heat Map Area Ramai
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-purple-500 animate-pulse" />
                    Analisis zona permintaan dan performa real-time
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">LIVE DATA</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Update: {formatDateTime(new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div 
          className={`transform transition-all duration-1000 delay-200 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
                    Rentang Waktu
                  </Label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hari Ini</SelectItem>
                      <SelectItem value="yesterday">Kemarin</SelectItem>
                      <SelectItem value="week">7 Hari Terakhir</SelectItem>
                      <SelectItem value="month">30 Hari Terakhir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="viewMode" className="text-sm font-medium text-gray-700">
                    Mode Tampilan
                  </Label>
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orders">Jumlah Order</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="growth">Growth Rate</SelectItem>
                      <SelectItem value="satisfaction">Customer Satisfaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                    Cari Area
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Cari nama area..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transform transition-all duration-1000 delay-400 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Order</p>
                  <p className="text-3xl font-bold text-purple-600">{totalOrders.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{averageGrowthRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">Rp {(totalRevenue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Hari Ini
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Driver Aktif</p>
                  <p className="text-3xl font-bold text-blue-600">{totalDrivers}</p>
                  <p className="text-sm text-blue-600 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Online Now
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Zona Aktif</p>
                  <p className="text-3xl font-bold text-orange-600">{filteredData.length}</p>
                  <p className="text-sm text-orange-600 flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Area Terpantau
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="areas" className="space-y-6">
          <div 
            className={`transform transition-all duration-1000 delay-600 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-lg">
              <TabsTrigger value="areas" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Area Heat Map
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Timeline Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="areas" className="space-y-6">
            <div className="grid gap-6">
              {filteredData.map((area, index) => (
                <div
                  key={area.id}
                  className={`transform transition-all duration-700 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <Card className="group hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${getTemperatureColor(area.temperature)}`}>
                            {getTemperatureIcon(area.temperature)}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{area.area}</CardTitle>
                            <div className="flex items-center space-x-3 mt-2">
                              <Badge className={getTemperatureColor(area.temperature)}>
                                {area.temperature.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                +{area.growthRate}% Growth
                              </Badge>
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                ⭐ {area.customerSatisfaction}/5
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{area.orderCount}</div>
                          <div className="text-sm text-gray-600">Total Order</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">Rp {(area.revenue / 1000).toLocaleString()}K</div>
                          <div className="text-sm text-gray-600">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{area.driverCount}</div>
                          <div className="text-sm text-gray-600">Driver Aktif</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{area.averageWaitTime}m</div>
                          <div className="text-sm text-gray-600">Avg Wait Time</div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Jam Sibuk:</h4>
                            <div className="flex flex-wrap gap-2">
                              {area.peakHours.map((hour, idx) => (
                                <Badge key={idx} variant="outline" className="text-orange-600 border-orange-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {hour}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Koordinat:</div>
                            <div className="text-sm font-mono text-gray-700">
                              {area.coordinates.lat}, {area.coordinates.lng}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="h-5 w-5 mr-2" />
                  Analisis Timeline 24 Jam
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockTimeSlotData.map((slot, index) => (
                    <div key={slot.hour} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-16 text-center">
                        <div className="text-lg font-bold text-gray-800">
                          {slot.hour.toString().padStart(2, '0')}:00
                        </div>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {slot.orderCount} orders • Rp {slot.revenue.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {slot.driverAvailability}% driver tersedia
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(slot.orderCount / 70) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <Badge 
                          className={`${
                            slot.orderCount >= 50 ? 'bg-red-100 text-red-800' :
                            slot.orderCount >= 30 ? 'bg-orange-100 text-orange-800' :
                            slot.orderCount >= 15 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {slot.orderCount >= 50 ? 'Blazing' :
                           slot.orderCount >= 30 ? 'Hot' :
                           slot.orderCount >= 15 ? 'Warm' : 'Cool'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}