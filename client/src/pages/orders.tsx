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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  MoreHorizontal, 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle,
  MapPin,
  Star
} from "lucide-react";
import { formatCurrency, formatDateTime, getStatusColor, getStatusText, formatDistance } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Order {
  id: number;
  customer: { id: number; fullName: string; phone: string } | null;
  driver: { id: number; fullName: string; phone: string } | null;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  baseFare: string;
  totalFare: string;
  status: string;
  orderDate: string;
  completedDate?: string;
  rating?: number;
  notes?: string;
}

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest("PATCH", `/api/orders/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Berhasil",
        description: "Status order berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui status order",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.driver?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: number, status: string) => {
    const updates: any = { status };
    if (status === "completed") {
      updates.completedDate = new Date().toISOString();
    }
    updateOrderMutation.mutate({ id, updates });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ["pending", "assigned", "pickup", "delivery"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manajemen Order</h1>
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
        <h1 className="text-3xl font-bold text-foreground">Manajemen Order</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Order</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dalam Proses</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dibatalkan</p>
                <p className="text-2xl font-bold text-error">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-y-2 sm:space-y-0 sm:flex-row flex-col">
            <CardTitle>Daftar Order</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="assigned">Ditugaskan</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="delivery">Dalam Perjalanan</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Jarak</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "Tidak ada order yang sesuai dengan filter" 
                      : "Belum ada order"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        #BKS-{order.id.toString().padStart(3, "0")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer?.fullName || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer?.phone || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {order.driver?.fullName || "Belum ditugaskan"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.driver?.phone || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground truncate">
                            {order.pickupAddress}
                          </p>
                        </div>
                        <div className="flex items-start space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground truncate">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatDistance(order.distance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(order.totalFare)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDateTime(order.orderDate)}</p>
                        {order.completedDate && (
                          <p className="text-xs text-muted-foreground">
                            Selesai: {formatDateTime(order.completedDate)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {order.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(order.id, "assigned")}
                            >
                              Tugaskan Driver
                            </DropdownMenuItem>
                          )}
                          {order.status === "assigned" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(order.id, "pickup")}
                            >
                              Menuju Pickup
                            </DropdownMenuItem>
                          )}
                          {order.status === "pickup" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(order.id, "delivery")}
                            >
                              Dalam Perjalanan
                            </DropdownMenuItem>
                          )}
                          {order.status === "delivery" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(order.id, "completed")}
                              className="text-success"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Selesaikan Order
                            </DropdownMenuItem>
                          )}
                          {!["completed", "cancelled"].includes(order.status) && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(order.id, "cancelled")}
                              className="text-error"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Batalkan Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            Detail Order
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
    </div>
  );
}
