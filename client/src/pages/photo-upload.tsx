import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  MapPin,
  Clock,
  FileImage,
  Smartphone,
  Image
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PhotoUpload {
  id: string;
  file: File;
  preview: string;
  type: 'pickup' | 'delivery' | 'item' | 'signature';
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function PhotoUpload() {
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [notes, setNotes] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(12345);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload photos mutation
  const uploadPhotosMutation = useMutation({
    mutationFn: async (data: { orderId: number; photos: PhotoUpload[]; notes: string }) => {
      const formData = new FormData();
      formData.append('orderId', data.orderId.toString());
      formData.append('notes', data.notes);
      
      data.photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo.file);
        formData.append(`photoTypes[${index}]`, photo.type);
        formData.append(`photoTimestamps[${index}]`, photo.timestamp.toISOString());
        if (photo.location) {
          formData.append(`photoLocations[${index}]`, JSON.stringify(photo.location));
        }
      });

      return apiRequest("POST", "/api/driver/upload-photos", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver/current-order"] });
      setPhotos([]);
      setNotes("");
      toast({
        title: "📸 Berhasil",
        description: "Foto bukti pengiriman berhasil diupload",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mengupload foto bukti pengiriman",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = (): Promise<{lat: number, lng: number, address: string}> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: "Lokasi saat ini" // In real app, reverse geocode this
            });
          },
          () => {
            // Fallback to default Jakarta location
            resolve({
              lat: -6.2088,
              lng: 106.8456,
              address: "Jakarta, Indonesia"
            });
          }
        );
      } else {
        resolve({
          lat: -6.2088,
          lng: 106.8456,
          address: "Jakarta, Indonesia"
        });
      }
    });
  };

  const handleFileSelect = async (files: FileList | null, photoType: 'pickup' | 'delivery' | 'item' | 'signature') => {
    if (!files) return;

    const location = await getCurrentLocation();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        const newPhoto: PhotoUpload = {
          id: Date.now().toString() + i,
          file,
          preview,
          type: photoType,
          timestamp: new Date(),
          location
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    }
  };

  const openCamera = (photoType: 'pickup' | 'delivery' | 'item' | 'signature') => {
    if (cameraInputRef.current) {
      cameraInputRef.current.setAttribute('data-photo-type', photoType);
      cameraInputRef.current.click();
    }
  };

  const openFileSelector = (photoType: 'pickup' | 'delivery' | 'item' | 'signature') => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-photo-type', photoType);
      fileInputRef.current.click();
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const updated = prev.filter(photo => photo.id !== photoId);
      const photoToRemove = prev.find(photo => photo.id === photoId);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      toast({
        title: "Error",
        description: "Minimal satu foto harus diupload",
        variant: "destructive",
      });
      return;
    }

    uploadPhotosMutation.mutate({
      orderId: currentOrderId,
      photos,
      notes
    });
  };

  const getPhotoTypeIcon = (type: string) => {
    switch (type) {
      case 'pickup': return '📦';
      case 'delivery': return '🎯';
      case 'item': return '📋';
      case 'signature': return '✍️';
      default: return '📷';
    }
  };

  const getPhotoTypeText = (type: string) => {
    switch (type) {
      case 'pickup': return 'Foto Pickup';
      case 'delivery': return 'Foto Delivery';
      case 'item': return 'Foto Barang';
      case 'signature': return 'Foto Tanda Tangan';
      default: return 'Foto';
    }
  };

  const getPhotoTypeColor = (type: string) => {
    switch (type) {
      case 'pickup': return 'bg-yellow-100 text-yellow-800';
      case 'delivery': return 'bg-green-100 text-green-800';
      case 'item': return 'bg-blue-100 text-blue-800';
      case 'signature': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">📸 Upload Bukti Pengiriman</h1>
        <p className="text-muted-foreground">
          Dokumentasi foto untuk order #{currentOrderId}
        </p>
      </div>

      {/* Photo Capture Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { type: 'pickup', label: 'Foto Pickup', icon: '📦', desc: 'Foto saat mengambil barang' },
          { type: 'delivery', label: 'Foto Delivery', icon: '🎯', desc: 'Foto saat menyerahkan barang' },
          { type: 'item', label: 'Foto Barang', icon: '📋', desc: 'Foto kondisi barang' },
          { type: 'signature', label: 'Tanda Tangan', icon: '✍️', desc: 'Foto tanda tangan penerima' }
        ].map((option) => (
          <Card key={option.type} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="text-3xl">{option.icon}</div>
                <h3 className="font-medium">{option.label}</h3>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    onClick={() => openCamera(option.type as any)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Kamera
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openFileSelector(option.type as any)}
                    className="w-full"
                  >
                    <FileImage className="h-4 w-4 mr-1" />
                    Galeri
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          const photoType = e.target.getAttribute('data-photo-type') as any;
          handleFileSelect(e.target.files, photoType);
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const photoType = e.target.getAttribute('data-photo-type') as any;
          handleFileSelect(e.target.files, photoType);
        }}
      />

      {/* Photos Preview */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>📷 Foto yang Diupload ({photos.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={photo.preview}
                      alt={`${photo.type} photo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Photo Info Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePhoto(photo.id)}
                      className="self-end w-8 h-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="space-y-1">
                      <Badge className={getPhotoTypeColor(photo.type)}>
                        {getPhotoTypeIcon(photo.type)} {getPhotoTypeText(photo.type)}
                      </Badge>
                      <div className="text-xs text-white">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{photo.timestamp.toLocaleTimeString('id-ID')}</span>
                        </div>
                        {photo.location && (
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{photo.location.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Catatan Tambahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan untuk foto bukti pengiriman (opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan khusus terkait pengiriman ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setPhotos([]);
            setNotes("");
          }}
        >
          Bersihkan Semua
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={uploadPhotosMutation.isPending || photos.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploadPhotosMutation.isPending ? 'Mengupload...' : `Upload ${photos.length} Foto`}
        </Button>
      </div>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Panduan Upload Foto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">✅ Tips Foto yang Baik</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Pastikan pencahayaan cukup terang</li>
                  <li>• Foto harus jelas dan tidak blur</li>
                  <li>• Sertakan timestamp dan lokasi</li>
                  <li>• Tunjukkan kondisi barang dengan jelas</li>
                  <li>• Untuk tanda tangan, pastikan terlihat jelas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🚫 Hindari</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Foto terlalu gelap atau silau</li>
                  <li>• Gambar buram atau tidak fokus</li>
                  <li>• Ukuran file terlalu besar (&gt;10MB)</li>
                  <li>• Foto tidak relevan dengan order</li>
                  <li>• Upload tanpa izin customer</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Fitur Otomatis</span>
              </div>
              <p className="text-sm text-blue-700">
                Foto akan otomatis disertai dengan timestamp, koordinat GPS, dan metadata lokasi untuk keperluan verifikasi dan tracking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}