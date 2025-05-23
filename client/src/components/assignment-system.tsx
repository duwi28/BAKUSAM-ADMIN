import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Navigation, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistance, formatCurrency } from "@/lib/utils";

interface PendingOrder {
  id: number;
  customerId: number;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  baseFare: string;
  totalFare: string;
  orderDate: string;
  customer: {
    fullName: string;
    phone: string;
  };
}

interface AvailableDriver {
  id: number;
  fullName: string;
  phone: string;
  vehicleType: string;
  status: string;
  rating: string;
  totalOrders: number;
  distance?: number; // Distance from pickup in km
}

export default function AssignmentSystem() {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<AvailableDriver | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending orders
  const { data: pendingOrders = [] } = useQuery<PendingOrder[]>({
    queryKey: ["/api/orders", "pending"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      const allOrders = await response.json();
      return allOrders.filter((order: any) => order.status === "pending");
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch available drivers
  const { data: availableDrivers = [] } = useQuery<AvailableDriver[]>({
    queryKey: ["/api/drivers", "available"],
    queryFn: async () => {
      const response = await fetch("/api/drivers");
      const allDrivers = await response.json();
      // Simulate distance calculation (in real app, use Maps API)
      return allDrivers
        .filter((driver: any) => driver.status === "active")
        .map((driver: any) => ({
          ...driver,
          distance: Math.round(Math.random() * 15 + 1) // Random distance 1-15km
        }))
        .sort((a: any, b: any) => a.distance - b.distance);
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Auto assign mutation
  const autoAssignMutation = useMutation({
    mutationFn: async (orderId: number) => {
      // Find best driver (closest, highest rating, least busy)
      const bestDriver = availableDrivers[0];
      if (!bestDriver) throw new Error("Tidak ada driver tersedia");
      
      return apiRequest("PATCH", `/api/orders/${orderId}`, {
        driverId: bestDriver.id,
        status: "assigned"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({
        title: "Berhasil",
        description: "Order berhasil ditugaskan secara otomatis",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menugaskan order secara otomatis",
        variant: "destructive",
      });
    },
  });

  // Manual assign mutation
  const manualAssignMutation = useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: number; driverId: number }) => {
      return apiRequest("PATCH", `/api/orders/${orderId}`, {
        driverId: driverId,
        status: "assigned"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setSelectedOrder(null);
      setSelectedDriver(null);
      toast({
        title: "Berhasil",
        description: "Driver berhasil ditugaskan",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menugaskan driver",
        variant: "destructive",
      });
    },
  });

  const handleAutoAssign = (orderId: number) => {
    autoAssignMutation.mutate(orderId);
  };

  const handleManualAssign = () => {
    if (selectedOrder && selectedDriver) {
      manualAssignMutation.mutate({
        orderId: selectedOrder.id,
        driverId: selectedDriver.id
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pengaturan Penugasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-assign"
              checked={autoAssignEnabled}
              onCheckedChange={setAutoAssignEnabled}
            />
            <Label htmlFor="auto-assign">
              Penugasan Otomatis - Driver terdekat akan ditugaskan secara otomatis
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Menunggu ({pendingOrders.length})
              </div>
              <Badge variant="outline">{pendingOrders.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {pendingOrders.map(order => (
              <div 
                key={order.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">Order #{order.id}</h4>
                    <p className="text-sm text-gray-600">{order.customer.fullName}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>Dari: {order.pickupAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Navigation className="w-3 h-3" />
                        <span>Ke: {order.deliveryAddress}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="font-medium">{formatDistance(order.distance)}</span>
                        <span className="font-medium text-green-600">{formatCurrency(order.totalFare)}</span>
                      </div>
                      <div className="flex gap-2">
                        {autoAssignEnabled && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAutoAssign(order.id);
                            }}
                            disabled={autoAssignMutation.isPending}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Auto
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          Manual
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada order yang menunggu penugasan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Drivers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Tersedia ({availableDrivers.length})
              </div>
              {selectedOrder && (
                <Badge variant="secondary">
                  Pilih driver untuk Order #{selectedOrder.id}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {availableDrivers.map(driver => (
              <div 
                key={driver.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDriver?.id === driver.id ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDriver(driver)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{driver.fullName}</h4>
                    <p className="text-sm text-gray-600">{driver.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {driver.vehicleType}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(driver.status)}`}>
                        {driver.status}
                      </Badge>
                      {driver.distance && (
                        <Badge variant="outline" className="text-xs">
                          {driver.distance} km
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Rating: {driver.rating}/5.0</span>
                      <span>Order: {driver.totalOrders}</span>
                    </div>
                  </div>
                  {driver.distance && driver.distance <= 3 && (
                    <div className="flex items-center text-green-600">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {availableDrivers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada driver tersedia saat ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manual Assignment Panel */}
      {selectedOrder && selectedDriver && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Konfirmasi Penugasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Order Terpilih</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>ID:</strong> #{selectedOrder.id}</p>
                  <p><strong>Customer:</strong> {selectedOrder.customer.fullName}</p>
                  <p><strong>Jarak:</strong> {formatDistance(selectedOrder.distance)}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalFare)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Driver Terpilih</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nama:</strong> {selectedDriver.fullName}</p>
                  <p><strong>Kendaraan:</strong> {selectedDriver.vehicleType}</p>
                  <p><strong>Rating:</strong> {selectedDriver.rating}/5.0</p>
                  <p><strong>Jarak:</strong> {selectedDriver.distance} km dari pickup</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={handleManualAssign}
                disabled={manualAssignMutation.isPending}
                className="flex-1"
              >
                {manualAssignMutation.isPending ? "Menugaskan..." : "Tugaskan Driver"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedOrder(null);
                  setSelectedDriver(null);
                }}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}