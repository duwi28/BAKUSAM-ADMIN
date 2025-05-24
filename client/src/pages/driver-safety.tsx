import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Activity, 
  Zap,
  PhoneCall,
  Car,
  Gauge,
  Wifi,
  Battery,
  Navigation,
  CloudRain,
  Wind,
  Thermometer,
  Eye,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Heart,
  Target,
  Siren
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface SafetyAlert {
  id: number;
  driverId: number;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  location?: string;
  isActive: boolean;
  isAcknowledged: boolean;
  createdAt: string;
  expiresAt?: string;
  driver?: {
    id: number;
    fullName: string;
    vehicleType: string;
    phone: string;
  };
}

interface DriverSafetyStatus {
  id: number;
  driverId: number;
  currentLocation?: string;
  speed: number;
  isOnDuty: boolean;
  lastActiveTime: string;
  batteryLevel?: number;
  signalStrength?: number;
  safetyScore: number;
  emergencyContact?: string;
  isInEmergency: boolean;
  driver?: {
    id: number;
    fullName: string;
    vehicleType: string;
    phone: string;
  };
}

interface SafetyIncident {
  id: number;
  driverId: number;
  incidentType: string;
  severity: string;
  description: string;
  location?: string;
  reportedAt: string;
  status: string;
  driver?: {
    id: number;
    fullName: string;
    vehicleType: string;
  };
}

