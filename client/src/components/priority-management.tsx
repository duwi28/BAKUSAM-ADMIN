import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Target,
  Megaphone,
  Award,
  Activity,
  ArrowUp,
  ArrowDown,
  Timer,
  MapPin
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PriorityStats {
  total: number;
  priority: number;
  normal: number;
  advertising: number;
  highRating: number;
  available: number;
}

interface Driver {
  id: number;
  fullName: string;
  phone: string;
  rating: string;
  totalOrders: number;
  vehicleType: string;
  status: string;
  priorityLevel: string;
  isAdvertising: boolean;
  completionRate: number;
  responseTime: number;
  consecutiveRejects: number;
  commission: number;
  priorityScore: number;
  lastOrderDate?: string;
  priorityExpiryDate?: string;
}

export default function PriorityManagement() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
  });

  const { data: priorityStats } = useQuery<PriorityStats>({
    queryKey: ["/api/drivers/priority/stats"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ driverId, reason, expiryDate }: { driverId: number; reason: string; expiryDate?: string }) => {
      return apiRequest(`/api/drivers/${driverId}/priority/upgrade`, {
        method: "POST",
        body: JSON.stringify({ reason, expiryDate }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/priority/stats"] });
      toast({
        title: "Berhasil!",
        description: "Driver berhasil di-upgrade ke prioritas",
      });
    },
  });

  const downgradeMutation = useMutation({
    mutationFn: async ({ driverId, reason }: { driverId: number; reason: string }) => {
      return apiRequest(`/api/drivers/${driverId}/priority/downgrade`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/priority/stats"] });
      toast({
        title: "Berhasil!",
        description: "Driver berhasil diturunkan ke level normal",
      });
    },
  });

  const advertisingMutation = useMutation({
    mutationFn: async ({ driverId, isAdvertising }: { driverId: number; isAdvertising: boolean }) => {
      return apiRequest(`/api/drivers/${driverId}/advertising/toggle`, {
        method: "POST",
        body: JSON.stringify({ isAdvertising }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/priority/stats"] });
      toast({
        title: "Berhasil!",
        description: "Status iklan driver berhasil diubah",
      });
    },
  });

  const handlePriorityUpgrade = (driver: Driver) => {
    upgradeMutation.mutate({
      driverId: driver.id,
      reason: "manual_upgrade",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });
  };

  const handlePriorityDowngrade = (driver: Driver) => {
    downgradeMutation.mutate({
      driverId: driver.id,
      reason: "manual_downgrade",
    });
  };

  const handleAdvertisingToggle = (driver: Driver) => {
    advertisingMutation.mutate({
      driverId: driver.id,
      isAdvertising: !driver.isAdvertising,
    });
  };

  const getPriorityBadge = (driver: Driver) => {
    if (driver.priorityLevel === "priority") {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Priority
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Users className="w-3 h-3 mr-1" />
        Normal
      </Badge>
    );
  };

  const getPerformanceScore = (driver: Driver) => {
    const rating = parseFloat(driver.rating || "0");
    const completionRate = driver.completionRate || 100;
    const totalOrders = driver.totalOrders || 0;
    
    let score = 0;
    score += rating * 15; // 0-75 points
    score += (completionRate / 100) * 15; // 0-15 points
    score += Math.min(totalOrders / 10, 10); // 0-10 points max
    
    return Math.min(100, Math.round(score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Priority Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Driver Prioritas</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{priorityStats?.priority || 0}</div>
            <p className="text-xs text-yellow-700">
              {priorityStats?.total ? Math.round((priorityStats.priority / priorityStats.total) * 100) : 0}% dari total driver
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Driver Beriklan</CardTitle>
            <Megaphone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{priorityStats?.advertising || 0}</div>
            <p className="text-xs text-green-700">Driver yang memasang iklan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Rating Tinggi</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{priorityStats?.highRating || 0}</div>
            <p className="text-xs text-blue-700">Driver rating ≥ 4.8</p>
          </CardContent>
        </Card>
      </div>

      {/* Driver Management Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Semua Driver</TabsTrigger>
          <TabsTrigger value="priority">Driver Prioritas</TabsTrigger>
          <TabsTrigger value="advertising">Beriklan</TabsTrigger>
          <TabsTrigger value="candidates">Kandidat Prioritas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {Array.isArray(drivers) && drivers.map((driver: Driver) => (
              <Card key={driver.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{driver.fullName}</h3>
                        {getPriorityBadge(driver)}
                        {driver.isAdvertising && (
                          <Badge className="bg-green-100 text-green-800">
                            <Megaphone className="w-3 h-3 mr-1" />
                            Beriklan
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {driver.rating || "0"}
                        </span>
                        <span className="flex items-center">
                          <Activity className="w-3 h-3 mr-1 text-blue-500" />
                          {driver.totalOrders || 0} trip
                        </span>
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1 text-purple-500" />
                          Score: <span className={`font-medium ml-1 ${getScoreColor(getPerformanceScore(driver))}`}>
                            {getPerformanceScore(driver)}
                          </span>
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                          {driver.vehicleType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Advertising Toggle */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Iklan</span>
                      <Switch
                        checked={driver.isAdvertising}
                        onCheckedChange={() => handleAdvertisingToggle(driver)}
                        disabled={advertisingMutation.isPending}
                      />
                    </div>

                    {/* Priority Actions */}
                    {driver.priorityLevel === "normal" ? (
                      <Button
                        size="sm"
                        onClick={() => handlePriorityUpgrade(driver)}
                        disabled={upgradeMutation.isPending}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                      >
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Upgrade Prioritas
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePriorityDowngrade(driver)}
                        disabled={downgradeMutation.isPending}
                      >
                        <ArrowDown className="w-3 h-3 mr-1" />
                        Turunkan
                      </Button>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Tingkat Penyelesaian</div>
                    <Progress value={driver.completionRate || 100} className="h-2" />
                    <div className="text-xs font-medium">{driver.completionRate || 100}%</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Waktu Respons</div>
                    <div className="flex items-center text-sm">
                      <Timer className="w-3 h-3 mr-1" />
                      {driver.responseTime || 300}s rata-rata
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Komisi</div>
                    <div className="text-sm font-medium text-green-600">
                      {driver.commission || 70}%
                    </div>
                  </div>
                </div>

                {driver.priorityExpiryDate && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    <Award className="w-3 h-3 inline mr-1" />
                    Prioritas berlaku hingga: {formatDate(driver.priorityExpiryDate)}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="priority">
          <div className="grid gap-4">
            {Array.isArray(drivers) && drivers
              .filter((d: Driver) => d.priorityLevel === "priority")
              .map((driver: Driver) => (
                <Card key={driver.id} className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Crown className="w-8 h-8 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">{driver.fullName}</h3>
                        <div className="text-sm text-yellow-700">
                          Score: {getPerformanceScore(driver)} | Rating: {driver.rating} | {driver.totalOrders} trip
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePriorityDowngrade(driver)}
                      disabled={downgradeMutation.isPending}
                    >
                      <ArrowDown className="w-3 h-3 mr-1" />
                      Turunkan
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="advertising">
          <div className="grid gap-4">
            {Array.isArray(drivers) && drivers
              .filter((d: Driver) => d.isAdvertising)
              .map((driver: Driver) => (
                <Card key={driver.id} className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Megaphone className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">{driver.fullName}</h3>
                        <div className="text-sm text-green-700">
                          Prioritas iklan aktif | Rating: {driver.rating}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={driver.isAdvertising}
                      onCheckedChange={() => handleAdvertisingToggle(driver)}
                      disabled={advertisingMutation.isPending}
                    />
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="candidates">
          <div className="grid gap-4">
            {Array.isArray(drivers) && drivers
              .filter((d: Driver) => {
                const rating = parseFloat(d.rating || "0");
                const totalOrders = d.totalOrders || 0;
                const completionRate = d.completionRate || 100;
                return d.priorityLevel === "normal" && 
                       ((rating >= 4.8 && totalOrders >= 50) || 
                        (rating >= 4.9 && totalOrders >= 30) ||
                        (completionRate >= 98 && totalOrders >= 100));
              })
              .map((driver: Driver) => (
                <Card key={driver.id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-blue-900">{driver.fullName}</h3>
                        <div className="text-sm text-blue-700">
                          Kandidat prioritas | Score: {getPerformanceScore(driver)} | Rating: {driver.rating}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {parseFloat(driver.rating || "0") >= 4.9 ? "Rating Excellent" : 
                           (driver.completionRate || 100) >= 98 ? "Completion Rate Tinggi" : 
                           "Performa Baik"}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePriorityUpgrade(driver)}
                      disabled={upgradeMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <ArrowUp className="w-3 h-3 mr-1" />
                      Promosikan
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}