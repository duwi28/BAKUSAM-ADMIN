import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Bell,
  Send,
  Smartphone,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Zap,
  MessageSquare,
  Volume2,
  Vibrate
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PushNotification {
  id: number;
  title: string;
  message: string;
  type: 'order_new' | 'order_update' | 'system' | 'emergency' | 'promo';
  targetType: 'all' | 'specific' | 'role' | 'status';
  targetIds: number[];
  scheduledAt?: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sound: boolean;
  vibration: boolean;
  clickAction?: string;
  deliveryCount: number;
  readCount: number;
}

interface NotificationTemplate {
  id: number;
  name: string;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
}

export default function PushNotifications() {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates' | 'settings'>('send');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    targetType: 'all',
    targetIds: [],
    priority: 'normal',
    sound: true,
    vibration: true,
    scheduledAt: '',
    clickAction: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications history
  const { data: notifications = [] } = useQuery<PushNotification[]>({
    queryKey: ["/api/push-notifications"],
  });

  // Fetch notification templates
  const { data: templates = [] } = useQuery<NotificationTemplate[]>({
    queryKey: ["/api/notification-templates"],
  });

  // Fetch drivers for targeting
  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (notificationData: any) => apiRequest("POST", "/api/push-notifications/send", notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/push-notifications"] });
      resetForm();
      toast({
        title: "🚀 Berhasil",
        description: "Push notification berhasil dikirim ke kurir",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mengirim push notification",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'system',
      targetType: 'all',
      targetIds: [],
      priority: 'normal',
      sound: true,
      vibration: true,
      scheduledAt: '',
      clickAction: ''
    });
  };

  const handleSendNotification = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Judul dan pesan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    sendNotificationMutation.mutate(formData);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order_new': return 'bg-green-100 text-green-800';
      case 'order_update': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'promo': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'order_new': return 'Order Baru';
      case 'order_update': return 'Update Order';
      case 'system': return 'Sistem';
      case 'emergency': return 'Darurat';
      case 'promo': return 'Promosi';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const stats = {
    totalSent: notifications.filter(n => n.status === 'sent').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    deliveryRate: notifications.length > 0 ? 
      Math.round((notifications.filter(n => n.status === 'sent').length / notifications.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🔔 Push Notifications</h1>
          <p className="text-muted-foreground">
            Kirim notifikasi real-time ke aplikasi driver untuk order baru dan update penting
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Terkirim</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalSent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gagal</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold text-blue-600">{stats.deliveryRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'send', label: 'Kirim Notifikasi', icon: Send },
          { id: 'history', label: 'Riwayat', icon: Clock },
          { id: 'templates', label: 'Template', icon: MessageSquare },
          { id: 'settings', label: 'Pengaturan', icon: Settings }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1"
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>📱 Kirim Push Notification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Notifikasi *</Label>
                  <Input
                    id="title"
                    placeholder="Contoh: Order Baru Tersedia!"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Pesan *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tulis pesan notifikasi yang akan dikirim ke kurir..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jenis Notifikasi</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order_new">📦 Order Baru</SelectItem>
                      <SelectItem value="order_update">🔄 Update Order</SelectItem>
                      <SelectItem value="system">⚙️ Sistem</SelectItem>
                      <SelectItem value="emergency">🚨 Darurat</SelectItem>
                      <SelectItem value="promo">🎁 Promosi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Penerima</Label>
                  <Select value={formData.targetType} onValueChange={(value) => setFormData({...formData, targetType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">👥 Semua Kurir</SelectItem>
                      <SelectItem value="online">🟢 Kurir Online</SelectItem>
                      <SelectItem value="priority">⭐ Kurir Priority</SelectItem>
                      <SelectItem value="specific">👤 Kurir Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioritas</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🔵 Rendah</SelectItem>
                      <SelectItem value="normal">⚪ Normal</SelectItem>
                      <SelectItem value="high">🟠 Tinggi</SelectItem>
                      <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4" />
                      <Label>Suara Notifikasi</Label>
                    </div>
                    <Switch
                      checked={formData.sound}
                      onCheckedChange={(checked) => setFormData({...formData, sound: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Vibrate className="h-4 w-4" />
                      <Label>Getaran</Label>
                    </div>
                    <Switch
                      checked={formData.vibration}
                      onCheckedChange={(checked) => setFormData({...formData, vibration: checked})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">📱 Preview Notifikasi</h4>
              <div className="bg-white border rounded-lg p-4 max-w-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Bell className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{formData.title || 'Judul Notifikasi'}</p>
                    <p className="text-sm text-muted-foreground">{formData.message || 'Pesan notifikasi akan ditampilkan di sini'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Bakusam Express • Sekarang</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={resetForm}>
                Bersihkan
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={sendNotificationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendNotificationMutation.isPending ? 'Mengirim...' : 'Kirim Notifikasi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>📜 Riwayat Push Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notifikasi</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada riwayat push notification
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {notification.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(notification.type)}>
                          {getTypeText(notification.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {notification.targetType === 'all' ? 'Semua Kurir' : 
                           notification.targetType === 'online' ? 'Kurir Online' : 
                           notification.targetType === 'priority' ? 'Kurir Priority' : 
                           `${notification.targetIds.length} Kurir`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(notification.status)}
                          <span className="text-sm capitalize">{notification.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{notification.deliveryCount} terkirim</div>
                          <div className="text-muted-foreground">{notification.readCount} dibaca</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {notification.sentAt ? new Date(notification.sentAt).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Templates & Settings tabs would be implemented similarly */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Template Notifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Fitur template notifikasi akan tersedia segera
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Pengaturan Push Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Pengaturan push notification akan tersedia segera
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}