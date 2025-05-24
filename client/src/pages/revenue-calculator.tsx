import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Percent
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CommissionRule {
  id: number;
  vehicleType: string;
  baseCommission: number; // percentage
  bonusThreshold: number; // orders count
  bonusCommission: number; // additional percentage
  priorityBonus: number; // additional percentage for priority drivers
}

interface DriverRevenue {
  driverId: number;
  driverName: string;
  vehicleType: string;
  priority: string;
  completedOrders: number;
  totalRevenue: number;
  baseCommission: number;
  bonusCommission: number;
  priorityBonus: number;
  totalCommission: number;
  netEarnings: number;
}

export default function RevenueCalculator() {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [calculationStatus, setCalculationStatus] = useState<'idle' | 'calculating' | 'completed'>('idle');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch commission rules
  const { data: commissionRules = [] } = useQuery<CommissionRule[]>({
    queryKey: ["/api/commission-rules"],
  });

  // Fetch driver revenues
  const { data: driverRevenues = [] } = useQuery<DriverRevenue[]>({
    queryKey: ["/api/driver-revenues", selectedPeriod, selectedDriver],
  });

  // Fetch drivers list
  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
  });

  // Calculate commission mutation
  const calculateCommissionMutation = useMutation({
    mutationFn: (data: { period: string; driverIds?: number[] }) =>
      apiRequest("POST", "/api/calculate-commissions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-revenues"] });
      setCalculationStatus('completed');
      toast({
        title: "💰 Berhasil",
        description: "Kalkulasi komisi kurir berhasil diperbarui",
      });
    },
    onError: () => {
      setCalculationStatus('idle');
      toast({
        title: "Error",
        description: "Gagal menghitung komisi kurir",
        variant: "destructive",
      });
    },
  });

  const handleCalculateCommission = () => {
    setCalculationStatus('calculating');
    calculateCommissionMutation.mutate({
      period: selectedPeriod,
      driverIds: selectedDriver === 'all' ? undefined : [parseInt(selectedDriver)]
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getTotalStats = () => {
    return {
      totalDrivers: driverRevenues.length,
      totalOrders: driverRevenues.reduce((sum, driver) => sum + driver.completedOrders, 0),
      totalRevenue: driverRevenues.reduce((sum, driver) => sum + driver.totalRevenue, 0),
      totalCommissions: driverRevenues.reduce((sum, driver) => sum + driver.totalCommission, 0),
      avgCommissionRate: driverRevenues.length > 0 
        ? driverRevenues.reduce((sum, driver) => sum + (driver.totalCommission / driver.totalRevenue * 100), 0) / driverRevenues.length
        : 0
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">💰 Revenue Calculator</h1>
          <p className="text-muted-foreground">
            Kalkulasi komisi kurir otomatis berdasarkan performa dan aturan yang ditetapkan
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleCalculateCommission}
            disabled={calculationStatus === 'calculating'}
            className="bg-green-600 hover:bg-green-700"
          >
            {calculationStatus === 'calculating' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            {calculationStatus === 'calculating' ? 'Menghitung...' : 'Hitung Ulang Komisi'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Periode</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="this_week">Minggu Ini</SelectItem>
                  <SelectItem value="this_month">Bulan Ini</SelectItem>
                  <SelectItem value="last_month">Bulan Lalu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Driver</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Driver</SelectItem>
                  {drivers.map((driver: any) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalDrivers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCommissions)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Commission Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgCommissionRate.toFixed(1)}%</p>
              </div>
              <Percent className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>⚙️ Aturan Komisi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Kendaraan</TableHead>
                <TableHead>Base Commission</TableHead>
                <TableHead>Bonus Threshold</TableHead>
                <TableHead>Bonus Commission</TableHead>
                <TableHead>Priority Bonus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada aturan komisi yang ditetapkan
                  </TableCell>
                </TableRow>
              ) : (
                commissionRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge className="capitalize">
                        {rule.vehicleType === 'motor' ? '🏍️' : rule.vehicleType === 'mobil' ? '🚗' : '🚛'} {rule.vehicleType}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.baseCommission}%</TableCell>
                    <TableCell>{rule.bonusThreshold} orders</TableCell>
                    <TableCell>+{rule.bonusCommission}%</TableCell>
                    <TableCell>+{rule.priorityBonus}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Driver Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>💼 Kalkulasi Revenue & Komisi Driver</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Kendaraan</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Base Commission</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Priority Bonus</TableHead>
                <TableHead>Total Commission</TableHead>
                <TableHead>Net Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverRevenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Belum ada data revenue driver untuk periode yang dipilih
                  </TableCell>
                </TableRow>
              ) : (
                driverRevenues.map((driver) => (
                  <TableRow key={driver.driverId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{driver.driverName}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge className={driver.priority === 'priority' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                            {driver.priority === 'priority' ? '⭐ Priority' : '👤 Normal'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {driver.vehicleType === 'motor' ? '🏍️' : driver.vehicleType === 'mobil' ? '🚗' : '🚛'} {driver.vehicleType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{driver.completedOrders}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(driver.totalRevenue)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatCurrency(driver.baseCommission)}</div>
                        <div className="text-muted-foreground">
                          {((driver.baseCommission / driver.totalRevenue) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-green-600">+{formatCurrency(driver.bonusCommission)}</div>
                        {driver.bonusCommission > 0 && (
                          <div className="text-muted-foreground">Bonus achieved</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-purple-600">+{formatCurrency(driver.priorityBonus)}</div>
                        {driver.priority === 'priority' && (
                          <div className="text-muted-foreground">Priority driver</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatCurrency(driver.totalCommission)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-blue-600">
                        {formatCurrency(driver.netEarnings)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {driverRevenues.length > 0 && (
              <TableRow className="font-semibold bg-muted/50">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell>{formatCurrency(stats.totalRevenue)}</TableCell>
                <TableCell>{formatCurrency(driverRevenues.reduce((sum, d) => sum + d.baseCommission, 0))}</TableCell>
                <TableCell className="text-green-600">
                  +{formatCurrency(driverRevenues.reduce((sum, d) => sum + d.bonusCommission, 0))}
                </TableCell>
                <TableCell className="text-purple-600">
                  +{formatCurrency(driverRevenues.reduce((sum, d) => sum + d.priorityBonus, 0))}
                </TableCell>
                <TableCell className="text-green-600">
                  {formatCurrency(stats.totalCommissions)}
                </TableCell>
                <TableCell className="text-blue-600">
                  {formatCurrency(driverRevenues.reduce((sum, d) => sum + d.netEarnings, 0))}
                </TableCell>
              </TableRow>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Calculation Info */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Informasi Kalkulasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🔢 Formula Kalkulasi</h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <div><strong>Base Commission:</strong> Total Revenue × Base Rate</div>
                <div><strong>Bonus Commission:</strong> Bonus Rate (jika threshold tercapai)</div>
                <div><strong>Priority Bonus:</strong> Bonus tambahan untuk driver priority</div>
                <div><strong>Total Commission:</strong> Base + Bonus + Priority Bonus</div>
                <div><strong>Net Earnings:</strong> Total Commission (siap dibayar)</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏰ Status Kalkulasi</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className={calculationStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {calculationStatus === 'completed' ? '✅ Up to date' : calculationStatus === 'calculating' ? '⏳ Calculating...' : '⚠️ Needs update'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Kalkulasi otomatis setiap hari pada pukul 23:59 WIB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}