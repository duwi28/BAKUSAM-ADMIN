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
  Truck,
  Crown,
  Users,
  Shield
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
  
  // Balance management states
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedDriverForBalance, setSelectedDriverForBalance] = useState<Driver | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceDescription, setBalanceDescription] = useState("");
  const [balanceType, setBalanceType] = useState<"add" | "deduct">("add");
  
  // Priority management states
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [selectedDriverForPriority, setSelectedDriverForPriority] = useState<Driver | null>(null);
  
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

  // Balance management mutations
  const addBalanceMutation = useMutation({
    mutationFn: ({ driverId, amount, description }: { driverId: number; amount: number; description: string }) =>
      apiRequest("POST", `/api/drivers/${driverId}/balance/add`, { amount, description }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setIsBalanceModalOpen(false);
      setSelectedDriverForBalance(null);
      setBalanceAmount("");
      setBalanceDescription("");
      toast({
        title: "💰 Berhasil",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambah saldo driver",
        variant: "destructive",
      });
    },
  });

  const deductBalanceMutation = useMutation({
    mutationFn: ({ driverId, amount, description }: { driverId: number; amount: number; description: string }) =>
      apiRequest("POST", `/api/drivers/${driverId}/balance/deduct`, { amount, description }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setIsBalanceModalOpen(false);
      setSelectedDriverForBalance(null);
      setBalanceAmount("");
      setBalanceDescription("");
      toast({
        title: "💸 Berhasil",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mengurangi saldo driver",
        variant: "destructive",
      });
    },
  });

  // Priority management mutation
  const updatePriorityMutation = useMutation({
    mutationFn: ({ driverId, priorityLevel }: { driverId: number; priorityLevel: string }) =>
      apiRequest("PATCH", `/api/drivers/${driverId}/priority`, { priorityLevel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setIsPriorityModalOpen(false);
      setSelectedDriverForPriority(null);
      toast({
        title: "👑 Berhasil",
        description: "Level prioritas driver berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui level prioritas driver",
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
    // Set current commission rate from driver data (70% default minimum)
    setCommissionRate([driver.commission || 70]);
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

  // Balance management functions
  const openBalanceModal = (driver: Driver, type: "add" | "deduct") => {
    setSelectedDriverForBalance(driver);
    setBalanceType(type);
    setBalanceAmount("");
    setBalanceDescription("");
    setIsBalanceModalOpen(true);
  };

  // Priority management functions
  const openPriorityModal = (driver: Driver) => {
    setSelectedDriverForPriority(driver);
    setIsPriorityModalOpen(true);
  };

  const togglePriority = (driver: Driver) => {
    const newPriorityLevel = driver.priorityLevel === "priority" ? "normal" : "priority";
    updatePriorityMutation.mutate({
      driverId: driver.id,
      priorityLevel: newPriorityLevel
    });
  };

  const getPriorityIcon = (level: string) => {
    return level === "priority" ? (
      <Crown className="h-4 w-4 text-yellow-500" />
    ) : (
      <Users className="h-4 w-4 text-gray-400" />
    );
  };

  const getPriorityBadge = (level: string) => {
    return level === "priority" ? (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
        👑 Prioritas
      </Badge>
    ) : (
      <Badge variant="secondary">
        👤 Normal
      </Badge>
    );
  };

  const handleBalanceSubmit = () => {
    if (!selectedDriverForBalance || !balanceAmount || !balanceDescription) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(balanceAmount.replace(/\D/g, ""));
    if (amount <= 0) {
      toast({
        title: "Error", 
        description: "Nominal harus lebih besar dari 0",
        variant: "destructive",
      });
      return;
    }

    if (balanceType === "add") {
      addBalanceMutation.mutate({
        driverId: selectedDriverForBalance.id,
        amount,
        description: balanceDescription
      });
    } else {
      deductBalanceMutation.mutate({
        driverId: selectedDriverForBalance.id,
        amount,
        description: balanceDescription
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
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Saldo</TableHead>
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
                          {getPriorityBadge(driver.priorityLevel || "normal")}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePriority(driver)}
                            disabled={updatePriorityMutation.isPending}
                            className="h-6 w-6 p-0"
                          >
                            {getPriorityIcon(driver.priorityLevel || "normal")}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <span className="font-medium text-green-600">
                            💰 Rp {formatCurrency(driver.balance || 0)}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                              onClick={() => openBalanceModal(driver, "add")}
                            >
                              + Tambah
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                              onClick={() => openBalanceModal(driver, "deduct")}
                            >
                              - Kurangi
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{driver.commission || 70}%</Badge>
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
                      max={95}
                      min={70}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>70%</span>
                      <span className="font-medium text-primary">{commissionRate[0]}%</span>
                      <span>95%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">💰 Driver mendapat:</span>
                      <span className="text-lg font-bold text-green-600">{commissionRate[0]}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">🏢 Platform mendapat:</span>
                      <span className="text-lg font-bold text-blue-600">{100 - commissionRate[0]}%</span>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded text-xs text-center">
                      <span className="text-gray-600">Contoh: Dari tarif Rp 50.000</span><br/>
                      <span className="text-green-600 font-medium">Driver: Rp {formatCurrency((50000 * commissionRate[0]) / 100)}</span> | 
                      <span className="text-blue-600 font-medium"> Platform: Rp {formatCurrency((50000 * (100 - commissionRate[0])) / 100)}</span>
                    </div>
                  </div>
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

      {/* Balance Management Modal */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {balanceType === "add" ? "💰 Tambah Saldo Driver" : "💸 Kurangi Saldo Driver"}
            </DialogTitle>
          </DialogHeader>
          {selectedDriverForBalance && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Driver:</p>
                <p className="font-medium">{selectedDriverForBalance.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  Saldo Saat Ini: <span className="font-medium text-green-600">Rp {formatCurrency(selectedDriverForBalance.balance || 0)}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nominal {balanceType === "add" ? "Penambahan" : "Pengurangan"}</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Masukkan nominal (Rp)"
                    value={balanceAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setBalanceAmount(value ? parseInt(value).toLocaleString("id-ID") : "");
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keterangan</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    placeholder="Masukkan keterangan transaksi..."
                    rows={3}
                    value={balanceDescription}
                    onChange={(e) => setBalanceDescription(e.target.value)}
                  />
                </div>
                
                {balanceAmount && (
                  <div className={`p-4 rounded-lg border ${balanceType === "add" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Saldo Sebelumnya:</span>
                        <span className="font-medium">Rp {formatCurrency(selectedDriverForBalance.balance || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{balanceType === "add" ? "Penambahan:" : "Pengurangan:"}</span>
                        <span className={`font-medium ${balanceType === "add" ? "text-green-600" : "text-red-600"}`}>
                          {balanceType === "add" ? "+" : "-"} Rp {balanceAmount}
                        </span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between font-medium">
                        <span>Saldo Setelah:</span>
                        <span className="text-primary">
                          Rp {formatCurrency(
                            balanceType === "add" 
                              ? (selectedDriverForBalance.balance || 0) + parseInt(balanceAmount.replace(/\D/g, "") || "0")
                              : Math.max(0, (selectedDriverForBalance.balance || 0) - parseInt(balanceAmount.replace(/\D/g, "") || "0"))
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsBalanceModalOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleBalanceSubmit} 
                  disabled={addBalanceMutation.isPending || deductBalanceMutation.isPending}
                  className={balanceType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {(addBalanceMutation.isPending || deductBalanceMutation.isPending) 
                    ? "Memproses..." 
                    : balanceType === "add" 
                      ? "💰 Tambah Saldo" 
                      : "💸 Kurangi Saldo"
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Priority Management Modal */}
      <Dialog open={isPriorityModalOpen} onOpenChange={setIsPriorityModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>👑 Pengaturan Prioritas Driver</DialogTitle>
          </DialogHeader>
          {selectedDriverForPriority && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Driver:</p>
                <p className="font-medium">{selectedDriverForPriority.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  Kendaraan: <span className="font-medium">{selectedDriverForPriority.vehicleType}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Status Saat Ini: {getPriorityBadge(selectedDriverForPriority.priorityLevel || "normal")}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-3">📋 Sistem Prioritas 2 Level:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-yellow-800">👑 Prioritas</p>
                        <p className="text-xs text-yellow-600">Mendapat order pertama kali, lebih diutamakan</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800">👤 Normal</p>
                        <p className="text-xs text-gray-600">Mendapat order setelah driver prioritas</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Driver dengan level "Prioritas" akan mendapat order lebih dahulu 
                    dibandingkan driver "Normal" pada semua jenis kendaraan (motor, mobil, pickup).
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPriorityModalOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={() => togglePriority(selectedDriverForPriority)} 
                  disabled={updatePriorityMutation.isPending}
                  className={selectedDriverForPriority.priorityLevel === "priority" 
                    ? "bg-gray-600 hover:bg-gray-700" 
                    : "bg-yellow-600 hover:bg-yellow-700"
                  }
                >
                  {updatePriorityMutation.isPending 
                    ? "Memproses..." 
                    : selectedDriverForPriority.priorityLevel === "priority"
                      ? "👤 Ubah ke Normal"
                      : "👑 Ubah ke Prioritas"
                  }
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
