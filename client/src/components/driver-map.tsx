import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, User } from "lucide-react";

interface DriverLocation {
  id: number;
  fullName: string;
  phone: string;
  vehicleType: string;
  status: string;
  latitude: number;
  longitude: number;
  lastUpdate: string;
  currentOrder?: {
    id: number;
    pickupAddress: string;
    deliveryAddress: string;
    status: string;
  };
}

interface DriverMapProps {
  drivers: DriverLocation[];
  onAssignDriver?: (driverId: number, orderId: number) => void;
  selectedOrder?: {
    id: number;
    pickupLat: number;
    pickupLng: number;
    deliveryLat: number;
    deliveryLng: number;
  };
}

export default function DriverMap({ drivers, onAssignDriver, selectedOrder }: DriverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverLocation | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignDriver = (driverId: number) => {
    if (selectedOrder && onAssignDriver) {
      onAssignDriver(driverId, selectedOrder.id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Peta Driver Real-time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border bg-gray-100 flex items-center justify-center"
              style={{ minHeight: '400px' }}
            >
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Integrasi Peta Real-time</h3>
                <p className="text-sm">
                  Fitur peta akan menampilkan posisi driver secara real-time
                  <br />
                  dengan integrasi Google Maps API
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Aktif ({drivers.filter(d => d.status === 'active').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Sibuk ({drivers.filter(d => d.status === 'busy').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Offline ({drivers.filter(d => d.status === 'offline').length})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Driver Terdekat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {drivers
              .filter(driver => driver.status === 'active')
              .slice(0, 5)
              .map(driver => (
                <div 
                  key={driver.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDriver?.id === driver.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDriver(driver)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{driver.fullName}</h4>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {driver.phone}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {driver.vehicleType}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder && onAssignDriver && (
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignDriver(driver.id);
                      }}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Tugaskan
                    </Button>
                  )}
                  
                  {driver.currentOrder && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <p className="font-medium">Order Aktif: #{driver.currentOrder.id}</p>
                      <p className="text-gray-600">{driver.currentOrder.status}</p>
                    </div>
                  )}
                </div>
              ))}
            
            {drivers.filter(driver => driver.status === 'active').length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">
                Tidak ada driver aktif
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}