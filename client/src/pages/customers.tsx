import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  Search, 
  MoreHorizontal, 
  Users, 
  UserCheck, 
  UserX, 
  Edit,
  Shield,
  Plus,
  Save,
  X,
  Check,
  Phone,
  MapPin,
  User
} from "lucide-react";
import { formatDate, getStatusColor, getStatusText } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Customer } from "@shared/schema";

interface EditableCustomer {
  id?: number;
  fullName: string;
  phone: string;
  address: string;
  email?: string;
  isEditing?: boolean;
  isNew?: boolean;
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [newCustomer, setNewCustomer] = useState<EditableCustomer | null>(null);
  const [editValues, setEditValues] = useState<Record<number, EditableCustomer>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Customer> }) =>
      apiRequest("PATCH", `/api/customers/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Berhasil",
        description: "Data customer berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui data customer",
        variant: "destructive",
      });
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: (newCustomerData: Omit<EditableCustomer, 'id' | 'isEditing' | 'isNew'>) =>
      apiRequest("POST", "/api/customers", newCustomerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setNewCustomer(null);
      toast({
        title: "Berhasil",
        description: "Customer baru berhasil ditambahkan",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Gagal menambahkan customer baru",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: number, status: string) => {
    updateCustomerMutation.mutate({ id, updates: { status } });
  };

  const startEditing = (customer: Customer) => {
    setEditingRows(prev => new Set(prev).add(customer.id));
    setEditValues(prev => ({
      ...prev,
      [customer.id]: {
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address || '',
        email: customer.email
      }
    }));
  };

  const cancelEditing = (id: number) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const saveCustomer = (id: number) => {
    const editData = editValues[id];
    if (!editData) return;

    updateCustomerMutation.mutate({
      id,
      updates: {
        fullName: editData.fullName,
        phone: editData.phone,
        address: editData.address,
        email: editData.email
      }
    });

    cancelEditing(id);
  };

  const updateEditValue = (id: number, field: keyof EditableCustomer, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const addNewCustomer = () => {
    setNewCustomer({
      fullName: '',
      phone: '',
      address: '',
      email: '',
      isNew: true
    });
  };

  const saveNewCustomer = () => {
    if (!newCustomer) return;

    if (!newCustomer.fullName.trim() || !newCustomer.phone.trim()) {
      toast({
        title: "Error",
        description: "Nama dan nomor telepon harus diisi",
        variant: "destructive",
      });
      return;
    }

    createCustomerMutation.mutate({
      fullName: newCustomer.fullName.trim(),
      phone: newCustomer.phone.trim(),
      address: newCustomer.address.trim(),
      email: newCustomer.email?.trim()
    });
  };

  const cancelNewCustomer = () => {
    setNewCustomer(null);
  };

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === "active").length,
    blocked: customers.filter(c => c.status === "blocked").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manajemen Customer</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-foreground">Manajemen Customer</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customer</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Aktif</p>
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
                <p className="text-sm text-muted-foreground">Customer Diblokir</p>
                <p className="text-2xl font-bold text-error">{stats.blocked}</p>
              </div>
              <UserX className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Customer</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button 
                onClick={addNewCustomer}
                disabled={!!newCustomer}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Total Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Bergabung</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Row untuk menambah customer baru */}
              {newCustomer && (
                <TableRow className="bg-green-50 border-green-200">
                  <TableCell>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nama lengkap customer..."
                        value={newCustomer.fullName}
                        onChange={(e) => setNewCustomer({...newCustomer, fullName: e.target.value})}
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nomor telepon..."
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        className="border-green-300 focus:border-green-500"
                      />
                      <Input
                        placeholder="Email (opsional)..."
                        type="email"
                        value={newCustomer.email || ''}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Alamat pickup customer..."
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                      className="border-green-300 focus:border-green-500 min-h-[60px]"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">0</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Baru</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">Hari ini</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="sm" 
                        onClick={saveNewCustomer}
                        disabled={createCustomerMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Simpan
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelNewCustomer}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Batal
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {filteredCustomers.length === 0 && !newCustomer ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Tidak ada customer yang sesuai dengan pencarian" : "Belum ada customer terdaftar"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const isEditing = editingRows.has(customer.id);
                  const editData = editValues[customer.id];

                  return (
                    <TableRow key={customer.id} className={isEditing ? "bg-blue-50 border-blue-200" : ""}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editData?.fullName || ''}
                            onChange={(e) => updateEditValue(customer.id, 'fullName', e.target.value)}
                            className="border-blue-300 focus:border-blue-500"
                            placeholder="Nama lengkap..."
                          />
                        ) : (
                          <div>
                            <p className="font-medium text-foreground">{customer.fullName}</p>
                            <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={editData?.phone || ''}
                              onChange={(e) => updateEditValue(customer.id, 'phone', e.target.value)}
                              className="border-blue-300 focus:border-blue-500"
                              placeholder="Nomor telepon..."
                            />
                            <Input
                              value={editData?.email || ''}
                              onChange={(e) => updateEditValue(customer.id, 'email', e.target.value)}
                              className="border-blue-300 focus:border-blue-500"
                              placeholder="Email..."
                              type="email"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-foreground">{customer.phone}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Textarea
                            value={editData?.address || ''}
                            onChange={(e) => updateEditValue(customer.id, 'address', e.target.value)}
                            className="border-blue-300 focus:border-blue-500 min-h-[60px]"
                            placeholder="Alamat pickup..."
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm text-foreground max-w-[200px] truncate">
                            {customer.address || "-"}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{customer.totalOrders}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {getStatusText(customer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.joinDate ? formatDate(customer.joinDate) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => saveCustomer(customer.id)}
                              disabled={updateCustomerMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Simpan
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => cancelEditing(customer.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEditing(customer)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                              </DropdownMenuItem>
                              {customer.status === "active" ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(customer.id, "blocked")}
                                  className="text-error"
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Blokir Customer
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(customer.id, "active")}
                                  className="text-success"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Aktifkan Customer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
