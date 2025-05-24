import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Navigation,
  MapPin,
  Clock,
  Route,
  Phone,
  MessageCircle,
  Camera,
  Wifi,
  WifiOff,
  ExternalLink,
  Car,
  Bike,
  Truck
} from "lucide-react";

interface CurrentOrder {
  id: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  customerName: string;
  customerPhone: string;
  estimatedDistance: number;
  estimatedTime: number;
  status: 'pickup' | 'delivery';
  orderValue: number;
}

export default function DriverNavigation() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({
    lat: -6.2088,
    lng: 106.8456
  });

  // Fetch current active order for driver
  const { data: currentOrder } = useQuery<CurrentOrder>({
    queryKey: ["/api/driver/current-order"],
    refetchInterval: 5000,
  });

  // Simulate offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openGoogleMapsNavigation = (destination: string, lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const openWhatsAppChat = (phoneNumber: string, message: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motor': return <Bike className="h-5 w-5" />;
      case 'mobil': return <Car className="h-5 w-5" />;
      case 'pickup': return <Truck className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  if (!currentOrder) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Tidak Ada Order Aktif</h2>
          <p className="text-muted-foreground">
            Anda belum memiliki order yang sedang aktif. Tunggu order baru dari sistem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🧭 Navigasi Driver</h1>
          <p className="text-muted-foreground">
            Panduan rute optimal dengan Google Maps terintegrasi
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Badge className="bg-green-100 text-green-800">
              <Wifi className="h-4 w-4 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <WifiOff className="h-4 w-4 mr-1" />
              Offline Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Current Order Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>📦 Order Aktif #{currentOrder.id}</span>
            <Badge className={currentOrder.status === 'pickup' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
              {currentOrder.status === 'pickup' ? '📍 Menuju Pickup' : '🎯 Menuju Delivery'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Lokasi Pickup</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">{currentOrder.pickupAddress}</p>
                <Button 
                  size="sm" 
                  onClick={() => openGoogleMapsNavigation(
                    currentOrder.pickupAddress, 
                    currentOrder.pickupLat, 
                    currentOrder.pickupLng
                  )}
                  className="bg-yellow-600 hover:bg-yellow-700 w-full"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigasi ke Pickup
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Lokasi Delivery</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">{currentOrder.deliveryAddress}</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openGoogleMapsNavigation(
                    currentOrder.deliveryAddress, 
                    currentOrder.deliveryLat, 
                    currentOrder.deliveryLng
                  )}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Preview Rute Delivery
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Customer Contact */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Customer: {currentOrder.customerName}</span>
                </div>
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`tel:${currentOrder.customerPhone}`, '_self')}
                    className="border-green-200 text-green-700 hover:bg-green-50 w-full"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Telepon Customer
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => openWhatsAppChat(
                      currentOrder.customerPhone,
                      `Halo ${currentOrder.customerName}, saya driver Bakusam Express untuk order #${currentOrder.id}. Saya sedang dalam perjalanan ke lokasi Anda.`
                    )}
                    className="bg-green-600 hover:bg-green-700 w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat WhatsApp
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Estimasi Jarak:</span>
                    <span className="text-sm">{currentOrder.estimatedDistance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Estimasi Waktu:</span>
                    <span className="text-sm">{currentOrder.estimatedTime} menit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Nilai Order:</span>
                    <span className="text-sm font-bold text-green-600">Rp {currentOrder.orderValue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">📷 Upload Bukti</h3>
              <p className="text-sm text-muted-foreground">Foto barang saat pickup/delivery</p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Ambil Foto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">📍 Update Lokasi</h3>
              <p className="text-sm text-muted-foreground">Sync posisi current</p>
              <Button size="sm" variant="outline" className="border-green-200 text-green-700">
                <MapPin className="h-4 w-4 mr-2" />
                Sync Lokasi
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium">⏰ Update Status</h3>
              <p className="text-sm text-muted-foreground">Ubah status order</p>
              <Button size="sm" variant="outline" className="border-orange-200 text-orange-700">
                <Clock className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offline Mode Notice */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <WifiOff className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-800">Mode Offline Aktif</h3>
                <p className="text-sm text-orange-700">
                  Data order tersimpan secara lokal. Semua perubahan akan disinkronisasi saat koneksi kembali tersedia.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Maps Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5" />
            <span>🗺️ Integrasi Google Maps</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Route className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Fitur Navigasi Tersedia</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Rute optimal real-time dengan traffic update</li>
                <li>• Voice guidance turn-by-turn directions</li>
                <li>• Estimasi waktu tiba yang akurat</li>
                <li>• Alternative routes saat macet</li>
                <li>• Integration dengan Google Maps app</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">{currentOrder.estimatedDistance}</div>
                <div className="text-sm text-muted-foreground">Kilometer</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">{currentOrder.estimatedTime}</div>
                <div className="text-sm text-muted-foreground">Menit</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}