import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Calendar,
  Cloud,
  MapPin,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DemandPrediction {
  timeSlot: string;
  predictedOrders: number;
  confidenceLevel: number;
  factors: {
    weather: string;
    events: string[];
    historicalPattern: number;
    seasonalTrend: number;
    dayOfWeek: number;
  };
  recommendations: string[];
  requiredDrivers: number;
  estimatedRevenue: number;
}

interface WeatherImpact {
  condition: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  demandMultiplier: number;
  affectedAreas: string[];
  recommendations: string[];
}

interface EventPrediction {
  eventName: string;
  eventType: 'concert' | 'sports' | 'festival' | 'conference' | 'holiday';
  location: string;
  startTime: string;
  endTime: string;
  expectedAttendees: number;
  demandIncrease: number;
  hotspotAreas: string[];
  peakTimes: string[];
}

export default function SmartDemandPrediction() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [selectedArea, setSelectedArea] = useState('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch demand predictions
  const { data: predictions = [], isLoading: loadingPredictions } = useQuery<DemandPrediction[]>({
    queryKey: ["/api/demand-prediction/forecasts", selectedTimeframe, selectedArea],
  });

  // Fetch weather impact
  const { data: weatherImpact = [], isLoading: loadingWeather } = useQuery<WeatherImpact[]>({
    queryKey: ["/api/demand-prediction/weather-impact"],
  });

  // Fetch event predictions
  const { data: eventPredictions = [], isLoading: loadingEvents } = useQuery<EventPrediction[]>({
    queryKey: ["/api/demand-prediction/events", selectedTimeframe],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-blue-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'concert': return '🎵';
      case 'sports': return '⚽';
      case 'festival': return '🎉';
      case 'conference': return '💼';
      case 'holiday': return '🏖️';
      default: return '📅';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🧠 Smart Demand Prediction</h1>
          <p className="text-muted-foreground">
            Prediksi permintaan order berdasarkan cuaca, event, dan pola historis menggunakan AI
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Button size="sm" variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Refresh Predictions
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="tomorrow">Besok</SelectItem>
                  <SelectItem value="week">7 Hari Ke Depan</SelectItem>
                  <SelectItem value="month">30 Hari Ke Depan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Area</label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Area</SelectItem>
                  <SelectItem value="jakarta_pusat">Jakarta Pusat</SelectItem>
                  <SelectItem value="jakarta_selatan">Jakarta Selatan</SelectItem>
                  <SelectItem value="jakarta_utara">Jakarta Utara</SelectItem>
                  <SelectItem value="jakarta_timur">Jakarta Timur</SelectItem>
                  <SelectItem value="jakarta_barat">Jakarta Barat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model Status</label>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Model Active (v2.1)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Predicted Orders Today</p>
                <div className="text-2xl font-bold">
                  {predictions.reduce((sum, p) => sum + p.predictedOrders, 0)}
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +15% dari kemarin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Required Drivers</p>
                <div className="text-2xl font-bold">
                  {predictions.reduce((sum, p) => sum + p.requiredDrivers, 0)}
                </div>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Optimal distribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estimated Revenue</p>
                <div className="text-2xl font-bold">
                  {formatCurrency(predictions.reduce((sum, p) => sum + p.estimatedRevenue, 0))}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weather Impact</p>
                <div className="text-2xl font-bold">
                  {weatherImpact.length > 0 ? `${(weatherImpact[0].demandMultiplier * 100).toFixed(0)}%` : 'Normal'}
                </div>
              </div>
              <Cloud className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Current weather effect
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">📊 Predictions</TabsTrigger>
          <TabsTrigger value="weather">🌤️ Weather Impact</TabsTrigger>
          <TabsTrigger value="events">📅 Events</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 Demand Predictions ({predictions.length} time slots)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPredictions ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>AI sedang memproses prediksi demand...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Time & Prediction */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <h3 className="font-semibold">{prediction.timeSlot}</h3>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-700">{prediction.predictedOrders}</div>
                                <p className="text-sm text-blue-600">Predicted Orders</p>
                              </div>
                              
                              <div className="text-center">
                                <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidenceLevel)}`}>
                                  {prediction.confidenceLevel}% Confidence
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Factors */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-green-600">🔍 Prediction Factors</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Weather:</span>
                                <span className="font-medium">{prediction.factors.weather}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Historical Pattern:</span>
                                <span className="font-medium">{prediction.factors.historicalPattern}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Seasonal Trend:</span>
                                <span className="font-medium">{prediction.factors.seasonalTrend}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Day Pattern:</span>
                                <span className="font-medium">{prediction.factors.dayOfWeek}%</span>
                              </div>
                              
                              {prediction.factors.events.length > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Events:</span>
                                  <div className="mt-1">
                                    {prediction.factors.events.map((event, i) => (
                                      <Badge key={i} variant="outline" className="mr-1 mb-1">
                                        {event}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Requirements */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-purple-600">📋 Requirements</h4>
                            <div className="space-y-2">
                              <div className="p-3 bg-purple-50 rounded-lg text-center">
                                <div className="text-xl font-bold text-purple-700">{prediction.requiredDrivers}</div>
                                <p className="text-sm text-purple-600">Drivers Needed</p>
                              </div>
                              
                              <div className="p-3 bg-green-50 rounded-lg text-center">
                                <div className="text-lg font-bold text-green-700">
                                  {formatCurrency(prediction.estimatedRevenue)}
                                </div>
                                <p className="text-sm text-green-600">Est. Revenue</p>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-orange-600">💡 AI Recommendations</h4>
                            <ul className="text-sm space-y-1">
                              {prediction.recommendations.map((rec, i) => (
                                <li key={i} className="text-orange-700">• {rec}</li>
                              ))}
                            </ul>
                            
                            <div className="space-y-2 mt-4">
                              <Button size="sm" variant="outline" className="w-full">
                                <Target className="h-4 w-4 mr-2" />
                                Apply Strategy
                              </Button>
                              <Button size="sm" variant="outline" className="w-full">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
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

        {/* Weather Impact Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🌤️ Weather Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWeather ? (
                <div className="text-center py-8">
                  <Cloud className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>Analyzing weather impact...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weatherImpact.map((weather, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center">
                              <Cloud className="h-5 w-5 mr-2 text-blue-600" />
                              {weather.condition}
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Temperature:</span>
                                <span className="ml-1 font-medium">{weather.temperature}°C</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Humidity:</span>
                                <span className="ml-1 font-medium">{weather.humidity}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Precipitation:</span>
                                <span className="ml-1 font-medium">{weather.precipitation}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Demand Impact:</span>
                                <span className={`ml-1 font-medium ${weather.demandMultiplier > 1 ? 'text-green-600' : 'text-red-600'}`}>
                                  {weather.demandMultiplier > 1 ? '+' : ''}{((weather.demandMultiplier - 1) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-purple-600">📍 Affected Areas</h4>
                            <div className="flex flex-wrap gap-1">
                              {weather.affectedAreas.map((area, i) => (
                                <Badge key={i} variant="outline">{area}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-green-600">💡 Recommendations</h4>
                            <ul className="text-sm space-y-1">
                              {weather.recommendations.map((rec, i) => (
                                <li key={i} className="text-green-700">• {rec}</li>
                              ))}
                            </ul>
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

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📅 Event-Based Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>Loading event predictions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventPredictions.map((event, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center">
                              <span className="text-2xl mr-2">{getEventTypeIcon(event.eventType)}</span>
                              {event.eventName}
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">Type:</span> {event.eventType}</p>
                              <p><span className="text-muted-foreground">Location:</span> {event.location}</p>
                              <p><span className="text-muted-foreground">Time:</span> {event.startTime} - {event.endTime}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-blue-600">📊 Impact Metrics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Expected Attendees:</span>
                                <span className="font-medium">{event.expectedAttendees.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Demand Increase:</span>
                                <span className="font-medium text-green-600">+{event.demandIncrease}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-purple-600">🎯 Hotspot Areas</h4>
                            <div className="flex flex-wrap gap-1">
                              {event.hotspotAreas.map((area, i) => (
                                <Badge key={i} variant="outline">{area}</Badge>
                              ))}
                            </div>
                            
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-orange-600">⏰ Peak Times</h5>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {event.peakTimes.map((time, i) => (
                                  <Badge key={i} className="bg-orange-100 text-orange-800">{time}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Button size="sm" variant="outline" className="w-full">
                              <Target className="h-4 w-4 mr-2" />
                              Setup Event Strategy
                            </Button>
                            <Button size="sm" variant="outline" className="w-full">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Create Alert
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📈 Prediction Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Accuracy</span>
                    <span className="font-bold text-green-600">87.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weather-Based Predictions</span>
                    <span className="font-bold">92.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Event-Based Predictions</span>
                    <span className="font-bold">85.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Historical Pattern Match</span>
                    <span className="font-bold">89.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Predictions Generated</span>
                    <span className="font-bold">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Revenue Optimization</span>
                    <span className="font-bold text-green-600">+23.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Driver Efficiency</span>
                    <span className="font-bold text-blue-600">+18.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Satisfaction</span>
                    <span className="font-bold text-purple-600">+12.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}