export default function DriverSafety() {
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("alerts");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    alertType: "weather",
    severity: "medium",
    title: "",
    message: "",
    location: "",
    driverId: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
    // Auto-refresh data setiap 30 detik untuk real-time updates
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/driver-safety-status'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  // Query untuk alerts aktif
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/safety-alerts"],
    refetchInterval: 30000 // Auto-refresh setiap 30 detik
  });

  // Query untuk status keselamatan driver
  const { data: safetyStatuses, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/driver-safety-status"],
    refetchInterval: 15000 // Refresh lebih sering untuk status real-time
  });

  // Query untuk insiden keselamatan
  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ["/api/safety-incidents"],
  });

  // Query untuk statistik keselamatan
  const { data: safetyStats } = useQuery({
    queryKey: ["/api/safety-statistics"],
  });

  // Mutation untuk acknowledge alert
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => 
      fetch(`/api/safety-alerts/${alertId}/acknowledge`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety-alerts'] });
    },
  });

  // Mutation untuk emergency panic button
  const emergencyPanicMutation = useMutation({
    mutationFn: (driverId: number) => 
      fetch(`/api/driver-safety/${driverId}/emergency`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyType: 'panic_button' })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-safety-status'] });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Siren className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <CloudRain className="h-5 w-5" />;
      case 'traffic': return <Car className="h-5 w-5" />;
      case 'area_risk': return <MapPin className="h-5 w-5" />;
      case 'speed': return <Gauge className="h-5 w-5" />;
      case 'fatigue': return <Eye className="h-5 w-5" />;
      case 'emergency': return <Siren className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleAcknowledgeAlert = (alertId: number) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  const handleEmergencyPanic = (driverId: number) => {
    if (confirm('Apakah Anda yakin ingin mengirim sinyal darurat untuk driver ini?')) {
      emergencyPanicMutation.mutate(driverId);
    }
  };

  const alertsData = Array.isArray(alerts) ? alerts : [];
  const statusData = Array.isArray(safetyStatuses) ? safetyStatuses : [];
  const incidentsData = Array.isArray(incidents) ? incidents : [];

  const filteredAlerts = alertsData.filter((alert: SafetyAlert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity && alert.isActive;
  });

  const activeEmergencies = statusData.filter((status: DriverSafetyStatus) => status.isInEmergency);
  const onDutyDrivers = statusData.filter((status: DriverSafetyStatus) => status.isOnDuty);
  const lowSafetyScoreDrivers = statusData.filter((status: DriverSafetyStatus) => status.safetyScore < 70);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Sistem Keselamatan Driver
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-red-500 animate-pulse" />
                    Monitoring dan peringatan keselamatan real-time
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">MONITORING AKTIF</span>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Driver On Duty</p>
                  <p className="text-3xl font-bold text-green-600">{onDutyDrivers.length}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Aktif Sekarang
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Alert Aktif</p>
                  <p className="text-3xl font-bold text-orange-600">{filteredAlerts.length}</p>
                  <p className="text-sm text-orange-600 flex items-center">
                    <Bell className="w-3 h-3 mr-1" />
                    Perlu Perhatian
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Emergency Status</p>
                  <p className="text-3xl font-bold text-red-600">{activeEmergencies.length}</p>
                  <p className="text-sm text-red-600 flex items-center">
                    <Siren className="w-3 h-3 mr-1 animate-pulse" />
                    {activeEmergencies.length > 0 ? 'Darurat!' : 'Aman'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <PhoneCall className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Skor Keselamatan</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {statusData.length > 0 ? Math.round(statusData.reduce((sum: number, s: DriverSafetyStatus) => sum + s.safetyScore, 0) / statusData.length) : 100}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Rata-rata
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div 
          className={`transform transition-all duration-1000 delay-400 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari alert atau driver..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tingkat</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries()}
                  className="w-full lg:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div 
            className={`transform transition-all duration-1000 delay-600 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-lg">
              <TabsTrigger value="alerts" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alert Keselamatan
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Status Driver
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Insiden
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="alerts" className="space-y-6">
            {alertsLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-lg animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredAlerts.map((alert: SafetyAlert, index: number) => (
                  <div
                    key={alert.id}
                    className={`transform transition-all duration-700 ${
                      mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className={`group hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-lg border-l-4 ${
                      alert.severity === 'critical' ? 'border-l-red-500' :
                      alert.severity === 'high' ? 'border-l-orange-500' :
                      alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                    } shadow-xl hover:shadow-2xl`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                              alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {getAlertTypeIcon(alert.alertType)}
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {alert.title}
                                {alert.severity === 'critical' && (
                                  <Siren className="h-4 w-4 text-red-500 animate-pulse" />
                                )}
                              </CardTitle>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                <span>{alert.driver?.fullName}</span>
                                <Badge variant="outline">{alert.driver?.vehicleType}</Badge>
                                <Clock className="h-3 w-3" />
                                <span>{formatDateTime(new Date(alert.createdAt))}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {getSeverityIcon(alert.severity)}
                              <span className="ml-1 capitalize">{alert.severity}</span>
                            </Badge>
                            {!alert.isAcknowledged && (
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                disabled={acknowledgeAlertMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{alert.message}</p>
                        
                        {alert.location && (
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{alert.location}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Alert Type: {alert.alertType.replace('_', ' ')}</span>
                            {alert.expiresAt && (
                              <span>Expires: {formatDateTime(new Date(alert.expiresAt))}</span>
                            )}
                          </div>
                          {alert.driver && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alert.driver && handleEmergencyPanic(alert.driver.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <PhoneCall className="h-4 w-4 mr-1" />
                              Hubungi Driver
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {filteredAlerts.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardContent className="p-12 text-center">
                      <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Semua Aman!</h3>
                      <p className="text-gray-600">Tidak ada alert keselamatan aktif saat ini.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            {statusLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-lg animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {statusData.map((status: DriverSafetyStatus, index: number) => (
                  <div
                    key={status.id}
                    className={`transform transition-all duration-700 ${
                      mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className={`group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl ${
                      status.isInEmergency ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                    }`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                                {status.driver?.fullName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{status.driver?.fullName}</CardTitle>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{status.driver?.vehicleType}</Badge>
                                <Badge className={status.isOnDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {status.isOnDuty ? 'On Duty' : 'Off Duty'}
                                </Badge>
                                {status.isInEmergency && (
                                  <Badge className="bg-red-100 text-red-800 animate-pulse">
                                    <Siren className="h-3 w-3 mr-1" />
                                    EMERGENCY
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getSafetyScoreColor(status.safetyScore)}`}>
                              {status.safetyScore}
                            </div>
                            <div className="text-sm text-gray-500">Safety Score</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Gauge className="h-4 w-4 mr-2" />
                                Speed: {status.speed} km/h
                              </div>
                              {status.batteryLevel && (
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <Battery className="h-4 w-4 mr-2" />
                                  Battery: {status.batteryLevel}%
                                </div>
                              )}
                              {status.signalStrength && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Wifi className="h-4 w-4 mr-2" />
                                  Signal: {status.signalStrength}%
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Clock className="h-4 w-4 mr-2" />
                                Last Active: {formatDateTime(new Date(status.lastActiveTime))}
                              </div>
                              {status.currentLocation && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {status.currentLocation}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Safety Score</span>
                              <span className={getSafetyScoreColor(status.safetyScore)}>
                                {status.safetyScore}/100
                              </span>
                            </div>
                            <Progress value={status.safetyScore} className="h-2" />
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-sm text-gray-500">
                              Emergency Contact: {status.emergencyContact || 'Not set'}
                            </div>
                            <Button
                              size="sm"
                              variant={status.isInEmergency ? "destructive" : "outline"}
                              onClick={() => handleEmergencyPanic(status.driverId)}
                              disabled={emergencyPanicMutation.isPending}
                            >
                              {status.isInEmergency ? (
                                <>
                                  <Siren className="h-4 w-4 mr-1" />
                                  Emergency Active
                                </>
                              ) : (
                                <>
                                  <PhoneCall className="h-4 w-4 mr-1" />
                                  Contact
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            {incidentsLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-lg animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {incidentsData.map((incident: SafetyIncident, index: number) => (
                  <div
                    key={incident.id}
                    className={`transform transition-all duration-700 ${
                      mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className="group hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              incident.severity === 'severe' ? 'bg-orange-100 text-orange-600' :
                              incident.severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              <Shield className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg capitalize">
                                {incident.incidentType.replace('_', ' ')} - {incident.driver?.fullName}
                              </CardTitle>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                <Badge variant="outline">{incident.driver?.vehicleType}</Badge>
                                <Clock className="h-3 w-3" />
                                <span>{formatDateTime(new Date(incident.reportedAt))}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(incident.severity)}>
                              {getSeverityIcon(incident.severity)}
                              <span className="ml-1 capitalize">{incident.severity}</span>
                            </Badge>
                            <Badge variant="outline" className={
                              incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {incident.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{incident.description}</p>
                        
                        {incident.location && (
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{incident.location}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Incident Type: {incident.incidentType.replace('_', ' ')}
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {incidentsData.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardContent className="p-12 text-center">
                      <Heart className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak Ada Insiden</h3>
                      <p className="text-gray-600">Tidak ada insiden keselamatan yang dilaporkan.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}