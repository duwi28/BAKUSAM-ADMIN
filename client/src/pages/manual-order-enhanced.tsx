import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  PlusCircle,
  MapPin,
  Users,
  Calculator,
  Clock,
  Truck,
  Zap,
  Star,
  Phone,
  CreditCard,
  Route,
  Target,
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Navigation,
  Bookmark,
  Copy,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertOrderSchema, type InsertOrder, type Customer, type Driver } from "@shared/schema";

export default function ManualOrderEnhanced() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickMode, setQuickMode] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvancePayment, setShowAdvancePayment] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerId: 0,
      pickupAddress: "",
      deliveryAddress: "",
      distance: "1", // Default distance
      baseFare: "",
      totalFare: "",
      notes: "",
      status: "pending",
    },
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  // Auto-refresh recent orders setiap 5 detik
  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 5000, // Refresh setiap 5 detik
    refetchIntervalInBackground: true, // Tetap refresh di background
  });

  // State untuk form fields baru
  const [pickupPhone, setPickupPhone] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [shippingCost, setShippingCost] = useState('');

  // Quick templates untuk pembuatan order cepat
  const quickTemplates = [
    { 
      name: "Bandara - Kota", 
      pickup: "Bandara Husein Sastranegara", 
      delivery: "Pusat Kota Bandung", 
      pickupPhone: "081234567890",
      deliveryPhone: "081234567891",
      shippingCost: "25000",
      vehicleType: "motor",
      icon: "✈️"
    },
    { 
      name: "Stasiun - Mall", 
      pickup: "Stasiun Bandung", 
      delivery: "Trans Studio Mall", 
      pickupPhone: "081234567892",
      deliveryPhone: "081234567893",
      shippingCost: "18000",
      vehicleType: "motor",
      icon: "🚉"
    },
    { 
      name: "Kampus - RS", 
      pickup: "ITB Ganesha", 
      delivery: "RS Borromeus", 
      pickupPhone: "081234567894",
      deliveryPhone: "081234567895",
      shippingCost: "35000",
      vehicleType: "mobil",
      icon: "🏥"
    },
    { 
      name: "Hotel - Wisata", 
      pickup: "Hotel Hilton", 
      delivery: "Kawah Putih", 
      pickupPhone: "081234567896",
      deliveryPhone: "081234567897",
      shippingCost: "120000",
      vehicleType: "mobil",
      icon: "🏨"
    },
    { 
      name: "Rumah - Kantor", 
      pickup: "Perumahan Setrasari", 
      delivery: "Gedung Sate", 
      pickupPhone: "081234567898",
      deliveryPhone: "081234567899",
      shippingCost: "40000",
      vehicleType: "motor",
      icon: "🏢"
    },
    { 
      name: "Pasar - Rumah", 
      pickup: "Pasar Baru", 
      delivery: "Jl. Dago", 
      pickupPhone: "081234567800",
      deliveryPhone: "081234567801",
      shippingCost: "22000",
      vehicleType: "motor",
      icon: "🛒"
    }
  ];

  // Recent customers for quick selection
  const recentCustomers = customers?.slice(0, 5) || [];

  // Available drivers by vehicle type
  const getDriversByVehicle = (vehicleType: string) => {
    return drivers?.filter(driver => driver.vehicleType === vehicleType && driver.status === 'active') || [];
  };

  const calculatePrice = async (distance: string, vehicleType: string) => {
    setIsCalculating(true);
    try {
      const dist = parseFloat(distance);
      let baseRate = 0;
      let perKmRate = 0;

      switch (vehicleType) {
        case 'motor':
          baseRate = 5000;
          perKmRate = 2000;
          break;
        case 'mobil':
          baseRate = 10000;
          perKmRate = 3500;
          break;
        case 'pickup':
          baseRate = 15000;
          perKmRate = 4000;
          break;
        default:
          baseRate = 5000;
          perKmRate = 2000;
      }

      const calculatedPrice = baseRate + (dist * perKmRate);
      setEstimatedPrice(calculatedPrice);
      
      form.setValue('baseFare', baseRate.toString());
      form.setValue('totalFare', calculatedPrice.toString());
      
    } catch (error) {
      console.error('Error calculating price:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const applyTemplate = (template: any) => {
    form.setValue('pickupAddress', template.pickup);
    form.setValue('deliveryAddress', template.delivery);
    form.setValue('distance', "1"); // Default distance
    form.setValue('baseFare', template.shippingCost);
    form.setValue('totalFare', template.shippingCost);
    setPickupPhone(template.pickupPhone);
    setDeliveryPhone(template.deliveryPhone);
    setShippingCost(template.shippingCost);
    setEstimatedPrice(parseInt(template.shippingCost));
    
    toast({
      title: "Template Applied",
      description: `Template "${template.name}" berhasil diterapkan`,
    });
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue('customerId', customer.id);
    toast({
      title: "Customer Selected",
      description: `${customer.fullName} dipilih sebagai customer`,
    });
  };

  const autoAssignDriver = () => {
    const distance = form.getValues('distance');
    const vehicleType = selectedDriver?.vehicleType || 'motor';
    const availableDrivers = getDriversByVehicle(vehicleType);
    
    if (availableDrivers.length > 0) {
      // Sort by rating and select the best available driver
      const bestDriver = availableDrivers.sort((a, b) => 
        parseFloat(b.rating || '0') - parseFloat(a.rating || '0')
      )[0];
      
      setSelectedDriver(bestDriver);
      toast({
        title: "Driver Auto-Assigned",
        description: `${bestDriver.fullName} berhasil ditugaskan otomatis`,
      });
    } else {
      toast({
        title: "No Available Drivers",
        description: "Tidak ada driver tersedia untuk jenis kendaraan ini",
        variant: "destructive"
      });
    }
  };

  const createOrderMutation = useMutation({
    mutationFn: (data: InsertOrder) => apiRequest('/api/orders', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Created Successfully",
        description: "Order baru berhasil dibuat dan siap diproses",
      });
      form.reset();
      setSelectedCustomer(null);
      setSelectedDriver(null);
      setEstimatedPrice(0);
    },
    onError: (error) => {
      toast({
        title: "Error Creating Order",
        description: "Terjadi kesalahan saat membuat order",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: InsertOrder) => {
    setIsSubmitting(true);
    try {
      await createOrderMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <PlusCircle className="h-6 w-6 mr-2 text-indigo-600" />
            Manual Order Express
          </h1>
          <p className="text-gray-600 text-sm">
            Buat order baru dengan cepat menggunakan template dan auto-fill
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Quick Mode</label>
            <Switch 
              checked={quickMode} 
              onCheckedChange={setQuickMode}
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>

      {quickMode ? (
        // Quick Mode Layout
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Templates */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template, index) => (
                  <div 
                    key={index}
                    className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all duration-200"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{template.icon}</span>
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><MapPin className="h-3 w-3 inline mr-1" />{template.pickup}</p>
                          <p><Target className="h-3 w-3 inline mr-1" />{template.delivery}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-blue-600">📞 {template.pickupPhone}</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(parseInt(template.shippingCost))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {template.vehicleType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent Customers */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Recent Customers</h4>
                  <div className="space-y-2">
                    {recentCustomers.map((customer) => (
                      <div 
                        key={customer.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          selectedCustomer?.id === customer.id 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{customer.fullName}</p>
                            <p className="text-xs text-gray-600">{customer.phone}</p>
                          </div>
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto Assignment */}
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={autoAssignDriver}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Auto Assign Driver
                  </Button>
                  
                  {selectedDriver && (
                    <div className="mt-2 p-2 bg-green-50 rounded border-l-2 border-green-400">
                      <p className="font-medium text-sm text-green-800">{selectedDriver.fullName}</p>
                      <p className="text-xs text-green-600">
                        {selectedDriver.vehicleType} • Rating: {selectedDriver.rating || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Calculator */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Estimated Price</h4>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Fare</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(estimatedPrice)}
                      </span>
                    </div>
                    {isCalculating && (
                      <div className="flex items-center space-x-2 mt-2">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-gray-500">Calculating...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advance Payment Toggle */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-sm text-yellow-800">Advance Payment</p>
                    <p className="text-xs text-yellow-600">For motorcycle drivers</p>
                  </div>
                  <Switch 
                    checked={showAdvancePayment}
                    onCheckedChange={setShowAdvancePayment}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Full Form Mode
        <Card>
          <CardHeader>
            <CardTitle>Complete Order Form</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Full form mode with all options available</p>
          </CardContent>
        </Card>
      )}

      {/* Order Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <Send className="h-5 w-5 mr-2 text-indigo-600" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          const customer = customers?.find(c => c.id === parseInt(value));
                          if (customer) setSelectedCustomer(customer);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>{customer.fullName} - {customer.phone}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vehicle Type */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={(value) => {
                        const distance = form.getValues('distance');
                        if (distance) calculatePrice(distance, value);
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kendaraan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="motor">
                            🏍️ Motor (Cepat & Ekonomis)
                          </SelectItem>
                          <SelectItem value="mobil">
                            🚗 Mobil (Nyaman & Aman)
                          </SelectItem>
                          <SelectItem value="pickup">
                            🚚 Pickup (Barang Besar)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alamat Pengambilan */}
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Pengambilan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Alamat penjemputan"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* No HP Pengambilan */}
                <FormItem>
                  <FormLabel>No HP Pengambilan</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nomor HP pengirim"
                      value={pickupPhone}
                      onChange={(e) => setPickupPhone(e.target.value)}
                    />
                  </FormControl>
                </FormItem>

                {/* Alamat Penerima */}
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Penerima</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Alamat pengiriman"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* No HP Penerima */}
                <FormItem>
                  <FormLabel>No HP Penerima</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nomor HP penerima"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                    />
                  </FormControl>
                </FormItem>

                {/* Jumlah Talangan */}
                <FormItem>
                  <FormLabel>Jumlah Talangan</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="Jumlah uang talangan"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                    />
                  </FormControl>
                </FormItem>

                {/* Ongkir */}
                <FormField
                  control={form.control}
                  name="totalFare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ongkir</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Ongkos kirim"
                          value={shippingCost}
                          onChange={(e) => {
                            setShippingCost(e.target.value);
                            field.onChange(e.target.value);
                            form.setValue('baseFare', e.target.value);
                            setEstimatedPrice(parseInt(e.target.value) || 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Catatan tambahan untuk order ini..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create Order
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}