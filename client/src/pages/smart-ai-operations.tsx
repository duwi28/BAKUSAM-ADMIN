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
  Route,
  Car,
  CreditCard,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Zap,
  Settings,
  Activity,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Award,
  Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Driver {
  id: number;
  fullName: string;
  phone: string;
  vehicleType: string;
  rating: number;
  creditScore: number;
  status: string;
  totalTrips: number;
  earnings: number;
  joinDate: string;
}

interface Vehicle {
  id: number;
  driverId: number;
  vehicleType: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  condition: string;
}

export default function SmartAIOperations() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drivers } = useQuery({
    queryKey: ['/api/drivers'],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/recommendations/drivers'],
  });

  const { data: routeRecommendations } = useQuery({
    queryKey: ['/api/recommendations/routes'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      maintenance: "bg-orange-100 text-orange-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            Smart AI Operations
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboard terpadu untuk AI Credit Scoring, Smart Predictions, Route Learning, dan Vehicle Management
          </p>
        </div>
        <div className="flex space-x-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Vehicle
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">AI Score Avg</p>
                <p className="text-3xl font-bold text-purple-900">87.5</p>
                <p className="text-sm text-purple-700 mt-1">Credit Performance</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Demand Accuracy</p>
                <p className="text-3xl font-bold text-blue-900">94.2%</p>
                <p className="text-sm text-blue-700 mt-1">Prediction Rate</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Route Efficiency</p>
                <p className="text-3xl font-bold text-green-900">89%</p>
                <p className="text-sm text-green-700 mt-1">Smart Learning</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Route className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Active Vehicles</p>
                <p className="text-3xl font-bold text-orange-900">{vehicles?.length || 0}</p>
                <p className="text-sm text-orange-700 mt-1">Fleet Management</p>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600 mb-1">AI Recommendations</p>
                <p className="text-3xl font-bold text-indigo-900">{recommendations?.length || 0}</p>
                <p className="text-sm text-indigo-700 mt-1">Active Insights</p>
              </div>
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">AI Overview</TabsTrigger>
          <TabsTrigger value="credit-scoring">Credit Scoring</TabsTrigger>
          <TabsTrigger value="predictions">Smart Predictions</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Fleet</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
        </TabsList>

        {/* AI Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Performance Dashboard */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  AI Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Credit Scoring Engine</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                      <span className="text-sm font-bold">87%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Demand Prediction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                      <span className="text-sm font-bold">94%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <div className="flex items-center space-x-3">
                      <Route className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Route Learning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                      <span className="text-sm font-bold">89%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Insights */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                  Real-time AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">High Demand Detected</span>
                    </div>
                    <p className="text-sm text-green-700">Kemang area showing 85% increase in ride requests</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Route Optimization</span>
                    </div>
                    <p className="text-sm text-yellow-700">5 drivers need route efficiency improvement</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Credit Score Alert</span>
                    </div>
                    <p className="text-sm text-blue-700">3 drivers eligible for credit limit increase</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                AI Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Run Credit Analysis</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Generate Predictions</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Route className="h-6 w-6 text-green-600" />
                  <span className="text-sm">Optimize Routes</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Car className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Fleet Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Scoring Tab */}
        <TabsContent value="credit-scoring" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg font-bold">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Driver Credit Scoring
              </CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Analyze All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {drivers?.slice(0, 8).map((driver: any) => (
                  <div key={driver.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{driver.fullName}</h3>
                          <p className="text-gray-600">{driver.phone} • {driver.vehicleType}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={getCreditScoreColor(driver.creditScore || 75)}>
                              Score: {driver.creditScore || 75}
                            </Badge>
                            <span className="text-sm text-gray-600">{driver.totalTrips || 150} trips</span>
                            <span className="text-sm text-gray-600">{formatCurrency(driver.earnings || 2500000)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold">{driver.rating || 4.8}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Credit Limit: Rp 500K</p>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Demand Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-800">High</div>
                      <div className="text-sm text-blue-600">Next 2 Hours</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-800">Medium</div>
                      <div className="text-sm text-green-600">2-6 Hours</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-800">Low</div>
                      <div className="text-sm text-yellow-600">6+ Hours</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Kemang Area</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-bold">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Senayan Area</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm font-bold">65%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Gading Area</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-bold">45%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Route className="h-5 w-5 mr-2 text-green-600" />
                  Route Learning Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeRecommendations?.slice(0, 5).map((route: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{route.routeName}</p>
                          <p className="text-sm text-gray-600">Efficiency: {route.efficiency}%</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {route.improvement}% better
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg font-bold">
                <Car className="h-5 w-5 mr-2 text-orange-600" />
                Vehicle Fleet Management
              </CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {vehicles?.map((vehicle: any) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{vehicle.plateNumber}</h3>
                          <p className="text-gray-600">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={getStatusBadge(vehicle.status)}>
                              {vehicle.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{vehicle.vehicleType}</span>
                            <span className="text-sm text-gray-600">Condition: {vehicle.condition}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Driver: {vehicle.driverName || 'Unassigned'}</p>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Lightbulb className="h-5 w-5 mr-2 text-indigo-600" />
                  Driver Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations?.slice(0, 5).map((rec: any, index: number) => (
                    <div key={index} className="p-3 rounded-lg bg-indigo-50 border-l-4 border-indigo-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-indigo-800">{rec.driverName}</span>
                        <Badge className="bg-indigo-100 text-indigo-800">
                          Score: {rec.recommendationScore}
                        </Badge>
                      </div>
                      <p className="text-sm text-indigo-700">{rec.reason}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs text-indigo-600">Est. {rec.estimatedTime} mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-800">98.5%</div>
                      <div className="text-sm text-yellow-600">AI Accuracy</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-800">25%</div>
                      <div className="text-sm text-green-600">Efficiency Gain</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Recent AI Actions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Optimized 15 driver routes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Updated 8 credit scores</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Generated demand predictions</span>
                      </div>
                    </div>
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