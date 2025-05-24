import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Route,
  Clock,
  TrendingUp,
  MapPin,
  Zap,
  Target,
  Award,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RoutePattern {
  id: number;
  patternName: string;
  fromArea: string;
  toArea: string;
  learnedRoutes: number;
  avgTimeReduction: number;
  confidenceScore: number;
  usageCount: number;
  lastUsed: string;
  driverContributions: {
    driverId: number;
    driverName: string;
    routeCount: number;
    avgRating: number;
    experienceLevel: 'Novice' | 'Intermediate' | 'Expert' | 'Master';
  }[];
  routeVariations: {
    variationId: number;
    description: string;
    timeSpent: number;
    fuelEfficiency: number;
    trafficAvoidance: number;
    successRate: number;
  }[];
}

interface DriverExperience {
  driverId: number;
  driverName: string;
  phone: string;
  experienceLevel: 'Novice' | 'Intermediate' | 'Expert' | 'Master';
  totalRoutes: number;
  routesShared: number;
  averageTimeReduction: number;
  knowledgeScore: number;
  specialtyAreas: string[];
  contributions: {
    routePatternsCreated: number;
    improvementsSuggested: number;
    trafficReportsSubmitted: number;
    fuelSavingsGenerated: number;
  };
  achievements: string[];
  lastActive: string;
}

interface RouteOptimization {
  routeId: number;
  fromLocation: string;
  toLocation: string;
  originalTime: number;
  optimizedTime: number;
  timeSaved: number;
  algorithm: 'AI-Learned' | 'Driver-Experience' | 'Hybrid';
  confidenceLevel: number;
  factors: {
    trafficPatterns: number;
    driverExperience: number;
    roadConditions: number;
    weatherImpact: number;
  };
  recommendations: string[];
}

