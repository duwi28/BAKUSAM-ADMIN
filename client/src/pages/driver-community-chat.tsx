import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageCircle,
  Send,
  Users,
  MapPin,
  AlertTriangle,
  Clock,
  Truck,
  Navigation,
  Star,
  ThumbsUp,
  Share2,
  Filter,
  Volume2,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderVehicle: string;
  message: string;
  type: 'text' | 'traffic' | 'location' | 'alert' | 'tip';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  trafficInfo?: {
    severity: 'ringan' | 'sedang' | 'parah';
    estimatedDelay: number;
    road: string;
  };
  timestamp: string;
  likes: number;
  isLiked: boolean;
  channel: string;
}

interface OnlineDriver {
  id: number;
  name: string;
  vehicleType: string;
  location: string;
  status: 'online' | 'busy' | 'break';
  lastSeen: string;
}

export default function DriverCommunityChat() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'traffic' | 'tip'>('text');
  const [filter, setFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/driver-chat", activeChannel, filter],
    refetchInterval: 3000, // Auto refresh every 3 seconds
  });

  // Fetch online drivers
  const { data: onlineDrivers = [] } = useQuery<OnlineDriver[]>({
    queryKey: ["/api/drivers/online"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/driver-chat/send", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-chat"] });
      setNewMessage('');
      setMessageType('text');
      toast({
        title: "💬 Pesan Terkirim",
        description: "Pesan Anda telah dibagikan ke komunitas driver",
      });
    },
  });

  // Like message mutation
  const likeMessageMutation = useMutation({
    mutationFn: (messageId: number) => apiRequest("POST", "/api/driver-chat/like", { messageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-chat"] });
    },
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      type: messageType,
      channel: activeChannel,
      timestamp: new Date().toISOString()
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleLikeMessage = (messageId: number) => {
    likeMessageMutation.mutate(messageId);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'traffic': return '🚦';
      case 'location': return '📍';
      case 'alert': return '⚠️';
      case 'tip': return '💡';
      default: return '💬';
    }
  };

  const getTrafficSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ringan': return 'bg-yellow-100 text-yellow-800';
      case 'sedang': return 'bg-orange-100 text-orange-800';
      case 'parah': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motor': return '🏍️';
      case 'mobil': return '🚗';
      case 'pickup': return '🚛';
      default: return '🚚';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const channels = [
    { id: 'general', name: '💬 General Chat', desc: 'Obrolan umum' },
    { id: 'traffic', name: '🚦 Info Lalu Lintas', desc: 'Update kondisi jalan' },
    { id: 'tips', name: '💡 Tips & Tricks', desc: 'Berbagi pengalaman' },
    { id: 'alerts', name: '⚠️ Darurat', desc: 'Peringatan penting' }
  ];

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">👥 Driver Community Chat</h1>
          <p className="text-muted-foreground">
            Platform komunikasi real-time untuk sharing info traffic dan tips antar driver
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800">
            <Users className="h-3 w-3 mr-1" />
            {onlineDrivers.length} Online
          </Badge>
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifikasi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Online Drivers */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Driver Online ({onlineDrivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {onlineDrivers.map((driver) => (
                  <div key={driver.id} className="p-3 border-b hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getVehicleIcon(driver.vehicleType)}</span>
                        <span className="font-medium text-sm">{driver.name}</span>
                      </div>
                      <Badge className={getStatusColor(driver.status)} size="sm">
                        {driver.status === 'online' ? '🟢 Online' : 
                         driver.status === 'busy' ? '🔵 Sibuk' : '🟡 Break'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {driver.location}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {driver.lastSeen}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[700px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Tabs value={activeChannel} onValueChange={setActiveChannel} className="flex-1">
                  <TabsList className="grid grid-cols-4 w-full">
                    {channels.map((channel) => (
                      <TabsTrigger key={channel.id} value={channel.id} className="text-xs">
                        {channel.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className="flex items-center space-x-2 ml-4">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="text">💬 Chat</SelectItem>
                      <SelectItem value="traffic">🚦 Traffic</SelectItem>
                      <SelectItem value="tip">💡 Tips</SelectItem>
                      <SelectItem value="alert">⚠️ Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Belum Ada Pesan</h3>
                  <p className="text-muted-foreground">
                    Mulai percakapan dengan mengirim pesan pertama!
                  </p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div key={message.id} className="group">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {getVehicleIcon(message.senderVehicle)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          <span className="text-lg">{getMessageIcon(message.type)}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.timestamp), 'HH:mm', { locale: id })}
                          </span>
                          {message.type !== 'text' && (
                            <Badge variant="outline" className="text-xs">
                              {message.type === 'traffic' ? '🚦 Traffic Info' :
                               message.type === 'tip' ? '💡 Tips' :
                               message.type === 'alert' ? '⚠️ Alert' : '📍 Location'}
                            </Badge>
                          )}
                        </div>

                        {/* Message Content */}
                        <div className="bg-muted rounded-lg p-3 mb-2">
                          <p className="text-sm">{message.message}</p>
                          
                          {/* Traffic Info */}
                          {message.trafficInfo && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">🚦 Info Lalu Lintas</span>
                                <Badge className={getTrafficSeverityColor(message.trafficInfo.severity)}>
                                  {message.trafficInfo.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                <div>📍 Jalan: {message.trafficInfo.road}</div>
                                <div>⏱️ Estimasi Delay: {message.trafficInfo.estimatedDelay} menit</div>
                              </div>
                            </div>
                          )}

                          {/* Location Info */}
                          {message.location && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center mb-2">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="font-medium text-sm">📍 Lokasi</span>
                              </div>
                              <p className="text-sm">{message.location.address}</p>
                              <Button size="sm" variant="outline" className="mt-2">
                                <Navigation className="h-3 w-3 mr-1" />
                                Buka Maps
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Message Actions */}
                        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleLikeMessage(message.id)}
                            className={message.isLiked ? 'text-red-600' : ''}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {message.likes}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2 mb-3">
                <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">💬 Chat Biasa</SelectItem>
                    <SelectItem value="traffic">🚦 Info Traffic</SelectItem>
                    <SelectItem value="tip">💡 Tips & Tricks</SelectItem>
                  </SelectContent>
                </Select>
                {isTyping && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    2 orang sedang mengetik...
                  </Badge>
                )}
              </div>
              
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      messageType === 'traffic' ? '🚦 Bagikan info kondisi lalu lintas...' :
                      messageType === 'tip' ? '💡 Berbagi tips dan pengalaman...' :
                      '💬 Ketik pesan Anda...'
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="resize-none"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setMessageType('traffic')}>
                  🚦 Traffic Alert
                </Button>
                <Button size="sm" variant="outline" onClick={() => setMessageType('tip')}>
                  💡 Share Tips
                </Button>
                <Button size="sm" variant="outline">
                  📍 Share Location
                </Button>
                <Button size="sm" variant="outline">
                  📷 Send Photo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ Yang Dianjurkan:</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• Berbagi info lalu lintas real-time</div>
                <div>• Tips dan tricks delivery yang efisien</div>
                <div>• Lokasi bengkel/SPBU yang bagus</div>
                <div>• Peringatan bahaya jalan atau cuaca</div>
                <div>• Membantu sesama driver</div>
                <div>• Gunakan bahasa yang sopan</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-red-600">❌ Yang Tidak Diperbolehkan:</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• Spam atau pesan berulang</div>
                <div>• Konten yang tidak pantas</div>
                <div>• Informasi palsu atau menyesatkan</div>
                <div>• Promosi bisnis pribadi</div>
                <div>• Bahasa kasar atau menyinggung</div>
                <div>• Membocorkan data customer</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}