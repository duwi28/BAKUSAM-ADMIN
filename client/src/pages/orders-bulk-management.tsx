import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Filter,
  Search,
  MapPin,
  User,
  Phone,
  DollarSign,
  Calendar,
  Star,
  Plus,
  Eye,
  MoreVertical,
  FileText,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Order {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  driverId: number | null;
  driverName: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  baseFare: string;
  totalFare: string;
  status: string;
  priority: string;
  vehicleType: string;
  orderDate: Date | null;
  completedDate: Date | null;
  rating: number | null;
  notes: string | null;
}

export default function OrdersBulkManagement() {
  const [selectedTab, setSelectedTab] = useState("orders");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const { data: drivers } = useQuery({
    queryKey: ['/api/drivers'],
  });

  // Filter orders based on status and search
  const filteredOrders = orders?.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { orderIds: number[]; action: string; value?: any }) =>
      apiRequest("POST", "/api/orders/bulk-update", data),
    onSuccess: () => {
      toast({ title: "Bulk operation berhasil!" });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setSelectedOrders([]);
    },
    onError: () => {
      toast({ title: "Bulk operation gagal!", variant: "destructive" });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const maxSelectable = Math.min(filteredOrders.length, 10);
      setSelectedOrders(filteredOrders.slice(0, maxSelectable).map(order => order.id));
      
      if (filteredOrders.length > 10) {
        toast({ 
          title: "Batas maksimal tercapai!", 
          description: "Hanya 10 order pertama yang dipilih. Untuk efisiensi sistem, maksimal 10 order per bulk operation.",
          variant: "default"
        });
      }
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      if (selectedOrders.length >= 10) {
        toast({ 
          title: "Batas maksimal tercapai!", 
          description: "Maksimal 10 order dapat dipilih untuk bulk operation. Hapus seleksi order lain terlebih dahulu.",
          variant: "destructive"
        });
        return;
      }
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleBulkAction = () => {
    if (selectedOrders.length === 0) {
      toast({ title: "Pilih minimal satu order!", variant: "destructive" });
      return;
    }

    if (!bulkAction) {
      toast({ title: "Pilih aksi yang akan dilakukan!", variant: "destructive" });
      return;
    }

    bulkUpdateMutation.mutate({
      orderIds: selectedOrders,
      action: bulkAction
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      picked_up: "bg-purple-100 text-purple-800",
      in_transit: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'picked_up': return <Package className="h-4 w-4" />;
      case 'in_transit': return <MapPin className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-blue-600" />
            Orders & Bulk Management
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola order dan lakukan operasi massal dengan mudah
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Order Baru
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-blue-900">{orders?.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {orders?.filter(o => o.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">In Transit</p>
                <p className="text-3xl font-bold text-orange-900">
                  {orders?.filter(o => o.status === 'in_transit').length || 0}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Delivered</p>
                <p className="text-3xl font-bold text-green-900">
                  {orders?.filter(o => o.status === 'delivered').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Selected</p>
                <p className="text-3xl font-bold text-purple-900">{selectedOrders.length}</p>
              </div>
              <Edit className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Orders Management Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold">
                <Filter className="h-5 w-5 mr-2 text-gray-600" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Cari customer, alamat pickup/delivery..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg font-bold">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Daftar Orders ({filteredOrders.length})
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedOrders.length === Math.min(filteredOrders.length, 10) && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select All (Max 10)</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedOrders.length >= 10 ? 'bg-red-100 text-red-800' : 
                  selectedOrders.length >= 7 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedOrders.length}/10 selected
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        />
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900">#{order.id}</h3>
                            <Badge className={getStatusBadge(order.status)}>
                              {order.status}
                            </Badge>
                            {order.priority === 'high' && (
                              <Badge className="bg-red-100 text-red-800">Priority</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-1">
                            <User className="h-4 w-4 inline mr-1" />
                            {order.customerName} • {order.customerPhone}
                          </p>
                          <p className="text-sm text-gray-500">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {order.pickupAddress} → {order.deliveryAddress}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>{order.vehicleType}</span>
                            <span>{order.distance}</span>
                            {order.driverName && (
                              <span>Driver: {order.driverName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 mb-1">
                          {formatCurrency(order.totalFare)}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(order.orderDate)}
                        </p>
                        {order.rating && (
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{order.rating}</span>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-6">
          {/* Bulk Actions Panel */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold">
                <Edit className="h-5 w-5 mr-2 text-purple-600" />
                Bulk Operations Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Orders
                  </label>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-800">{selectedOrders.length}</p>
                    <p className="text-sm text-purple-600">orders selected</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulk Action
                  </label>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih aksi..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_driver">Assign Driver</SelectItem>
                      <SelectItem value="update_status">Update Status</SelectItem>
                      <SelectItem value="set_priority">Set Priority</SelectItem>
                      <SelectItem value="cancel_orders">Cancel Orders</SelectItem>
                      <SelectItem value="export_data">Export Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleBulkAction}
                    disabled={selectedOrders.length === 0 || !bulkAction || bulkUpdateMutation.isPending}
                    className="w-full"
                  >
                    {bulkUpdateMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    Execute Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-bold">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Quick Bulk Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="font-medium">Mark as Delivered</span>
                  <span className="text-xs text-gray-500">Bulk complete orders</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Auto Assign</span>
                  <span className="text-xs text-gray-500">AI driver matching</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Download className="h-6 w-6 text-purple-600" />
                  <span className="font-medium">Export Selected</span>
                  <span className="text-xs text-gray-500">Download as Excel</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <span className="font-medium">Cancel Orders</span>
                  <span className="text-xs text-gray-500">Bulk cancellation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'].map(status => {
                    const count = orders?.filter(o => o.status === status).length || 0;
                    const percentage = orders?.length ? (count / orders.length * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status)}
                          <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bulk Operations */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-bold">
                  <Edit className="h-5 w-5 mr-2 text-purple-600" />
                  Recent Bulk Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Bulk Status Update</p>
                      <p className="text-sm text-green-600">15 orders marked as delivered</p>
                    </div>
                    <span className="text-xs text-green-600">2 min ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Auto Assignment</p>
                      <p className="text-sm text-blue-600">8 orders assigned to drivers</p>
                    </div>
                    <span className="text-xs text-blue-600">5 min ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-800">Data Export</p>
                      <p className="text-sm text-purple-600">23 orders exported to Excel</p>
                    </div>
                    <span className="text-xs text-purple-600">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}