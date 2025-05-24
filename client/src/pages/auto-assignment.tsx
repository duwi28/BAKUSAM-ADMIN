import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Zap,
  Settings,
  Clock,
  MapPin,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Truck,
  Timer,
  Route,
  Brain,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AutoAssignmentRule {
  id: number;
  name: string;
  isActive: boolean;
  priority: number;
  conditions: {
    vehicleType?: string[];
    driverStatus?: string[];
    maxDistance?: number;
    minRating?: number;
    priorityDriversFirst?: boolean;
  };
  weights: {
    distance: number;
    rating: number;
    completionRate: number;
    responseTime: number;
    workload: number;
  };
}

interface AssignmentLog {
  id: number;
  orderId: number;
  driverId: number;
  driverName: string;
  assignedAt: string;
  algorithm: string;
  score: number;
  distance: number;
  responseTime: number;
  status: 'assigned' | 'accepted' | 'rejected' | 'timeout';
}

export default function AutoAssignment() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'logs' | 'settings'>('dashboard');
  const [isAutoAssignEnabled, setIsAutoAssignEnabled] = useState(true);
  const [newRuleData, setNewRuleData] = useState({
    name: '',
    conditions: {
      vehicleType: [],
      driverStatus: ['online'],
      maxDistance: 5,
      minRating: 4.0,
      priorityDriversFirst: true
    },
    weights: {
      distance: 40,
      rating: 20,
      completionRate: 15,
      responseTime: 15,
      workload: 10
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch assignment rules
  const { data: assignmentRules = [] } = useQuery<AutoAssignmentRule[]>({
    queryKey: ["/api/auto-assignment/rules"],
  });

  // Fetch assignment logs
  const { data: assignmentLogs = [] } = useQuery<AssignmentLog[]>({
    queryKey: ["/api/auto-assignment/logs"],
  });

  // Fetch assignment statistics
  const { data: assignmentStats } = useQuery({
    queryKey: ["/api/auto-assignment/stats"],
  });

  // Auto-assignment toggle mutation
  const toggleAutoAssignMutation = useMutation({
    mutationFn: (enabled: boolean) => apiRequest("POST", "/api/auto-assignment/toggle", { enabled }),
    onSuccess: () => {
      toast({
        title: "✅ Berhasil",
        description: `Auto-assignment ${isAutoAssignEnabled ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
    },
  });

  // Create assignment rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (ruleData: any) => apiRequest("POST", "/api/auto-assignment/rules", ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-assignment/rules"] });
      toast({
        title: "🚀 Berhasil",
        description: "Rule assignment baru berhasil dibuat",
      });
    },
  });

  const handleToggleAutoAssign = () => {
    setIsAutoAssignEnabled(!isAutoAssignEnabled);
    toggleAutoAssignMutation.mutate(!isAutoAssignEnabled);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'timeout': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Ditugaskan';
      case 'accepted': return 'Diterima';
      case 'rejected': return 'Ditolak';
      case 'timeout': return 'Timeout';
      default: return status;
    }
  };

  const mockStats = {
    totalAssignments: 1247,
    successRate: 92.5,
    avgResponseTime: 1.8,
    autoAssignments: 1152,
    manualAssignments: 95,
    efficiency: 95.2
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🤖 Auto-Assignment System</h1>
          <p className="text-muted-foreground">
            Sistem otomatis untuk menugaskan order ke kurir terbaik berdasarkan algoritma cerdas
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-assign-toggle">Auto-Assignment</Label>
            <Switch
              id="auto-assign-toggle"
              checked={isAutoAssignEnabled}
              onCheckedChange={handleToggleAutoAssign}
            />
          </div>
          <Badge className={isAutoAssignEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {isAutoAssignEnabled ? '🟢 Aktif' : '🔴 Nonaktif'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignment</p>
                <p className="text-2xl font-bold text-foreground">{mockStats.totalAssignments}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{mockStats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-yellow-600">{mockStats.avgResponseTime}m</p>
              </div>
              <Timer className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto Assignment</p>
                <p className="text-2xl font-bold text-purple-600">{mockStats.autoAssignments}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Manual Assignment</p>
                <p className="text-2xl font-bold text-orange-600">{mockStats.manualAssignments}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold text-indigo-600">{mockStats.efficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'rules', label: 'Assignment Rules', icon: Settings },
          { id: 'logs', label: 'Assignment Logs', icon: Clock },
          { id: 'settings', label: 'Algoritma', icon: Brain }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1"
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>⚡ Auto-Assignment Engine</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Sistem Berjalan Normal</span>
                </div>
                <p className="text-sm text-green-700">
                  Auto-assignment aktif dan memproses order baru secara real-time
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Algoritma Aktif:</span>
                  <Badge className="bg-blue-100 text-blue-800">Smart Distance + Rating</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Max Assignment Time:</span>
                  <span className="text-sm">30 detik</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fallback ke Manual:</span>
                  <span className="text-sm">Ya, setelah 3 attempts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>📊 Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span>{mockStats.successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${mockStats.successRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Efficiency</span>
                    <span>{mockStats.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${mockStats.efficiency}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Auto vs Manual</span>
                    <span>{Math.round((mockStats.autoAssignments / mockStats.totalAssignments) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(mockStats.autoAssignments / mockStats.totalAssignments) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Route className="h-5 w-5" />
                <span>🎯 Assignment Process Flow</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <span className="text-sm font-medium">Order Baru</span>
                </div>
                
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Brain className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium">Algoritma Analisis</span>
                </div>
                
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Pilih Kurir Terbaik</span>
                </div>
                
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Assignment</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignment Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Create New Assignment Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Rule</Label>
                    <Input 
                      placeholder="Contoh: Priority Motor Jakarta Pusat"
                      value={newRuleData.name}
                      onChange={(e) => setNewRuleData({...newRuleData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Maksimum Jarak (km)</Label>
                    <div className="px-3">
                      <Slider
                        value={[newRuleData.conditions.maxDistance]}
                        onValueChange={(value) => setNewRuleData({
                          ...newRuleData, 
                          conditions: {...newRuleData.conditions, maxDistance: value[0]}
                        })}
                        max={20}
                        min={1}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>1 km</span>
                        <span>{newRuleData.conditions.maxDistance} km</span>
                        <span>20 km</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Rating</Label>
                    <div className="px-3">
                      <Slider
                        value={[newRuleData.conditions.minRating]}
                        onValueChange={(value) => setNewRuleData({
                          ...newRuleData, 
                          conditions: {...newRuleData.conditions, minRating: value[0]}
                        })}
                        max={5}
                        min={1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>1.0</span>
                        <span>{newRuleData.conditions.minRating} ⭐</span>
                        <span>5.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Algorithm Weights (%)</Label>
                    {Object.entries(newRuleData.weights).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span>{value}%</span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={(newValue) => setNewRuleData({
                            ...newRuleData,
                            weights: {...newRuleData.weights, [key]: newValue[0]}
                          })}
                          max={50}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    ))}
                    <div className="text-sm text-muted-foreground">
                      Total: {Object.values(newRuleData.weights).reduce((a, b) => a + b, 0)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => createRuleMutation.mutate(newRuleData)}
                  disabled={createRuleMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Buat Rule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 Active Assignment Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Assignment rules akan ditampilkan di sini
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignment Logs Tab */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>📜 Assignment Activity Logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Assignment logs akan ditampilkan di sini
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>🧠 Algorithm Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Algorithm settings akan tersedia segera
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}