import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DriverMap from "@/components/driver-map";
import AssignmentSystem from "@/components/assignment-system";
import { MapPin, Navigation, Clock, Users } from "lucide-react";
import { formatDistance, formatCurrency } from "@/lib/utils";

// Simulate driver locations (in real app, this would come from GPS tracking)
const generateDriverLocations = (drivers: any[]) => {
  const jakartaCoordinates = [
    { lat: -6.2088, lng: 106.8456 }, // Central Jakarta
    { lat: -6.1745, lng: 106.8227 }, // North Jakarta
    { lat: -6.2615, lng: 106.7809 }, // West Jakarta
    { lat: -6.2146, lng: 106.8451 }, // South Jakarta
    { lat: -6.1944, lng: 106.8660 }, // East Jakarta
    { lat: -6.1805, lng: 106.8284 }, // Kemayoran
    { lat: -6.2297, lng: 106.8261 }, // Senayan
    { lat: -6.2267, lng: 106.7516 }, // Kebon Jeruk
  ];

  return drivers.map((driver, index) => {
    const location = jakartaCoordinates[index % jakartaCoordinates.length];
    // Add some randomness to location
    const lat = location.lat + (Math.random() - 0.5) * 0.02;
    const lng = location.lng + (Math.random() - 0.5) * 0.02;
    
    return {
      ...driver,
      latitude: lat,
      longitude: lng,
      lastUpdate: new Date().toISOString(),
      currentOrder: driver.status === 'busy' ? {
        id: Math.floor(Math.random() * 1000),
        pickupAddress: "Mall Central Park",
        deliveryAddress: "Apartemen Taman Anggrek",
        status: "dalam_perjalanan"
      } : undefined
    };
  });
};

export default function Tracking() {
  const [activeTab, setActiveTab] = useState("map");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Fetch drivers data
  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch orders data
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Generate driver locations with GPS coordinates
  const driverLocations = generateDriverLocations(drivers);

  // Get active orders (in progress)
  const activeOrders = orders.filter((order: any) => 
    order.status === 'in_progress' || order.status === 'assigned'
  );

  // Get pending orders
  const pendingOrders = orders.filter((order: any) => order.status === 'pending');

  const handleAssignDriver = (driverId: number, orderId: number) => {
    // This will be handled by the AssignmentSystem component
    console.log(`Assigning driver ${driverId} to order ${orderId}`);
  };

  const statsCards = [
    {
      title: "Driver Aktif",
      value: driverLocations.filter(d => d.status === 'active').length,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Order Aktif",
      value: activeOrders.length,
      icon: Navigation,
      color: "text-blue-600"
    },
    {
      title: "Menunggu Penugasan",
      value: pendingOrders.length,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Total Jarak Hari Ini",
      value: "324 km",
      icon: MapPin,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tracking & Assignment</h1>
        <p className="text-muted-foreground">
          Pantau posisi driver real-time dan kelola penugasan order
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map">Peta Real-time</TabsTrigger>
          <TabsTrigger value="assignment">Sistem Penugasan</TabsTrigger>
          <TabsTrigger value="active">Order Aktif</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          <DriverMap 
            drivers={driverLocations}
            onAssignDriver={handleAssignDriver}
            selectedOrder={selectedOrder}
          />
        </TabsContent>

        <TabsContent value="assignment" className="space-y-6">
          <AssignmentSystem />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Order Sedang Berlangsung ({activeOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeOrders.length > 0 ? (
                <div className="space-y-4">
                  {activeOrders.map((order: any) => {
                    const driver = drivers.find((d: any) => d.id === order.driverId);
                    const customer = { fullName: "Customer Name", phone: "08123456789" }; // In real app, join with customers table
                    
                    return (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">Order #{order.id}</h4>
                              <Badge 
                                className={
                                  order.status === 'assigned' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {order.status === 'assigned' ? 'Ditugaskan' : 'Dalam Perjalanan'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Customer</h5>
                                <p className="text-sm">{customer.fullName}</p>
                                <p className="text-xs text-gray-500">{customer.phone}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Driver</h5>
                                <p className="text-sm">{driver?.fullName || 'Belum ditugaskan'}</p>
                                <p className="text-xs text-gray-500">{driver?.phone}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Pickup</h5>
                                <p className="text-sm">{order.pickupAddress}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Delivery</h5>
                                <p className="text-sm">{order.deliveryAddress}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span><strong>Jarak:</strong> {formatDistance(order.distance)}</span>
                              <span><strong>Total:</strong> {formatCurrency(order.totalFare)}</span>
                              <span><strong>Waktu:</strong> {new Date(order.orderDate).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada order yang sedang berlangsung</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}