export default function DynamicRouteLearning() {
  const [activeTab, setActiveTab] = useState('patterns');
  const [filterExperience, setFilterExperience] = useState('all');
  const [filterArea, setFilterArea] = useState('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch route patterns
  const { data: routePatterns = [], isLoading: loadingPatterns } = useQuery<RoutePattern[]>({
    queryKey: ["/api/route-learning/patterns"],
  });

  // Fetch driver experiences
  const { data: driverExperiences = [], isLoading: loadingExperiences } = useQuery<DriverExperience[]>({
    queryKey: ["/api/route-learning/driver-experiences"],
  });

  // Fetch route optimizations
  const { data: optimizations = [], isLoading: loadingOptimizations } = useQuery<RouteOptimization[]>({
    queryKey: ["/api/route-learning/optimizations"],
  });

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'Master': return 'bg-purple-100 text-purple-800';
      case 'Expert': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-green-100 text-green-800';
      case 'Novice': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-blue-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredExperiences = driverExperiences.filter(exp => {
    const experienceMatch = filterExperience === 'all' || exp.experienceLevel === filterExperience;
    const areaMatch = filterArea === 'all' || exp.specialtyAreas.some(area => area.includes(filterArea));
    return experienceMatch && areaMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🧠 Dynamic Route Learning</h1>
          <p className="text-muted-foreground">
            AI belajar dari pengalaman driver untuk optimasi rute yang semakin pintar
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            AI Learning Active
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <Route className="h-3 w-3 mr-1" />
            {routePatterns.length} Patterns Learned
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Routes Learned</p>
                <div className="text-2xl font-bold">
                  {routePatterns.reduce((sum, p) => sum + p.learnedRoutes, 0)}
                </div>
              </div>
              <Route className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From driver experience
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Time Saved</p>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(routePatterns.reduce((sum, p) => sum + p.avgTimeReduction, 0) / routePatterns.length || 0)} min
                </div>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per optimized route
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expert Drivers</p>
                <div className="text-2xl font-bold text-purple-600">
                  {driverExperiences.filter(d => d.experienceLevel === 'Expert' || d.experienceLevel === 'Master').length}
                </div>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Contributing knowledge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Learning Accuracy</p>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(routePatterns.reduce((sum, p) => sum + p.confidenceScore, 0) / routePatterns.length || 0)}%
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              AI confidence level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">🗺️ Route Patterns</TabsTrigger>
          <TabsTrigger value="drivers">👨‍💼 Driver Experience</TabsTrigger>
          <TabsTrigger value="optimizations">⚡ Live Optimizations</TabsTrigger>
          <TabsTrigger value="analytics">📊 Learning Analytics</TabsTrigger>
        </TabsList>

        {/* Route Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🗺️ Learned Route Patterns ({routePatterns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPatterns ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>AI sedang memproses pola rute yang dipelajari...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {routePatterns.map((pattern) => (
                    <Card key={pattern.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Pattern Info */}
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center">
                              <Route className="h-5 w-5 mr-2 text-blue-600" />
                              {pattern.patternName}
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">From:</span> {pattern.fromArea}</p>
                              <p><span className="text-muted-foreground">To:</span> {pattern.toArea}</p>
                              <p><span className="text-muted-foreground">Routes Learned:</span> {pattern.learnedRoutes}</p>
                              <p><span className="text-muted-foreground">Usage:</span> {pattern.usageCount} times</p>
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-green-600">📊 Performance</h4>
                            <div className="space-y-2">
                              <div className="p-3 bg-green-50 rounded-lg text-center">
                                <div className="text-xl font-bold text-green-700">{pattern.avgTimeReduction} min</div>
                                <p className="text-sm text-green-600">Avg Time Saved</p>
                              </div>
                              
                              <div className="text-center">
                                <span className={`text-sm font-medium ${getConfidenceColor(pattern.confidenceScore)}`}>
                                  {pattern.confidenceScore}% Confidence
                                </span>
                              </div>
                              
                              <Progress value={pattern.confidenceScore} className="h-2" />
                            </div>
                          </div>

                          {/* Driver Contributors */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-purple-600">👥 Top Contributors</h4>
                            <div className="space-y-2">
                              {pattern.driverContributions.slice(0, 3).map((contributor, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">{contributor.driverName}</span>
                                      <Badge className={`ml-1 ${getExperienceColor(contributor.experienceLevel)}`}>
                                        {contributor.experienceLevel}
                                      </Badge>
                                    </div>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{contributor.routeCount} routes</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Route Variations */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-orange-600">🔄 Variations</h4>
                            <div className="space-y-2 text-sm">
                              {pattern.routeVariations.slice(0, 2).map((variation, index) => (
                                <div key={index} className="p-2 bg-orange-50 rounded">
                                  <p className="font-medium">{variation.description}</p>
                                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                    <span>Time: {variation.timeSpent}min</span>
                                    <span>Success: {variation.successRate}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="space-y-2">
                              <Button size="sm" variant="outline" className="w-full">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View All Variations
                              </Button>
                              <Button size="sm" variant="outline" className="w-full">
                                <Settings className="h-4 w-4 mr-2" />
                                Optimize Further
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

        {/* Driver Experience Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>👨‍💼 Driver Experience Levels ({filteredExperiences.length})</CardTitle>
                <div className="flex space-x-3">
                  <Select value={filterExperience} onValueChange={setFilterExperience}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Novice">Novice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingExperiences ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 animate-pulse text-purple-600 mx-auto mb-4" />
                  <p>Loading driver experiences...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExperiences.map((driver) => (
                    <Card key={driver.driverId}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Driver Info */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold">{driver.driverName}</h3>
                              <p className="text-sm text-muted-foreground">{driver.phone}</p>
                              <Badge className={getExperienceColor(driver.experienceLevel)}>
                                {driver.experienceLevel}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">Knowledge Score:</span> {driver.knowledgeScore}/100</p>
                              <p><span className="text-muted-foreground">Last Active:</span> {driver.lastActive}</p>
                            </div>
                          </div>

                          {/* Route Statistics */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-blue-600">📊 Route Stats</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Total Routes:</span>
                                <span className="font-medium">{driver.totalRoutes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shared Routes:</span>
                                <span className="font-medium text-green-600">{driver.routesShared}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Time Reduction:</span>
                                <span className="font-medium text-blue-600">{driver.averageTimeReduction} min</span>
                              </div>
                            </div>
                          </div>

                          {/* Contributions */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-green-600">🎯 Contributions</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Patterns Created:</span>
                                <span className="font-medium">{driver.contributions.routePatternsCreated}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Improvements:</span>
                                <span className="font-medium">{driver.contributions.improvementsSuggested}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Traffic Reports:</span>
                                <span className="font-medium">{driver.contributions.trafficReportsSubmitted}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fuel Saved:</span>
                                <span className="font-medium text-green-600">{driver.contributions.fuelSavingsGenerated}L</span>
                              </div>
                            </div>
                          </div>

                          {/* Specialty & Achievements */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-purple-600 mb-2">🏆 Specialty Areas</h4>
                              <div className="flex flex-wrap gap-1">
                                {driver.specialtyAreas.map((area, index) => (
                                  <Badge key={index} variant="outline">{area}</Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-orange-600 mb-2">🏅 Achievements</h4>
                              <div className="space-y-1">
                                {driver.achievements.slice(0, 2).map((achievement, index) => (
                                  <p key={index} className="text-sm text-orange-700">• {achievement}</p>
                                ))}
                              </div>
                            </div>
                            
                            <Button size="sm" variant="outline" className="w-full">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Full Profile
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

        {/* Live Optimizations Tab */}
        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>⚡ Live Route Optimizations ({optimizations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOptimizations ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 animate-pulse text-orange-600 mx-auto mb-4" />
                  <p>Loading live optimizations...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizations.map((optimization) => (
                    <Card key={optimization.routeId}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center">
                              <MapPin className="h-5 w-5 mr-2 text-green-600" />
                              Route #{optimization.routeId}
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">From:</span> {optimization.fromLocation}</p>
                              <p><span className="text-muted-foreground">To:</span> {optimization.toLocation}</p>
                              <Badge className={optimization.algorithm === 'AI-Learned' ? 'bg-blue-100 text-blue-800' : 
                                              optimization.algorithm === 'Driver-Experience' ? 'bg-green-100 text-green-800' : 
                                              'bg-purple-100 text-purple-800'}>
                                {optimization.algorithm}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-green-600">⏱️ Time Comparison</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Original:</span>
                                <span className="font-medium">{optimization.originalTime} min</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Optimized:</span>
                                <span className="font-medium text-green-600">{optimization.optimizedTime} min</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Time Saved:</span>
                                <span className="font-bold text-green-600">{optimization.timeSaved} min</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-blue-600">🎯 Optimization Factors</h4>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Traffic Patterns</span>
                                  <span>{optimization.factors.trafficPatterns}%</span>
                                </div>
                                <Progress value={optimization.factors.trafficPatterns} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Driver Experience</span>
                                  <span>{optimization.factors.driverExperience}%</span>
                                </div>
                                <Progress value={optimization.factors.driverExperience} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Road Conditions</span>
                                  <span>{optimization.factors.roadConditions}%</span>
                                </div>
                                <Progress value={optimization.factors.roadConditions} className="h-2" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-orange-600">💡 Recommendations</h4>
                            <ul className="text-sm space-y-1">
                              {optimization.recommendations.map((rec, index) => (
                                <li key={index} className="text-orange-700">• {rec}</li>
                              ))}
                            </ul>
                            
                            <div className="space-y-2 mt-4">
                              <Button size="sm" className="w-full">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Apply Optimization
                              </Button>
                              <div className="text-center">
                                <span className={`text-sm font-medium ${getConfidenceColor(optimization.confidenceLevel)}`}>
                                  {optimization.confidenceLevel}% Confidence
                                </span>
                              </div>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📈 Learning Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Routes Analyzed</span>
                    <span className="font-bold">12,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Patterns Identified</span>
                    <span className="font-bold text-blue-600">{routePatterns.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Time Savings</span>
                    <span className="font-bold text-green-600">
                      {Math.round(routePatterns.reduce((sum, p) => sum + p.avgTimeReduction, 0) / routePatterns.length || 0)} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Learning Accuracy</span>
                    <span className="font-bold text-purple-600">
                      {Math.round(routePatterns.reduce((sum, p) => sum + p.confidenceScore, 0) / routePatterns.length || 0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🏆 Driver Experience Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Master', 'Expert', 'Intermediate', 'Novice'].map(level => {
                    const count = driverExperiences.filter(d => d.experienceLevel === level).length;
                    const percentage = (count / driverExperiences.length) * 100 || 0;
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{level}</span>
                          <span className="text-sm text-muted-foreground">{count} drivers ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}