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
import PriorityManagement from "@/components/priority-management";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import DriverModal from "@/components/modals/driver-modal";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Edit,
  Star,
  Settings,
  Percent,
  Bike,
  Car,
  Truck
} from "lucide-react";
import { formatDate, getStatusColor, getStatusText, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Driver } from "@shared/schema";

export default function Drivers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("motor");
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [selectedDriverForCommission, setSelectedDriverForCommission] = useState<Driver | null>(null);
  const [commissionRate, setCommissionRate] = useState([70]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Driver> }) =>
      apiRequest("PATCH", `/api/drivers/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Berhasil",
        description: "Status driver berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Gagal memperbarui status driver",
        variant: "destructive",
      });
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: ({ driverId, commission }: { driverId: number; commission: number }) =>
      apiRequest("PATCH", `/api/drivers/${driverId}/commission`, { commission }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setIsCommissionModalOpen(false);
      setSelectedDriverForCommission(null);
      toast({
        title: "Berhasil",
        description: "Komisi driver berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui komisi driver",
        variant: "destructive",
      });
    },
  });

  // Filter drivers by vehicle type and search term
  const getFilteredDriversByType = (vehicleType: string) => {
    return drivers.filter(
      (driver) =>
        driver.vehicleType === vehicleType &&
        (driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const motorDrivers = getFilteredDriversByType("motor");
  const mobilDrivers = getFilteredDriversByType("mobil");
  const pickupDrivers = getFilteredDriversByType("pickup");

  const handleStatusChange = (id: number, status: string) => {
    updateDriverMutation.mutate({ id, updates: { status } });
  };

  const handleCommissionChange = (driver: Driver) => {
    setSelectedDriverForCommission(driver);
    // Set current commission rate (assume 70% default for now)
    setCommissionRate([70]);
    setIsCommissionModalOpen(true);
  };

  const saveCommissionRate = () => {
    if (selectedDriverForCommission) {
      updateCommissionMutation.mutate({
        driverId: selectedDriverForCommission.id,
        commission: commissionRate[0]
      });
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "motor": return <Bike className="h-4 w-4" />;
      case "mobil": return <Car className="h-4 w-4" />;
      case "pickup": return <Truck className="h-4 w-4" />;
      default: return <Bike className="h-4 w-4" />;
    }
  };

  const getVehicleStats = (vehicleType: string) => {
    const typeDrivers = drivers.filter(d => d.vehicleType === vehicleType);
    return {
      total: typeDrivers.length,
      active: typeDrivers.filter(d => d.status === "active").length,
      suspended: typeDrivers.filter(d => d.status === "suspended").length,
      pending: typeDrivers.filter(d => d.status === "pending").length,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manajemen Driver</h1>
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

  // Component for rendering driver table
  const renderDriverTable = (driversData: Driver[], vehicleType: string) => {
    const stats = getVehicleStats(vehicleType);
    
    return (
      <div className="space-y-6">
        {/* Vehicle Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Driver {vehicleType}</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                {getVehicleIcon(vehicleType)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif</p>
                  <p className="text-2xl font-bold text-success">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ditangguhkan</p>
                  <p className="text-2xl font-bold text-warning">{stats.suspended}</p>
                </div>
                <UserX className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
                </div>
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drivers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">Daftar Driver {vehicleType}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Total Order</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Komisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driversData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Tidak ada driver yang sesuai dengan pencarian" : `Belum ada driver ${vehicleType} terdaftar`}
                    </TableCell>
                  </TableRow>
                ) : (
                  driversData.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{driver.fullName}</p>
                          <p className="text-sm text-muted-foreground">ID: {driver.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-foreground">{driver.phone}</p>
                          <p className="text-sm text-muted-foreground">{driver.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{driver.totalOrders || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{driver.rating || "4.5"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">70%</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommissionChange(driver)}
                          >
                            <Percent className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(driver.status)}>
                          {getStatusText(driver.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {driver.joinDate ? formatDate(driver.joinDate) : "-"}
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
                              Edit Driver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCommissionChange(driver)}>
                              <Percent className="h-4 w-4 mr-2" />
                              Atur Komisi
                            </DropdownMenuItem>
                            {driver.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(driver.id, "suspended")}
                                className="text-warning"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Tangguhkan
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(driver.id, "active")}
                                className="text-success"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Aktifkan
                              </DropdownMenuItem>
                            )}
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Manajemen Driver</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Driver
          </Button>
        </div>
      </div>

      {/* Tabs for Vehicle Types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="motor" className="flex items-center space-x-2">
            <Bike className="h-4 w-4" />
            <span>Driver Motor ({motorDrivers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="mobil" className="flex items-center space-x-2">
            <Car className="h-4 w-4" />
            <span>Driver Mobil ({mobilDrivers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pickup" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Driver Pickup ({pickupDrivers.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="motor">
          {renderDriverTable(motorDrivers, "motor")}
        </TabsContent>

        <TabsContent value="mobil">
          {renderDriverTable(mobilDrivers, "mobil")}
        </TabsContent>

        <TabsContent value="pickup">
          {renderDriverTable(pickupDrivers, "pickup")}
        </TabsContent>
      </Tabs>

      {/* Commission Modal */}
      <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Komisi Driver</DialogTitle>
          </DialogHeader>
          {selectedDriverForCommission && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Driver:</p>
                <p className="font-medium">{selectedDriverForCommission.fullName}</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Persentase Komisi</label>
                  <div className="space-y-3">
                    <Slider
                      value={commissionRate}
                      onValueChange={setCommissionRate}
                      max={30}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>5%</span>
                      <span className="font-medium text-primary">{commissionRate[0]}%</span>
                      <span>30%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Driver mendapat:</span> {commissionRate[0]}%
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Platform mendapat:</span> {100 - commissionRate[0]}%
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCommissionModalOpen(false)}>
                  Batal
                </Button>
                <Button onClick={saveCommissionRate} disabled={updateCommissionMutation.isPending}>
                  {updateCommissionMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
