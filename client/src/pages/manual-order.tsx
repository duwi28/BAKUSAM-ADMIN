import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  DollarSign, 
  Package,
  Truck,
  Plus,
  Calculator,
  Clock,
  User
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ManualOrder() {
  const [formData, setFormData] = useState({
    pickupAddress: "",
    pickupPhone: "",
    deliveryAddress: "",
    deliveryPhone: "",
    advanceAmount: "",
    shippingCost: "",
    itemType: "",
    itemDescription: "",
    vehicleType: "motor",
    priority: "normal",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pricing rules for cost calculation
  const { data: pricingRules } = useQuery({
    queryKey: ["/api/pricing-rules"],
  });

  // Create manual order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest("POST", "/api/orders/manual", orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      resetForm();
      toast({
        title: "📦 Berhasil",
        description: "Order manual berhasil dibuat dan menunggu assignment driver",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal membuat order manual",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      pickupAddress: "",
      pickupPhone: "",
      deliveryAddress: "",
      deliveryPhone: "",
      advanceAmount: "",
      shippingCost: "",
      itemType: "",
      itemDescription: "",
      vehicleType: "motor",
      priority: "normal",
      notes: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatNumberInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue ? parseInt(numericValue).toLocaleString("id-ID") : "";
  };

  const parseFormattedNumber = (value: string) => {
    return parseInt(value.replace(/\D/g, "") || "0");
  };

  const calculateTotal = () => {
    const advance = parseFormattedNumber(formData.advanceAmount);
    const shipping = parseFormattedNumber(formData.shippingCost);
    return advance + shipping;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickupAddress || !formData.deliveryAddress || !formData.pickupPhone || !formData.deliveryPhone) {
      toast({
        title: "Error",
        description: "Alamat dan nomor HP wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      pickupAddress: formData.pickupAddress,
      pickupPhone: formData.pickupPhone,
      deliveryAddress: formData.deliveryAddress,
      deliveryPhone: formData.deliveryPhone,
      advanceAmount: parseFormattedNumber(formData.advanceAmount),
      baseFare: parseFormattedNumber(formData.shippingCost),
      totalFare: calculateTotal(),
      itemType: formData.itemType,
      itemDescription: formData.itemDescription,
      vehicleType: formData.vehicleType,
      priority: formData.priority,
      notes: formData.notes,
      orderType: "manual"
    };

    createOrderMutation.mutate(orderData);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "motor": return "🏍️";
      case "mobil": return "🚗";
      case "pickup": return "🚛";
      default: return "🚚";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">📝 Order Manual</h1>
        <p className="text-muted-foreground">
          Buat order baru secara manual melalui dashboard admin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Formulir Order Manual</span>
          </CardTitle>
          <CardDescription>
            Isi formulir di bawah untuk membuat order manual yang akan diteruskan ke driver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pickup Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-green-700">
                  <MapPin className="h-5 w-5" />
                  <span>📍 Informasi Penjemputan</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Alamat Penjemputan *</Label>
                  <Textarea
                    id="pickupAddress"
                    placeholder="Masukkan alamat lengkap penjemputan..."
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupPhone">No HP Pengirim *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickupPhone"
                      type="tel"
                      placeholder="081234567890"
                      value={formData.pickupPhone}
                      onChange={(e) => handleInputChange("pickupPhone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-blue-700">
                  <MapPin className="h-5 w-5" />
                  <span>🎯 Informasi Tujuan</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Alamat Tujuan *</Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Masukkan alamat lengkap tujuan..."
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryPhone">No HP Penerima *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deliveryPhone"
                      type="tel"
                      placeholder="081234567890"
                      value={formData.deliveryPhone}
                      onChange={(e) => handleInputChange("deliveryPhone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-purple-700">
                  <DollarSign className="h-5 w-5" />
                  <span>💰 Informasi Biaya</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advanceAmount">Jumlah Talangan</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <Input
                      id="advanceAmount"
                      placeholder="0"
                      value={formData.advanceAmount}
                      onChange={(e) => handleInputChange("advanceAmount", formatNumberInput(e.target.value))}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingCost">Ongkir *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <Input
                      id="shippingCost"
                      placeholder="0"
                      value={formData.shippingCost}
                      onChange={(e) => handleInputChange("shippingCost", formatNumberInput(e.target.value))}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Total Calculation */}
                {(formData.advanceAmount || formData.shippingCost) && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Total Biaya</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Talangan:</span>
                        <span>Rp {formData.advanceAmount || "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ongkir:</span>
                        <span>Rp {formData.shippingCost || "0"}</span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between font-bold text-lg text-green-600">
                        <span>Total:</span>
                        <span>Rp {formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-orange-700">
                  <Package className="h-5 w-5" />
                  <span>📦 Informasi Barang</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="itemType">Jenis Barang *</Label>
                  <Select value={formData.itemType} onValueChange={(value) => handleInputChange("itemType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis barang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dokumen">📄 Dokumen</SelectItem>
                      <SelectItem value="makanan">🍔 Makanan</SelectItem>
                      <SelectItem value="pakaian">👕 Pakaian</SelectItem>
                      <SelectItem value="elektronik">📱 Elektronik</SelectItem>
                      <SelectItem value="obat">💊 Obat-obatan</SelectItem>
                      <SelectItem value="kosmetik">💄 Kosmetik</SelectItem>
                      <SelectItem value="lainnya">📦 Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDescription">Deskripsi Barang</Label>
                  <Textarea
                    id="itemDescription"
                    placeholder="Deskripsi detail barang yang dikirim..."
                    value={formData.itemDescription}
                    onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-indigo-700">
                  <Truck className="h-5 w-5" />
                  <span>🚚 Jenis Kendaraan</span>
                </div>
                
                <div className="space-y-2">
                  <Label>Pilih Jenis Kendaraan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["motor", "mobil", "pickup"].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={formData.vehicleType === type ? "default" : "outline"}
                        onClick={() => handleInputChange("vehicleType", type)}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <span className="text-2xl mb-1">{getVehicleIcon(type)}</span>
                        <span className="text-sm capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold text-pink-700">
                  <Clock className="h-5 w-5" />
                  <span>⚡ Prioritas Order</span>
                </div>
                
                <div className="space-y-2">
                  <Label>Tingkat Prioritas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={formData.priority === "normal" ? "default" : "outline"}
                      onClick={() => handleInputChange("priority", "normal")}
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Normal</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.priority === "urgent" ? "default" : "outline"}
                      onClick={() => handleInputChange("priority", "urgent")}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Urgent</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan untuk driver (opsional)..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={createOrderMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createOrderMutation.isPending ? "Memproses..." : "📦 Buat Order Manual"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}