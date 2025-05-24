import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Eye,
  Thermometer,
  Droplets,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Zap,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  precipitation: number;
  pressure: number;
  uvIndex: number;
  forecast: WeatherForecast[];
}

interface WeatherForecast {
  time: string;
  temperature: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
}

interface WeatherAdjustedRoute {
  routeId: number;
  routeName: string;
  distance: number;
  estimatedTime: number;
  normalTime: number;
  weatherAdjustment: number;
  weatherConditions: string[];
  safetyScore: number;
  fuelConsumption: number;
  tollCost: number;
  weatherImpact: {
    visibility: 'excellent' | 'good' | 'poor' | 'dangerous';
    roadCondition: 'dry' | 'wet' | 'slippery' | 'flooded';
    trafficImpact: 'none' | 'minor' | 'moderate' | 'severe';
    drivingDifficulty: 'easy' | 'moderate' | 'difficult' | 'dangerous';
  };
  recommendations: string[];
  warnings: string[];
  alternatives: string[];
}

interface WeatherAlert {
  id: number;
  type: 'rain' | 'storm' | 'fog' | 'wind' | 'temperature';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  message: string;
  affectedAreas: string[];
  duration: string;
  recommendations: string[];
}

export default function WeatherRouteOptimization() {
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [weatherLocation, setWeatherLocation] = useState('Jakarta');
  const [selectedVehicleType, setSelectedVehicleType] = useState('motor');
  const [refreshInterval, setRefreshInterval] = useState(5); // minutes

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current weather data
  const { data: weatherData, isLoading: loadingWeather } = useQuery<WeatherData>({
    queryKey: ["/api/weather/current", weatherLocation],
    refetchInterval: refreshInterval * 60 * 1000, // Convert to milliseconds
  });

  // Fetch weather-adjusted routes
  const { data: weatherRoutes = [], isLoading: loadingRoutes } = useQuery<WeatherAdjustedRoute[]>({
    queryKey: ["/api/weather/routes", weatherLocation, selectedVehicleType],
  });

  // Fetch weather alerts
  const { data: weatherAlerts = [], isLoading: loadingAlerts } = useQuery<WeatherAlert[]>({
    queryKey: ["/api/weather/alerts", weatherLocation],
  });

  // Apply weather-optimized route
  const applyRouteMutation = useMutation({
    mutationFn: (data: { routeId: number; weatherConditions: string[] }) =>
      apiRequest("POST", "/api/weather/apply-route", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      toast({
        title: "🌦️ Rute Weather-Optimized Diterapkan",
        description: "Rute sudah disesuaikan dengan kondisi cuaca terkini untuk keamanan maksimal",
      });
    },
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'stormy': return <CloudSnow className="h-6 w-6 text-purple-500" />;
      case 'foggy': return <Eye className="h-6 w-6 text-gray-400" />;
      default: return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'poor': return 'bg-yellow-100 text-yellow-800';
      case 'dangerous': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🌦️ Weather-Based Route Optimization</h1>
          <p className="text-muted-foreground">
            Optimasi rute cerdas berdasarkan kondisi cuaca real-time untuk keamanan dan efisiensi maksimal
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Zap className="h-3 w-3 mr-1" />
            Real-time Weather
          </Badge>
          <Button size="sm" variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Safety Mode
          </Button>
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">⚠️ Weather Alerts</h2>
          {weatherAlerts.map((alert) => (
            <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                  </div>
                  <div className="text-sm">
                    <p><strong>Durasi:</strong> {alert.duration}</p>
                    <p><strong>Area Terdampak:</strong> {alert.affectedAreas.join(', ')}</p>
                    <div className="mt-2">
                      <strong>Rekomendasi:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {alert.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lokasi Weather</label>
              <Select value={weatherLocation} onValueChange={setWeatherLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jakarta">Jakarta</SelectItem>
                  <SelectItem value="Surabaya">Surabaya</SelectItem>
                  <SelectItem value="Bandung">Bandung</SelectItem>
                  <SelectItem value="Medan">Medan</SelectItem>
                  <SelectItem value="Makassar">Makassar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Kendaraan</label>
              <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motor">🏍️ Motor</SelectItem>
                  <SelectItem value="mobil">🚗 Mobil</SelectItem>
                  <SelectItem value="pickup">🚛 Pickup</SelectItem>
                  <SelectItem value="truck">🚚 Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Refresh Interval</label>
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 menit</SelectItem>
                  <SelectItem value="5">5 menit</SelectItem>
                  <SelectItem value="10">10 menit</SelectItem>
                  <SelectItem value="15">15 menit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Update</label>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Live Data Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {weatherData && getWeatherIcon(weatherData.condition)}
              <span className="ml-2">Cuaca Saat Ini</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWeather ? (
              <div className="text-center py-4">
                <Cloud className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-2" />
                <p className="text-sm">Loading weather data...</p>
              </div>
            ) : weatherData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{weatherData.temperature}°C</div>
                  <p className="text-muted-foreground capitalize">{weatherData.condition}</p>
                  <p className="text-sm font-medium">{weatherData.location}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    <span>Humidity: {weatherData.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-gray-600" />
                    <span>Wind: {weatherData.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span>Visibility: {weatherData.visibility} km</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CloudRain className="h-4 w-4 text-blue-500" />
                    <span>Rain: {weatherData.precipitation}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <h4 className="font-medium mb-2">Forecast (4 jam ke depan)</h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {weatherData.forecast.slice(0, 4).map((forecast, index) => (
                      <div key={index} className="text-center p-2 bg-muted/50 rounded">
                        <p className="font-medium">{forecast.time}</p>
                        <p>{forecast.temperature}°</p>
                        <p className="text-blue-600">{forecast.precipitation}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Weather data unavailable</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Impact Summary */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Weather Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">✅ Kondisi Menguntungkan:</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-green-700">• Visibility excellent (&gt;10km)</li>
                  <li className="text-green-700">• Jalan kering, grip optimal</li>
                  <li className="text-green-700">• Angin lemah, stabil berkendara</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-600 mb-2">⚠️ Perhatian Khusus:</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-orange-700">• Potensi hujan ringan (20%)</li>
                  <li className="text-orange-700">• Temperature tinggi, dehidrasi risk</li>
                  <li className="text-orange-700">• UV index tinggi, perlindungan mata</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-600 mb-2">💡 Rekomendasi Smart:</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-blue-700">• Gunakan rute tol untuk efisiensi</li>
                  <li className="text-blue-700">• Bawa air minum ekstra</li>
                  <li className="text-blue-700">• Monitor weather tiap 30 menit</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Quick Weather Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Thermometer className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">28°C</div>
                <p className="text-xs text-blue-600">Temperature</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Eye className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">15km</div>
                <p className="text-xs text-green-600">Visibility</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Wind className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-700">12 km/h</div>
                <p className="text-xs text-orange-600">Wind Speed</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <CloudRain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-700">20%</div>
                <p className="text-xs text-purple-600">Rain Chance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather-Adjusted Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Weather-Optimized Routes ({weatherRoutes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRoutes ? (
            <div className="text-center py-8">
              <Navigation className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
              <p>Analyzing weather-adjusted routes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weatherRoutes.map((route) => (
                <Card key={route.routeId} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Route Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{route.routeName}</h3>
                          <div className={`text-lg font-bold ${getSafetyColor(route.safetyScore)}`}>
                            {route.safetyScore}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Distance:</span>
                            <span className="ml-1 font-medium">{route.distance} km</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Normal Time:</span>
                            <span className="ml-1 font-medium">{formatTime(route.normalTime)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weather Time:</span>
                            <span className="ml-1 font-medium text-blue-600">{formatTime(route.estimatedTime)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Adjustment:</span>
                            <span className={`ml-1 font-medium ${route.weatherAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {route.weatherAdjustment > 0 ? '+' : ''}{route.weatherAdjustment}min
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Weather Impact */}
                      <div className="space-y-3">
                        <h4 className="font-medium">🌦️ Weather Impact</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Visibility:</span>
                            <Badge className={getConditionColor(route.weatherImpact.visibility)}>
                              {route.weatherImpact.visibility}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Road Condition:</span>
                            <Badge className={getConditionColor(route.weatherImpact.roadCondition)}>
                              {route.weatherImpact.roadCondition}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Traffic Impact:</span>
                            <Badge className={getConditionColor(route.weatherImpact.trafficImpact)}>
                              {route.weatherImpact.trafficImpact}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Difficulty:</span>
                            <Badge className={getConditionColor(route.weatherImpact.drivingDifficulty)}>
                              {route.weatherImpact.drivingDifficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-green-600">💡 Recommendations</h4>
                        <ul className="text-sm space-y-1">
                          {route.recommendations.map((rec, index) => (
                            <li key={index} className="text-green-700">• {rec}</li>
                          ))}
                        </ul>
                        
                        {route.warnings.length > 0 && (
                          <div>
                            <h4 className="font-medium text-orange-600 mt-3">⚠️ Warnings</h4>
                            <ul className="text-sm space-y-1">
                              {route.warnings.map((warning, index) => (
                                <li key={index} className="text-orange-700">• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-2">Safety Score</div>
                          <div className={`text-2xl font-bold ${getSafetyColor(route.safetyScore)}`}>
                            {route.safetyScore}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <div className="p-2 bg-muted/50 rounded text-center">
                            <span className="font-medium">Fuel: {route.fuelConsumption}L</span>
                          </div>
                          <div className="p-2 bg-muted/50 rounded text-center">
                            <span className="font-medium">Toll: Rp {route.tollCost.toLocaleString()}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => applyRouteMutation.mutate({
                            routeId: route.routeId,
                            weatherConditions: route.weatherConditions
                          })}
                          disabled={applyRouteMutation.isPending}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Use Safe Route
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
    </div>
  );
}