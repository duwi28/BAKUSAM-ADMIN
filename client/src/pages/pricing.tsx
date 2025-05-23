import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingModal from "@/components/modals/pricing-modal";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  DollarSign, 
  Percent, 
  Clock, 
  Edit,
  Trash2,
  Car,
  Bike,
  Truck
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PricingRule {
  id: number;
  vehicleType: string;
  baseFare: string;
  perKmRate: string;
  isActive: boolean;
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  discountType: string;
  discountValue: string;
  minOrderValue?: string;
  maxDiscount?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

export default function Pricing() {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pricingRules = [], isLoading: loadingPricing } = useQuery<PricingRule[]>({
    queryKey: ["/api/pricing-rules"],
  });

  const { data: promotions = [], isLoading: loadingPromotions } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  const updatePricingMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest("PATCH", `/api/pricing-rules/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-rules"] });
      toast({
        title: "Berhasil",
        description: "Tarif berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui tarif",
        variant: "destructive",
      });
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest("PATCH", `/api/promotions/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      toast({
        title: "Berhasil",
        description: "Promo berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui promo",
        variant: "destructive",
      });
    },
  });

  const handlePricingToggle = (id: number, isActive: boolean) => {
    updatePricingMutation.mutate({ id, updates: { isActive: !isActive } });
  };

  const handlePromotionToggle = (id: number, isActive: boolean) => {
    updatePromotionMutation.mutate({ id, updates: { isActive: !isActive } });
  };

  const filteredPricingRules = pricingRules.filter((rule) =>
    rule.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPromotions = promotions.filter((promo) =>
    promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "motor":
        return <Bike className="h-5 w-5" />;
      case "mobil":
        return <Car className="h-5 w-5" />;
      case "pickup":
        return <Truck className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  const pricingStats = {
    totalRules: pricingRules.length,
    activeRules: pricingRules.filter(r => r.isActive).length,
  };

  const promoStats = {
    totalPromos: promotions.length,
    activePromos: promotions.filter(p => p.isActive).length,
    expiredPromos: promotions.filter(p => new Date(p.endDate) < new Date()).length,
  };

  if (loadingPricing || loadingPromotions) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tarif & Promosi</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Tarif & Promosi</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tarif</p>
                <p className="text-2xl font-bold text-foreground">{pricingStats.totalRules}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarif Aktif</p>
                <p className="text-2xl font-bold text-success">{pricingStats.activeRules}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promo Aktif</p>
                <p className="text-2xl font-bold text-warning">{promoStats.activePromos}</p>
              </div>
              <Percent className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promo Kadaluarsa</p>
                <p className="text-2xl font-bold text-error">{promoStats.expiredPromos}</p>
              </div>
              <Clock className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pricing">Tarif</TabsTrigger>
          <TabsTrigger value="promotions">Promosi</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          {/* Tarif Flat Motor */}
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bike className="h-5 w-5 text-orange-600" />
                <span className="text-orange-600">Tarif Flat Motor</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  Tidak Bergantung Jarak
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tarif Flat Motor</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input 
                        placeholder="25000" 
                        defaultValue="25000"
                        className="font-bold text-lg"
                      />
                      <span className="text-sm text-muted-foreground">/ order</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tarif tetap untuk semua pengiriman motor, tidak peduli jarak tempuh
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Batas Maksimal Jarak</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input 
                        placeholder="15" 
                        defaultValue="15"
                        className="font-bold"
                      />
                      <span className="text-sm text-muted-foreground">KM</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jarak maksimal yang masih menggunakan tarif flat
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        ✓ Aktif
                      </Badge>
                      <Button variant="outline" size="sm">
                        Nonaktifkan
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Update Tarif Flat
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-2">Contoh Perhitungan:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Jarak 2 KM:</p>
                    <p className="font-bold text-green-600">Rp 25.000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jarak 8 KM:</p>
                    <p className="font-bold text-green-600">Rp 25.000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jarak 15 KM:</p>
                    <p className="font-bold text-green-600">Rp 25.000</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarif Regular */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daftar Tarif Berdasarkan Jarak</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Cari tarif..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <Button onClick={() => setIsPricingModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Tarif
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipe Kendaraan</TableHead>
                    <TableHead>Tarif Dasar</TableHead>
                    <TableHead>Tarif per KM</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPricingRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "Tidak ada tarif yang sesuai dengan pencarian" : "Belum ada tarif terdaftar"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPricingRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getVehicleIcon(rule.vehicleType)}
                            <span className="font-medium text-foreground capitalize">
                              {rule.vehicleType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(rule.baseFare)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(rule.perKmRate)}/km
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Tarif
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePricingToggle(rule.id, rule.isActive)}
                              >
                                {rule.isActive ? "Nonaktifkan" : "Aktifkan"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-error">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daftar Promosi</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Cari promosi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <Button onClick={() => setIsPromoModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Promo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Promo</TableHead>
                    <TableHead>Tipe Diskon</TableHead>
                    <TableHead>Nilai Diskon</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Penggunaan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "Tidak ada promosi yang sesuai dengan pencarian" : "Belum ada promosi terdaftar"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{promo.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {promo.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {promo.discountType === "percentage" ? "Persentase" : "Nominal"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {promo.discountType === "percentage" 
                              ? `${promo.discountValue}%` 
                              : formatCurrency(promo.discountValue)
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{formatDate(promo.startDate)}</p>
                            <p className="text-sm text-muted-foreground">
                              s.d {formatDate(promo.endDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {promo.usageCount}/{promo.usageLimit || "∞"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              promo.isActive && new Date(promo.endDate) >= new Date() 
                                ? "default" 
                                : "secondary"
                            }
                          >
                            {promo.isActive && new Date(promo.endDate) >= new Date() 
                              ? "Aktif" 
                              : new Date(promo.endDate) < new Date() 
                                ? "Kadaluarsa" 
                                : "Nonaktif"
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Promo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePromotionToggle(promo.id, promo.isActive)}
                              >
                                {promo.isActive ? "Nonaktifkan" : "Aktifkan"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-error">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
        type="pricing"
      />
      <PricingModal 
        isOpen={isPromoModalOpen} 
        onClose={() => setIsPromoModalOpen(false)} 
        type="promotion"
      />
    </div>
  );
}
