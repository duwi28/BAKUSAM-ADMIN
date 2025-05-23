import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Clock, TrendingUp, Award, Users } from "lucide-react";

interface DriverRecommendation {
  driver: {
    id: number;
    fullName: string;
    vehicleType: string;
    priorityLevel: string;
    rating: string;
  };
  recommendationScore: number;
  metrics: {
    completionRate: number;
    averageRating: number;
    responseTime: number;
    onTimeDeliveryRate: number;
    totalOrdersCompleted: number;
    distanceFromPickup: number;
    currentWorkload: number;
  };
  reasons: string[];
  estimatedDeliveryTime: number;
  confidenceLevel: 'Tinggi' | 'Sedang' | 'Rendah';
}

interface DriverRanking {
  driver: {
    id: number;
    fullName: string;
    vehicleType: string;
    priorityLevel: string;
    rating: string;
  };
  metrics: any;
  ranking: {
    position: number;
    totalDrivers: number;
    percentile: number;
  };
  recommendationScore: number;
  topInsights: string[];
}

export default function DriverRecommendations() {
  const [newOrderForm, setNewOrderForm] = useState({
    pickupAddress: "",
    deliveryAddress: "",
    distance: ""
  });
  const [recommendations, setRecommendations] = useState<DriverRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Query untuk mendapatkan ranking driver
  const { data: rankings, isLoading: rankingsLoading } = useQuery({
    queryKey: ['/api/drivers/performance-ranking'],
    queryFn: async () => {
      const response = await fetch('/api/drivers/performance-ranking?limit=10');
      if (!response.ok) throw new Error('Failed to fetch rankings');
      return response.json();
    }
  });

  const handleGetRecommendations = async () => {
    if (!newOrderForm.pickupAddress || !newOrderForm.deliveryAddress || !newOrderForm.distance) {
      alert('Mohon lengkapi semua field');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/driver-recommendations/new-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupAddress: newOrderForm.pickupAddress,
          deliveryAddress: newOrderForm.deliveryAddress,
          distance: parseFloat(newOrderForm.distance),
          maxRecommendations: 5
        }),
      });

      if (!response.ok) throw new Error('Failed to get recommendations');
      
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Gagal mendapatkan rekomendasi driver');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'Tinggi': return 'bg-green-100 text-green-800';
      case 'Sedang': return 'bg-yellow-100 text-yellow-800';
      case 'Rendah': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (level: string) => {
    return level === 'priority' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Rekomendasi Driver</h1>
          <p className="text-muted-foreground">
            Analisis performa historis untuk rekomendasi driver optimal
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">AI-Powered Recommendations</span>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">Rekomendasi Order Baru</TabsTrigger>
          <TabsTrigger value="rankings">Ranking Performa Driver</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Form Input Order Baru */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Detail Order Baru
              </CardTitle>
              <CardDescription>
                Masukkan detail order untuk mendapatkan rekomendasi driver terbaik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup">Alamat Pickup</Label>
                  <Input
                    id="pickup"
                    placeholder="Contoh: Mall Taman Anggrek"
                    value={newOrderForm.pickupAddress}
                    onChange={(e) => setNewOrderForm({
                      ...newOrderForm,
                      pickupAddress: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery">Alamat Delivery</Label>
                  <Input
                    id="delivery"
                    placeholder="Contoh: Apartemen Sudirman"
                    value={newOrderForm.deliveryAddress}
                    onChange={(e) => setNewOrderForm({
                      ...newOrderForm,
                      deliveryAddress: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Jarak (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="5.2"
                    value={newOrderForm.distance}
                    onChange={(e) => setNewOrderForm({
                      ...newOrderForm,
                      distance: e.target.value
                    })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleGetRecommendations}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Menganalisis...' : 'Dapatkan Rekomendasi Driver'}
              </Button>
            </CardContent>
          </Card>

          {/* Hasil Rekomendasi */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Rekomendasi Driver Terbaik</h2>
              <div className="grid gap-4">
                {recommendations.map((rec, index) => (
                  <Card key={rec.driver.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold">
                            #{index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{rec.driver.fullName}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge variant="outline">{rec.driver.vehicleType}</Badge>
                              <Badge className={getPriorityBadgeColor(rec.driver.priorityLevel)}>
                                {rec.driver.priorityLevel === 'priority' ? 'Priority' : 'Normal'}
                              </Badge>
                              <Badge className={getConfidenceBadgeColor(rec.confidenceLevel)}>
                                {rec.confidenceLevel}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {rec.recommendationScore.toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">Skor Rekomendasi</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-700">
                            {rec.metrics.completionRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-green-600">Completion Rate</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center justify-center text-lg font-semibold text-yellow-700">
                            <Star className="h-4 w-4 mr-1" />
                            {rec.metrics.averageRating.toFixed(1)}
                          </div>
                          <div className="text-sm text-yellow-600">Rating Rata-rata</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center text-lg font-semibold text-blue-700">
                            <Clock className="h-4 w-4 mr-1" />
                            {rec.metrics.responseTime}m
                          </div>
                          <div className="text-sm text-blue-600">Response Time</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-semibold text-purple-700">
                            {rec.estimatedDeliveryTime}m
                          </div>
                          <div className="text-sm text-purple-600">Estimasi Delivery</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Alasan Rekomendasi:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {rec.reasons.map((reason, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{reason}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Jarak: {rec.metrics.distanceFromPickup.toFixed(1)} km • 
                          Workload: {rec.metrics.currentWorkload} order aktif
                        </div>
                        <Button size="sm">Assign Driver</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rankings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Drivers
              </CardTitle>
              <CardDescription>
                Ranking driver berdasarkan performa historis dan metrik kualitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rankingsLoading ? (
                <div className="text-center py-8">Loading rankings...</div>
              ) : rankings?.rankings ? (
                <div className="space-y-4">
                  {rankings.rankings.map((ranking: DriverRanking, index: number) => (
                    <Card key={ranking.driver.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                              #{ranking.ranking.position}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{ranking.driver.fullName}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{ranking.driver.vehicleType}</Badge>
                                <Badge className={getPriorityBadgeColor(ranking.driver.priorityLevel)}>
                                  {ranking.driver.priorityLevel === 'priority' ? 'Priority' : 'Normal'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Top {ranking.ranking.percentile}% drivers
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-yellow-600">
                              {ranking.recommendationScore.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">Performance Score</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold">{ranking.metrics.completionRate.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">Completion</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold">{ranking.metrics.averageRating.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Rating</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold">{ranking.metrics.totalOrdersCompleted}</div>
                            <div className="text-xs text-muted-foreground">Orders</div>
                          </div>
                        </div>
                        
                        {ranking.topInsights.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-1">Highlights:</div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {ranking.topInsights.map((insight: string, idx: number) => (
                                <li key={idx}>• {insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada data ranking tersedia
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}