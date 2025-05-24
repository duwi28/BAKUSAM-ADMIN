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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  MapPin, 
  Phone, 
  DollarSign, 
  Package,
  Truck,
  Plus,
  Calculator,
  Clock,
  User,
  Search,
  Check,
  Users,
  Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Customer } from "@shared/schema";

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

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pricing rules for cost calculation
  const { data: pricingRules } = useQuery({
    queryKey: ["/api/pricing-rules"],
  });

  // Fetch customers for selection
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
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
    setSelectedCustomer(null);
    setShowCustomerSelector(false);
    setCustomerSearchTerm("");
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      pickupAddress: customer.address || "",
      pickupPhone: customer.phone,
    }));
    setShowCustomerSelector(false);
    toast({
      title: "✅ Customer Dipilih",
      description: `${customer.fullName} berhasil dipilih sebagai pengirim`,
    });
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setFormData(prev => ({
      ...prev,
      pickupAddress: "",
      pickupPhone: "",
    }));
  };

  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

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

      {/* Customer Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>🔍 Pilih Customer</span>
          </CardTitle>
          <CardDescription>
            Pilih customer yang sudah terdaftar atau isi manual data pengirim
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedCustomer ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Customer Terpilih</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">{selectedCustomer.fullName}</p>
                    <p className="text-sm text-muted-foreground">📞 {selectedCustomer.phone}</p>
                    <p className="text-sm text-muted-foreground">📍 {selectedCustomer.address || 'Alamat tidak tersedia'}</p>
                    {selectedCustomer.email && (
                      <p className="text-sm text-muted-foreground">📧 {selectedCustomer.email}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelectedCustomer}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Ganti Customer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Cari customer berdasarkan nama, HP, atau email..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomerSelector(!showCustomerSelector)}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showCustomerSelector ? 'Sembunyikan' : 'Tampilkan'} Daftar Customer
                </Button>
              </div>

              {(showCustomerSelector || customerSearchTerm) && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>Total Order</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {customerSearchTerm ? "Tidak ada customer yang sesuai dengan pencarian" : "Belum ada customer terdaftar"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.slice(0, 5).map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{customer.fullName}</p>
                                <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{customer.phone}</p>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm max-w-[200px] truncate">
                                {customer.address || "-"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{customer.totalOrders}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                onClick={() => selectCustomer(customer)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Pilih
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {filteredCustomers.length > 5 && (
                    <div className="p-3 text-center text-sm text-muted-foreground border-t">
                      Menampilkan 5 dari {filteredCustomers.length} customer. Gunakan pencarian untuk hasil lebih spesifik.
                    </div>
                  )}
                </div>
              )}

              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">
                  Tidak menemukan customer? Isi form di bawah secara manual
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Formulir Order Manual</span>
          </CardTitle>
          <CardDescription>
            {selectedCustomer 
              ? "Data pengirim sudah terisi otomatis. Lengkapi alamat tujuan dan detail lainnya." 
              : "Isi formulir di bawah untuk membuat order manual yang akan diteruskan ke driver"}
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
                  <Label htmlFor="pickupAddress" className="flex items-center space-x-2">
                    <span>Alamat Penjemputan *</span>
                    {selectedCustomer && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Terisi Otomatis
                      </Badge>
                    )}
                  </Label>
                  <Textarea
                    id="pickupAddress"
                    placeholder="Masukkan alamat lengkap penjemputan..."
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                    rows={3}
                    className={`resize-none ${selectedCustomer ? 'bg-green-50 border-green-300' : ''}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupPhone" className="flex items-center space-x-2">
                    <span>No HP Pengirim *</span>
                    {selectedCustomer && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Terisi Otomatis
                      </Badge>
                    )}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickupPhone"
                      type="tel"
                      placeholder="081234567890"
                      value={formData.pickupPhone}
                      onChange={(e) => handleInputChange("pickupPhone", e.target.value)}
                      className={`pl-10 ${selectedCustomer ? 'bg-green-50 border-green-300' : ''}`}
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