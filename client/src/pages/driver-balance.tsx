import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calculator,
  History,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface Driver {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  balance: number;
  commission: number;
  vehicleType: string;
  status: string;
  totalEarnings: number;
  pendingPayments: number;
}

interface BalanceTransaction {
  id: number;
  driverId: number;
  driverName: string;
  type: 'topup' | 'withdraw' | 'commission' | 'penalty' | 'bonus';
  amount: number;
  description: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function DriverBalance() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [transactionType, setTransactionType] = useState<'topup' | 'withdraw'>('topup');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [newCommission, setNewCommission] = useState('');
  const { toast } = useToast();

  // Fetch drivers data
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['/api/drivers'],
  });

  // Fetch balance transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/driver-transactions'],
  });

  // Balance update mutation
  const balanceMutation = useMutation({
    mutationFn: async (data: { driverId: number; type: string; amount: number; description: string }) => {
      const response = await apiRequest("POST", "/api/driver-balance", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Berhasil!",
        description: "Saldo driver berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/driver-transactions'] });
      setSelectedDriver(null);
      setAmount('');
      setDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "❌ Gagal",
        description: error.message || "Gagal memperbarui saldo driver",
        variant: "destructive",
      });
    }
  });

  // Commission update mutation
  const commissionMutation = useMutation({
    mutationFn: async (data: { driverId: number; commission: number }) => {
      const response = await apiRequest("PATCH", `/api/drivers/${data.driverId}/commission`, {
        commission: data.commission
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Berhasil!",
        description: "Komisi driver berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setSelectedDriver(null);
      setNewCommission('');
    },
    onError: (error: any) => {
      toast({
        title: "❌ Gagal",
        description: error.message || "Gagal memperbarui komisi driver",
        variant: "destructive",
      });
    }
  });

  const handleBalanceUpdate = () => {
    if (!selectedDriver || !amount || !description) {
      toast({
        title: "⚠️ Peringatan",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    balanceMutation.mutate({
      driverId: selectedDriver.id,
      type: transactionType,
      amount: parseFloat(amount),
      description
    });
  };

  const handleCommissionUpdate = () => {
    if (!selectedDriver || !newCommission) {
      toast({
        title: "⚠️ Peringatan",
        description: "Mohon pilih driver dan masukkan komisi baru",
        variant: "destructive",
      });
      return;
    }

    commissionMutation.mutate({
      driverId: selectedDriver.id,
      commission: parseFloat(newCommission)
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTotalBalance = () => {
    return drivers.reduce((total: number, driver: Driver) => total + (driver.balance || 0), 0);
  };

  const getTotalCommissions = () => {
    return drivers.reduce((total: number, driver: Driver) => total + (driver.totalEarnings || 0), 0);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
      case 'bonus':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'withdraw':
      case 'penalty':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case 'commission':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (driversLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data driver...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saldo & Komisi Driver</h1>
          <p className="text-muted-foreground">Kelola saldo dan komisi driver secara terpusat</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo Driver</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalBalance())}</div>
            <p className="text-xs text-muted-foreground">Saldo aktif semua driver</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalCommissions())}</div>
            <p className="text-xs text-muted-foreground">Komisi yang diperoleh driver</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.filter((d: Driver) => d.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Driver dengan status aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total transaksi keuangan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Driver Balance Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Kelola Saldo Driver
            </CardTitle>
            <CardDescription>
              Tambah atau kurangi saldo driver secara manual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {drivers.map((driver: Driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{driver.fullName}</h4>
                    <p className="text-sm text-muted-foreground">{driver.vehicleType} • {driver.phone}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Saldo:</span>
                        <span className="font-bold text-green-600">{formatCurrency(driver.balance || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Komisi:</span>
                        <span className="font-medium text-blue-600">{driver.commission || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDriver(driver)}
                        >
                          <Wallet className="w-4 h-4 mr-1" />
                          Saldo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Kelola Saldo Driver</DialogTitle>
                          <DialogDescription>
                            {selectedDriver?.fullName} - Saldo Saat Ini: {formatCurrency(selectedDriver?.balance || 0)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Jenis Transaksi</Label>
                            <Select value={transactionType} onValueChange={(value: 'topup' | 'withdraw') => setTransactionType(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="topup">Top Up Saldo</SelectItem>
                                <SelectItem value="withdraw">Tarik Saldo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Jumlah</Label>
                            <Input
                              type="number"
                              placeholder="Masukkan jumlah"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Keterangan</Label>
                            <Input
                              placeholder="Keterangan transaksi"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={handleBalanceUpdate}
                            disabled={balanceMutation.isPending}
                          >
                            {balanceMutation.isPending ? "Memproses..." : "Update Saldo"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDriver(driver)}
                        >
                          <Calculator className="w-4 h-4 mr-1" />
                          Komisi
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Komisi Driver</DialogTitle>
                          <DialogDescription>
                            {selectedDriver?.fullName} - Komisi Saat Ini: {selectedDriver?.commission || 0}%
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Komisi Baru (%)</Label>
                            <Input
                              type="number"
                              placeholder="Masukkan persentase komisi"
                              value={newCommission}
                              onChange={(e) => setNewCommission(e.target.value)}
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={handleCommissionUpdate}
                            disabled={commissionMutation.isPending}
                          >
                            {commissionMutation.isPending ? "Memproses..." : "Update Komisi"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Riwayat Transaksi
            </CardTitle>
            <CardDescription>
              Histori transaksi saldo dan komisi driver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactionsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Memuat transaksi...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Banknote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada transaksi</p>
                </div>
              ) : (
                transactions.slice(0, 10).map((transaction: BalanceTransaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-sm">{transaction.driverName}</p>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.createdAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'topup' || transaction.type === 'bonus' || transaction.type === 'commission'
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'withdraw' || transaction.type === 'penalty' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' ? 'Selesai' : 
                         transaction.status === 'pending' ? 'Pending' : 'Gagal'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}