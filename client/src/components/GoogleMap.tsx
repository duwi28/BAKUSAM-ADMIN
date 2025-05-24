import { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Navigation, 
  Phone, 
  Eye,
  Car,
  Truck,
  Battery,
  Wifi,
  Gauge,
  Clock,
  Target
} from "lucide-react";

interface DriverLocation {
  id: number;
  driverId: number;
  fullName: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'online' | 'offline' | 'busy' | 'break';
  isOnDuty: boolean;
  currentOrderId?: number;
  speed: number;
  heading: number;
  batteryLevel: number;
  signalStrength: number;
  lastUpdated: string;
  rating: number;
  estimatedArrival?: string;
  destination?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface GoogleMapProps {
  drivers: DriverLocation[];
  onDriverSelect?: (driver: DriverLocation | null) => void;
  selectedDriver?: DriverLocation | null;
  showTraffic?: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    callDriver: (phone: string) => void;
    trackDriver: (driverId: number) => void;
  }
}

export default function GoogleMap({ 
  drivers, 
  onDriverSelect, 
  selectedDriver, 
  showTraffic = true 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedDriverInfo, setSelectedDriverInfo] = useState<DriverLocation | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981'; // green-500
      case 'busy': return '#F59E0B'; // amber-500
      case 'break': return '#EAB308'; // yellow-500
      case 'offline': return '#6B7280'; // gray-500
      default: return '#6B7280';
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'motor': return '🏍️';
      case 'mobil': return '🚗';
      case 'truck': return '🚛';
      default: return '🚗';
    }
  };

  const createCustomMarker = (driver: DriverLocation) => {
    const color = getStatusColor(driver.status);
    const icon = getVehicleIcon(driver.vehicleType);
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      scale: 12,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
    };
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Pusat peta di Jakarta
    const jakartaCenter = { lat: -6.2088, lng: 106.8456 };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: jakartaCenter,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Aktifkan traffic layer jika diminta
    if (showTraffic) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(mapInstanceRef.current);
    }

    setIsMapLoaded(true);
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // Hapus marker lama
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Buat marker baru untuk setiap driver
    drivers.forEach(driver => {
      const marker = new window.google.maps.Marker({
        position: driver.currentLocation,
        map: mapInstanceRef.current,
        icon: createCustomMarker(driver),
        title: `${driver.fullName} - ${driver.status}`,
        animation: driver.status === 'busy' ? window.google.maps.Animation.BOUNCE : null,
      });

      // Info window untuk detail driver
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 250px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; margin-right: 8px;">${getVehicleIcon(driver.vehicleType)}</span>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${driver.fullName}</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${driver.vehicleNumber}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; 
                           background-color: ${getStatusColor(driver.status)}; color: white; text-transform: uppercase;">
                ${driver.status}
              </span>
            </div>
            
            <div style="font-size: 12px; line-height: 1.4;">
              <p style="margin: 4px 0;"><strong>Lokasi:</strong> ${driver.currentLocation.address}</p>
              <p style="margin: 4px 0;"><strong>Kecepatan:</strong> ${driver.speed} km/h</p>
              <p style="margin: 4px 0;"><strong>Baterai:</strong> ${driver.batteryLevel}%</p>
              <p style="margin: 4px 0;"><strong>Rating:</strong> ⭐ ${driver.rating}</p>
              ${driver.estimatedArrival ? `<p style="margin: 4px 0;"><strong>ETA:</strong> ${driver.estimatedArrival}</p>` : ''}
            </div>
            
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <button onclick="window.callDriver('${driver.phone}')" 
                      style="padding: 6px 12px; background: #3B82F6; color: white; border: none; 
                             border-radius: 6px; font-size: 12px; cursor: pointer;">
                📞 Call
              </button>
              <button onclick="window.trackDriver(${driver.id})" 
                      style="padding: 6px 12px; background: #10B981; color: white; border: none; 
                             border-radius: 6px; font-size: 12px; cursor: pointer;">
                👁️ Track
              </button>
            </div>
          </div>
        `
      });

      // Event listener untuk marker
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        setSelectedDriverInfo(driver);
        onDriverSelect?.(driver);
      });

      // Jika driver sedang menuju tujuan, gambar rute
      if (driver.destination && driver.status === 'busy') {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: getStatusColor(driver.status),
            strokeWeight: 4,
            strokeOpacity: 0.7
          }
        });

        directionsRenderer.setMap(mapInstanceRef.current);

        directionsService.route({
          origin: driver.currentLocation,
          destination: driver.destination,
          travelMode: driver.vehicleType === 'motor' ? 
            window.google.maps.TravelMode.TWO_WHEELER : 
            window.google.maps.TravelMode.DRIVING,
        }, (result: any, status: any) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        });
      }

      markersRef.current.push(marker);
    });

    // Focus pada selected driver
    if (selectedDriver) {
      mapInstanceRef.current.setCenter(selectedDriver.currentLocation);
      mapInstanceRef.current.setZoom(15);
    }
  };

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&callback=initMap&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Update markers when drivers data changes
  useEffect(() => {
    updateMarkers();
  }, [drivers, isMapLoaded, selectedDriver]);

  // Global functions for info window buttons
  useEffect(() => {
    window.callDriver = (phone: string) => {
      window.open(`tel:${phone}`);
    };

    window.trackDriver = (driverId: number) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        onDriverSelect?.(driver);
        mapInstanceRef.current?.setCenter(driver.currentLocation);
        mapInstanceRef.current?.setZoom(16);
      }
    };
  }, [drivers, onDriverSelect]);

  return (
    <div className="relative w-full h-full">
      {/* Interactive Map Display */}
      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        
        {/* Jakarta Map Outline */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 h-4/5 relative">
            {/* Simulated Jakarta Areas */}
            <div className="absolute top-1/4 left-1/3 w-32 h-24 bg-blue-200/40 rounded-lg border border-blue-300 flex items-center justify-center text-xs font-medium text-blue-700">
              Jakarta Pusat
            </div>
            <div className="absolute bottom-1/4 left-1/4 w-28 h-20 bg-green-200/40 rounded-lg border border-green-300 flex items-center justify-center text-xs font-medium text-green-700">
              Jakarta Selatan
            </div>
            <div className="absolute top-1/3 left-0 w-24 h-24 bg-yellow-200/40 rounded-lg border border-yellow-300 flex items-center justify-center text-xs font-medium text-yellow-700">
              Jakarta Barat
            </div>
            <div className="absolute top-1/4 right-1/4 w-28 h-20 bg-purple-200/40 rounded-lg border border-purple-300 flex items-center justify-center text-xs font-medium text-purple-700">
              Jakarta Timur
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-26 h-18 bg-indigo-200/40 rounded-lg border border-indigo-300 flex items-center justify-center text-xs font-medium text-indigo-700">
              Jakarta Utara
            </div>
          </div>
        </div>

        {/* Driver Markers */}
        {drivers.map((driver, index) => (
          <div
            key={driver.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 hover:scale-110 ${
              selectedDriver?.id === driver.id ? 'z-20 scale-125' : 'z-10'
            }`}
            style={{
              left: `${25 + (index * 15) + Math.sin(index * 2) * 10}%`,
              top: `${30 + (index * 12) + Math.cos(index * 2) * 8}%`,
              animationDelay: `${index * 200}ms`
            }}
            onClick={() => {
              setSelectedDriverInfo(driver);
              onDriverSelect?.(driver);
            }}
          >
            {/* Driver Marker */}
            <div className={`relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs ${
              driver.status === 'online' ? 'bg-green-500 animate-pulse' :
              driver.status === 'busy' ? 'bg-orange-500 animate-bounce' :
              driver.status === 'break' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}>
              {getVehicleIcon(driver.vehicleType)}
              
              {/* Status Indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                driver.status === 'online' ? 'bg-green-400' :
                driver.status === 'busy' ? 'bg-orange-400' :
                driver.status === 'break' ? 'bg-yellow-400' :
                'bg-gray-400'
              }`}></div>
            </div>

            {/* Driver Info Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {driver.fullName}
                <div className="text-gray-300">{driver.speed} km/h</div>
              </div>
            </div>

            {/* Movement Trail for Busy Drivers */}
            {driver.status === 'busy' && driver.destination && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-1 h-20 bg-gradient-to-b from-orange-400 to-transparent opacity-60 transform rotate-45 origin-bottom"></div>
              </div>
            )}
          </div>
        ))}

        {/* Floating Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h4 className="text-xs font-semibold mb-2">Status Driver:</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Sibuk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Istirahat</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Count Badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">{drivers.length} Driver Terpantau</span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter({ lat: -6.2088, lng: 106.8456 });
              mapInstanceRef.current.setZoom(12);
            }
          }}
        >
          <Target className="h-4 w-4 mr-1" />
          Reset View
        </Button>
      </div>

      {/* Selected Driver Info Panel */}
      {selectedDriverInfo && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getVehicleIcon(selectedDriverInfo.vehicleType)}</span>
                  <div>
                    <h3 className="font-semibold">{selectedDriverInfo.fullName}</h3>
                    <p className="text-sm text-gray-600">{selectedDriverInfo.vehicleNumber}</p>
                  </div>
                </div>
                <Badge className={`${
                  selectedDriverInfo.status === 'online' ? 'bg-green-100 text-green-800' :
                  selectedDriverInfo.status === 'busy' ? 'bg-orange-100 text-orange-800' :
                  selectedDriverInfo.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedDriverInfo.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <Gauge className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <div className="font-medium">{selectedDriverInfo.speed} km/h</div>
                  <div className="text-gray-500">Speed</div>
                </div>
                <div className="text-center">
                  <Battery className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <div className="font-medium">{selectedDriverInfo.batteryLevel}%</div>
                  <div className="text-gray-500">Battery</div>
                </div>
                <div className="text-center">
                  <Wifi className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <div className="font-medium">{selectedDriverInfo.signalStrength}%</div>
                  <div className="text-gray-500">Signal</div>
                </div>
              </div>

              {selectedDriverInfo.estimatedArrival && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-800 text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    ETA: {selectedDriverInfo.estimatedArrival}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 mt-3">
                <Button 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => window.open(`tel:${selectedDriverInfo.phone}`)}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}