import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckSquare,
  Square,
  Edit3,
  Users,
  Package,
  Filter,
  Save,
  X,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Order, Driver } from "@shared/schema";

export default function BulkOperations() {
  const [activeTab, setActiveTab] = useState<'orders' | 'drivers'>('orders');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxSelections] = useState(2); // Max 2 orders as requested

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch drivers
  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { type: 'orders' | 'drivers'; ids: number[]; action: string; value: string }) =>
      apiRequest("POST", "/api/bulk-operations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setSelectedItems(new Set());
      setBulkAction('');
      setBulkValue('');
      toast({
        title: "✅ Berhasil",
        description: `Bulk operation berhasil diterapkan ke ${selectedItems.size} item`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal melakukan bulk operation",
        variant: "destructive",
      });
    },
  });

  const filteredData = activeTab === 'orders' 
    ? orders.filter(order => 
        order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : drivers.filter(driver =>
        driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm)
      );

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (activeTab === 'orders' && newSelected.size >= maxSelections) {
        toast({
          title: "⚠️ Batas Maksimum",
          description: `Maksimal ${maxSelections} orders dapat dipilih sekaligus`,
          variant: "destructive",
        });
        return;
      }
      newSelected.add(id);
    }
    
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      const itemsToSelect = activeTab === 'orders' 
        ? filteredData.slice(0, maxSelections).map(item => item.id)
        : filteredData.map(item => item.id);
      setSelectedItems(new Set(itemsToSelect));
    }
  };

  const handleBulkUpdate = () => {
    if (selectedItems.size === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal satu item untuk di-update",
        variant: "destructive",
      });
      return;
    }

    if (!bulkAction || !bulkValue) {
      toast({
        title: "Error",
        description: "Pilih action dan value untuk bulk operation",
        variant: "destructive",
      });
      return;
    }

    bulkUpdateMutation.mutate({
      type: activeTab,
      ids: Array.from(selectedItems),
      action: bulkAction,
      value: bulkValue
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const orderActions = [
    { value: 'status', label: 'Update Status' },
    { value: 'priority', label: 'Set Priority' },
    { value: 'driver', label: 'Assign Driver' }
  ];

  const driverActions = [
    { value: 'status', label: 'Update Status' },
    { value: 'priority', label: 'Set Priority Level' },
    { value: 'vehicle', label: 'Set Vehicle Type' }
  ];

  const getActionValues = () => {
    switch (bulkAction) {
      case 'status':
        return activeTab === 'orders' 
          ? [
              { value: 'pending', label: 'Pending' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]
          : [
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'pending', label: 'Pending' }
            ];
      case 'priority':
        return [
          { value: 'normal', label: 'Normal' },
          { value: 'priority', label: 'Priority' }
        ];
      case 'vehicle':
        return [
          { value: 'motor', label: 'Motor' },
          { value: 'mobil', label: 'Mobil' },
          { value: 'pickup', label: 'Pickup' }
        ];
      case 'driver':
        return drivers.map(driver => ({
          value: driver.id.toString(),
          label: driver.fullName
        }));
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">⚡ Bulk Operations</h1>
          <p className="text-muted-foreground">
            Edit multiple orders dan drivers secara bersamaan untuk efisiensi maksimal
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          {selectedItems.size} item dipilih
          {activeTab === 'orders' && ` (max ${maxSelections})`}
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'drivers', label: 'Drivers', icon: Users }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedItems(new Set());
              setBulkAction('');
              setBulkValue('');
            }}
            className="flex items-center space-x-2"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Bulk Actions Panel */}
      {selectedItems.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>🔧 Bulk Actions - {selectedItems.size} items selected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih action" />
                  </SelectTrigger>
                  <SelectContent>
                    {(activeTab === 'orders' ? orderActions : driverActions).map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Value</Label>
                <Select value={bulkValue} onValueChange={setBulkValue} disabled={!bulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih value" />
                  </SelectTrigger>
                  <SelectContent>
                    {getActionValues().map((value) => (
                      <SelectItem key={value.value} value={value.value}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  onClick={handleBulkUpdate}
                  disabled={!bulkAction || !bulkValue || bulkUpdateMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {bulkUpdateMutation.isPending ? 'Processing...' : 'Apply Changes'}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedItems(new Set());
                    setBulkAction('');
                    setBulkValue('');
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder={`Cari ${activeTab === 'orders' ? 'alamat pickup/delivery' : 'nama atau nomor HP'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredData.length === 0}
            >
              {selectedItems.size === filteredData.length ? (
                <CheckSquare className="h-4 w-4 mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              {selectedItems.size === filteredData.length ? 'Deselect All' : `Select All ${activeTab === 'orders' ? `(max ${maxSelections})` : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'orders' ? '📦 Orders List' : '👥 Drivers List'}
            {activeTab === 'orders' && (
              <Badge variant="secondary" className="ml-2">
                Max {maxSelections} selections
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.size === filteredData.length && filteredData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                {activeTab === 'orders' ? (
                  <>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Driver Info</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? `Tidak ada ${activeTab} yang sesuai dengan pencarian` : `Belum ada ${activeTab} tersedia`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className={selectedItems.has(item.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                        disabled={
                          activeTab === 'orders' && 
                          !selectedItems.has(item.id) && 
                          selectedItems.size >= maxSelections
                        }
                      />
                    </TableCell>
                    {activeTab === 'orders' ? (
                      <>
                        <TableCell>
                          <div>
                            <p className="font-medium">Order #{item.id}</p>
                            <p className="text-sm text-muted-foreground">
                              📍 {(item as Order).pickupAddress}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              🎯 {(item as Order).deliveryAddress}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>Customer #{(item as Order).customerId}</span>
                        </TableCell>
                        <TableCell>
                          {(item as Order).driverId ? `Driver #${(item as Order).driverId}` : 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor((item as Order).status)}>
                            {(item as Order).status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          Rp {((item as Order).totalFare || 0).toLocaleString('id-ID')}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <div>
                            <p className="font-medium">{(item as Driver).fullName}</p>
                            <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{(item as Driver).phone}</p>
                            <p className="text-sm text-muted-foreground">{(item as Driver).email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{(item as Driver).vehicleType}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor((item as Driver).status)}>
                            {(item as Driver).status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Rating: {(item as Driver).rating || 'N/A'}</div>
                            <div>Orders: {(item as Driver).totalOrders || 0}</div>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Panduan Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                ✅ Best Practices
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pilih items yang serupa untuk efisiensi maksimal</li>
                <li>• Untuk orders: maksimal {maxSelections} orders sekaligus</li>
                <li>• Verifikasi perubahan sebelum apply</li>
                <li>• Gunakan search untuk menemukan items spesifik</li>
                <li>• Monitor hasil perubahan di real-time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                ⚠️ Perhatian
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Bulk operations tidak dapat di-undo</li>
                <li>• Pastikan action yang dipilih sudah benar</li>
                <li>• Status changes akan mempengaruhi workflow</li>
                <li>• Driver assignments akan mengupdate order status</li>
                <li>• Perubahan akan langsung terlihat di dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}