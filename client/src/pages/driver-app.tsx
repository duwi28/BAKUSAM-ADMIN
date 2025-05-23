import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DriverAppOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  totalFare: string;
  talanganAmount?: string;
  estimatedDuration: number;
  hasAdvance: boolean;
  advanceNote?: string;
  items: string;
}

const DriverApp: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DriverAppOrder | null>(null);
  const [showTalanganModal, setShowTalanganModal] = useState(false);
  const [earnings, setEarnings] = useState({ today: 150000, balance: 850000 });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample orders data (in production, this would come from API)
  const [availableOrders] = useState<DriverAppOrder[]>([
    {
      id: 1,
      customerName: "Andi Wijaya",
      customerPhone: "08223456789",
      pickupAddress: "Mall Central Park",
      deliveryAddress: "Apartemen Taman Anggrek",
      distance: "2.5 km",
      totalFare: "25000",
      talanganAmount: "50000",
      estimatedDuration: 15,
      hasAdvance: true,
      advanceNote: "Bayar tagihan listrik di loket mall",
      items: "Dokumen + Talangan"
    },
    {
      id: 2,
      customerName: "Sari Indah",
      customerPhone: "08334567890",
      pickupAddress: "Restoran Padang Sederhana",
      deliveryAddress: "Kantor BCA Tower",
      distance: "3.1 km",
      totalFare: "32000",
      estimatedDuration: 18,
      hasAdvance: false,
      items: "Makanan"
    },
    {
      id: 3,
      customerName: "Budi Hartono",
      customerPhone: "08445678901",
      pickupAddress: "Apotek Kimia Farma",
      deliveryAddress: "Perumahan Green Garden",
      distance: "4.2 km",
      totalFare: "38000",
      talanganAmount: "75000",
      estimatedDuration: 22,
      hasAdvance: true,
      advanceNote: "Beli obat diabetes sesuai resep",
      items: "Obat-obatan + Talangan"
    }
  ]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    toast({
      title: isOnline ? "Status Offline" : "Status Online",
      description: isOnline ? "Anda tidak akan menerima order baru" : "Siap menerima order baru",
      variant: isOnline ? "destructive" : "default"
    });
  };

  const handleOrderAction = (order: DriverAppOrder) => {
    if (order.hasAdvance) {
      setSelectedOrder(order);
      setShowTalanganModal(true);
    } else {
      acceptRegularOrder(order);
    }
  };

  const acceptRegularOrder = (order: DriverAppOrder) => {
    toast({
      title: "Order Diterima!",
      description: `Order #${order.id} berhasil diterima. Menuju lokasi pickup...`,
    });
    
    // Update earnings
    setEarnings(prev => ({
      ...prev,
      today: prev.today + parseInt(order.totalFare),
      balance: prev.balance + Math.round(parseInt(order.totalFare) * 0.7)
    }));
  };

  const acceptTalanganOrder = () => {
    if (!selectedOrder) return;
    
    const talanganAmount = parseInt(selectedOrder.talanganAmount || "0");
    const commission = Math.round(parseInt(selectedOrder.totalFare) * 0.7);
    
    // Update earnings and balance
    setEarnings(prev => ({
      ...prev,
      today: prev.today + parseInt(selectedOrder.totalFare),
      balance: prev.balance + commission - talanganAmount
    }));

    toast({
      title: "Order Talangan Diterima!",
      description: `Order #${selectedOrder.id} diterima. Talangan: Rp ${talanganAmount.toLocaleString()}`,
    });

    setShowTalanganModal(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`;
  };

  const calculateNetIncome = (order: DriverAppOrder) => {
    const fare = parseInt(order.totalFare);
    const commission = Math.round(fare * 0.7);
    const talangan = parseInt(order.talanganAmount || "0");
    return commission - talangan;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Selamat datang,</h1>
            <h2 className="text-xl font-bold">Budi Santoso</h2>
            <p className="text-sm opacity-90">Motor • Rating: 4.8⭐</p>
            <p className="text-xs opacity-75">
              {currentTime.toLocaleTimeString('id-ID')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-sm block">
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Earnings Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-gray-600 mb-1">Penghasilan Hari Ini</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(earnings.today)}
                </p>
                <p className="text-sm text-gray-600">
                  Saldo: {formatCurrency(earnings.balance)}
                </p>
              </div>
              <Button variant="outline" className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600">
                Tarik Saldo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">
            {isOnline ? "Order Tersedia (Radius 3KM)" : "Status Offline"}
          </h3>

          {!isOnline ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h4 className="text-lg font-semibold mb-2">📴 Anda sedang OFFLINE</h4>
                <p className="text-gray-600">Aktifkan status online untuk menerima order</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Order #{order.id}</span>
                        {order.hasAdvance && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            💰 TALANGAN
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{order.distance}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-sm text-gray-600">
                        📍 {order.pickupAddress} → {order.deliveryAddress}
                      </p>

                      {order.hasAdvance && (
                        <div className="bg-yellow-50 border-l-4 border-orange-500 p-3 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-orange-600">💰</span>
                            <span className="font-bold text-orange-800 text-sm">
                              TALANGAN DIPERLUKAN
                            </span>
                          </div>
                          <p className="font-bold text-orange-800">
                            {formatCurrency(parseInt(order.talanganAmount || "0"))}
                          </p>
                          <p className="text-xs text-orange-700 italic mb-2">
                            {order.advanceNote}
                          </p>
                          <div className="bg-orange-100 p-2 rounded text-xs text-orange-800">
                            ⚠️ Siapkan uang tunai sesuai nominal
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <p className="font-bold text-green-600">
                            Ongkir: {formatCurrency(parseInt(order.totalFare))}
                          </p>
                          {order.hasAdvance && (
                            <p className="text-sm text-orange-600 font-semibold">
                              + Talangan: {formatCurrency(parseInt(order.talanganAmount || "0"))}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {order.estimatedDuration} menit
                          </span>
                          <Button
                            onClick={() => handleOrderAction(order)}
                            className={order.hasAdvance ? "bg-orange-500 hover:bg-orange-600" : ""}
                          >
                            {order.hasAdvance ? "💰 Terima + Talangan" : "Terima"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Talangan Confirmation Modal */}
      <Dialog open={showTalanganModal} onOpenChange={setShowTalanganModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">💰 Konfirmasi Talangan</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Details */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">📋 Detail Order</h4>
                <p>Order #{selectedOrder.id}</p>
                <p>Customer: {selectedOrder.customerName}</p>
                <p>Telepon: {selectedOrder.customerPhone}</p>
              </div>

              {/* Talangan Amount */}
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h4 className="font-bold text-green-800 mb-2">💰 NOMINAL TALANGAN</h4>
                <p className="text-2xl font-bold text-green-900 mb-2">
                  {formatCurrency(parseInt(selectedOrder.talanganAmount || "0"))}
                </p>
                <p className="text-sm text-green-700 italic">
                  Keperluan: {selectedOrder.advanceNote}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">📋 INSTRUKSI TALANGAN</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Siapkan uang tunai sesuai nominal</li>
                  <li>2. Berikan uang kepada customer di pickup</li>
                  <li>3. Minta konfirmasi dari customer</li>
                  <li>4. Lanjutkan pengiriman seperti biasa</li>
                </ol>
              </div>

              {/* Warning */}
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 mb-2">⚠️ PERINGATAN PENTING</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Uang talangan akan dipotong dari saldo Anda</li>
                  <li>• Pastikan nominal sesuai dengan permintaan</li>
                  <li>• Jangan berikan uang sebelum konfirmasi customer</li>
                </ul>
              </div>

              {/* Financial Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">💵 RINGKASAN KEUANGAN</h4>
                <div className="space-y-1 text-sm">
                  <p>Ongkir: {formatCurrency(parseInt(selectedOrder.totalFare))}</p>
                  <p>Komisi Anda (70%): {formatCurrency(Math.round(parseInt(selectedOrder.totalFare) * 0.7))}</p>
                  <p>Talangan: -{formatCurrency(parseInt(selectedOrder.talanganAmount || "0"))}</p>
                  <Separator className="my-2" />
                  <p className="font-bold">
                    Net: {formatCurrency(calculateNetIncome(selectedOrder))}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowTalanganModal(false)}
                >
                  ❌ Tolak Order
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={acceptTalanganOrder}
                >
                  ✅ Terima + Talangan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-lg mb-1">🏠</div>
            <div className="text-xs text-gray-600">Beranda</div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">🗺️</div>
            <div className="text-xs text-gray-600">Peta</div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">💬</div>
            <div className="text-xs text-gray-600">Chat</div>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">👤</div>
            <div className="text-xs text-gray-600">Profil</div>
          </div>
        </div>
      </div>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default DriverApp;