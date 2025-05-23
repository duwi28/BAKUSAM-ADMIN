import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const BakusamDriverEnhanced = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, balance: 0 });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Photo proof states
  const [showProofModal, setShowProofModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [completingOrder, setCompletingOrder] = useState(false);

  const scrollViewRef = useRef();

  // Initialize demo data
  useEffect(() => {
    const demoDriver = {
      id: 1,
      fullName: "Budi Santoso",
      phone: "08123456789",
      vehicleType: "motor",
      rating: "4.8",
      status: "active"
    };
    
    const demoOrders = [
      {
        id: 1,
        pickupAddress: "Mall Central Park",
        deliveryAddress: "Apartemen Taman Anggrek",
        distance: "2.5 km",
        totalFare: "25000",
        estimatedDuration: 15,
        customer: { fullName: "Andi Wijaya", phone: "08223456789" }
      },
      {
        id: 2,
        pickupAddress: "Restoran Padang Sederhana",
        deliveryAddress: "Kantor BCA Tower",
        distance: "3.1 km",
        totalFare: "32000",
        estimatedDuration: 18,
        customer: { fullName: "Sari Indah", phone: "08334567890" }
      }
    ];

    const demoEarnings = {
      today: 150000,
      thisMonth: 4500000,
      balance: 850000,
      commissionRate: 0.7
    };

    // Demo chat messages
    const demoMessages = [
      {
        id: 1,
        text: "Selamat datang di customer support Bakusam Express! Ada yang bisa kami bantu?",
        isAdmin: true,
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString()
      },
      {
        id: 2,
        text: "Halo admin, terima kasih sudah tersedia 24/7",
        isAdmin: false,
        timestamp: new Date(Date.now() - 3300000).toLocaleTimeString()
      }
    ];

    setDriver(demoDriver);
    setAvailableOrders(demoOrders);
    setEarnings(demoEarnings);
    setMessages(demoMessages);
    setIsLoggedIn(true);
  }, []);

  const handleLogin = async (phone) => {
    setLoading(true);
    setTimeout(() => {
      Alert.alert("Login Berhasil", `Selamat datang, ${driver?.fullName}!`);
      setIsLoggedIn(true);
      setLoading(false);
    }, 1500);
  };

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (newStatus) {
      Alert.alert("Status Online", "Anda sekarang dapat menerima order baru");
      startLocationTracking();
    } else {
      Alert.alert("Status Offline", "Anda tidak akan menerima order baru");
    }
  };

  const startLocationTracking = () => {
    const jakartaLocation = {
      latitude: -6.2088,
      longitude: 106.8456
    };
    setCurrentLocation(jakartaLocation);
  };

  const acceptOrder = async (order) => {
    setLoading(true);
    setTimeout(() => {
      setActiveOrder(order);
      setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
      setShowOrderModal(false);
      Alert.alert("Order Diterima", `Order #${order.id} berhasil diterima`);
      setLoading(false);
    }, 1000);
  };

  // Chat functions
  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now(),
      text: newMessage,
      isAdmin: false,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Auto-reply from admin
    setIsTyping(true);
    setTimeout(() => {
      const adminReply = {
        id: Date.now() + 1,
        text: getAdminReply(newMessage),
        isAdmin: true,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, adminReply]);
      setIsTyping(false);
    }, 2000);
  };

  const getAdminReply = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('saldo') || lowerMessage.includes('bayar')) {
      return "Saldo Anda saat ini Rp 850.000. Untuk penarikan saldo, silakan gunakan fitur 'Tarik Saldo' di menu utama aplikasi.";
    } else if (lowerMessage.includes('order') || lowerMessage.includes('pesanan')) {
      return "Untuk masalah order, pastikan status online aktif dan lokasi GPS terhubung. Jika masih ada kendala, silakan screenshot dan kirim ke sini.";
    } else if (lowerMessage.includes('bonus') || lowerMessage.includes('insentif')) {
      return "Bonus driver terbaik bulan ini adalah Rp 500.000. Anda saat ini di ranking 3 dengan rating 4.8. Tetap semangat!";
    } else {
      return "Terima kasih atas pertanyaannya. Tim support kami akan segera membantu Anda. Apakah ada hal lain yang bisa kami bantu?";
    }
  };

  // Photo proof functions
  const takePhoto = () => {
    // Simulate camera capture
    Alert.alert(
      "Kamera",
      "Pilih sumber foto:",
      [
        { text: "Kamera", onPress: () => simulatePhotoCapture("camera") },
        { text: "Galeri", onPress: () => simulatePhotoCapture("gallery") },
        { text: "Batal", style: "cancel" }
      ]
    );
  };

  const simulatePhotoCapture = (source) => {
    // Simulate photo capture with demo image
    const demoPhoto = {
      uri: 'https://via.placeholder.com/400x300/4CAF50/white?text=BUKTI+PENGIRIMAN',
      source: source,
      timestamp: new Date().toISOString()
    };
    setCapturedPhoto(demoPhoto);
  };

  const submitProofAndComplete = () => {
    if (!capturedPhoto) {
      Alert.alert("Error", "Foto bukti pengiriman wajib diambil");
      return;
    }

    setCompletingOrder(true);
    
    // Simulate API call to upload photo and complete order
    setTimeout(() => {
      setActiveOrder(null);
      setShowProofModal(false);
      setCapturedPhoto(null);
      setCompletingOrder(false);
      
      setEarnings(prev => ({
        ...prev,
        today: prev.today + 17500, // 70% dari 25000
        balance: prev.balance + 17500
      }));
      
      Alert.alert(
        "Order Selesai", 
        "✅ Bukti pengiriman berhasil dikirim!\n💰 Penghasilan telah ditambahkan ke saldo Anda!"
      );
    }, 2000);
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150x80/4CAF50/white?text=BAKUSAM' }}
            style={styles.logo}
          />
          <Text style={styles.loginTitle}>Bakusam Express Driver</Text>
          <Text style={styles.loginSubtitle}>Masuk dengan nomor telepon Anda</Text>
          
          <TextInput
            style={styles.phoneInput}
            placeholder="Nomor Telepon (08123456789)"
            keyboardType="phone-pad"
            defaultValue="08123456789"
          />
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => handleLogin("08123456789")}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Masuk</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Chat Screen
  if (showChat) {
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setShowChat(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>Chat Admin</Text>
          <Text style={styles.onlineIndicator}>● Online</Text>
        </View>

        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map(message => (
              <View 
                key={message.id} 
                style={[
                  styles.messageContainer,
                  message.isAdmin ? styles.adminMessage : styles.driverMessage
                ]}
              >
                <View 
                  style={[
                    styles.messageBubble,
                    message.isAdmin ? styles.adminBubble : styles.driverBubble
                  ]}
                >
                  <Text 
                    style={[
                      styles.messageText,
                      message.isAdmin ? styles.adminText : styles.driverText
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text 
                    style={[
                      styles.timestamp,
                      message.isAdmin ? styles.adminTimestamp : styles.driverTimestamp
                    ]}
                  >
                    {message.timestamp}
                  </Text>
                </View>
              </View>
            ))}
            
            {isTyping && (
              <View style={[styles.messageContainer, styles.adminMessage]}>
                <View style={[styles.messageBubble, styles.adminBubble]}>
                  <Text style={styles.typingText}>Admin sedang mengetik...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Ketik pesan Anda..."
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                newMessage.trim() === '' && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={newMessage.trim() === ''}
            >
              <Text style={styles.sendButtonText}>Kirim</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Bantuan Cepat:</Text>
          <View style={styles.quickButtonsContainer}>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => setNewMessage("Saya mau tanya tentang saldo")}
            >
              <Text style={styles.quickButtonText}>💰 Saldo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => setNewMessage("Ada masalah dengan order")}
            >
              <Text style={styles.quickButtonText}>📦 Order</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => setNewMessage("Kapan ada bonus driver?")}
            >
              <Text style={styles.quickButtonText}>🎁 Bonus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Selamat datang,</Text>
          <Text style={styles.driverName}>{driver?.fullName}</Text>
          <Text style={styles.vehicleType}>{driver?.vehicleType} • Rating: {driver?.rating}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.chatIconButton}
            onPress={() => setShowChat(true)}
          >
            <Text style={styles.chatIcon}>💬</Text>
            <Text style={styles.chatIconText}>Chat</Text>
          </TouchableOpacity>
          <View style={styles.onlineToggle}>
            <Text style={[styles.statusText, { color: isOnline ? '#4CAF50' : '#757575' }]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
            />
          </View>
        </View>
      </View>

      {/* Earnings Card */}
      <View style={styles.earningsCard}>
        <Text style={styles.cardTitle}>Penghasilan Hari Ini</Text>
        <Text style={styles.earningsAmount}>Rp {earnings.today.toLocaleString()}</Text>
        <View style={styles.earningsDetails}>
          <Text style={styles.balanceText}>Saldo: Rp {earnings.balance.toLocaleString()}</Text>
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Tarik Saldo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Status */}
      {isOnline && currentLocation && (
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>📍 Lokasi Saat Ini</Text>
          <Text style={styles.locationText}>
            Lat: {currentLocation.latitude.toFixed(4)}, 
            Lng: {currentLocation.longitude.toFixed(4)}
          </Text>
          <Text style={styles.locationUpdate}>Update setiap 10 detik</Text>
        </View>
      )}

      {/* Active Order */}
      {activeOrder && (
        <View style={styles.activeOrderCard}>
          <Text style={styles.cardTitle}>🚚 Order Aktif</Text>
          <View style={styles.orderInfo}>
            <Text style={styles.orderText}>Order #{activeOrder.id}</Text>
            <Text style={styles.customerText}>{activeOrder.customer.fullName}</Text>
            <Text style={styles.addressText}>Dari: {activeOrder.pickupAddress}</Text>
            <Text style={styles.addressText}>Ke: {activeOrder.deliveryAddress}</Text>
            <Text style={styles.fareText}>Ongkir: Rp {activeOrder.totalFare}</Text>
          </View>
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={() => setShowProofModal(true)}
          >
            <Text style={styles.completeButtonText}>📷 Foto Bukti & Selesaikan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Available Orders */}
      {isOnline && !activeOrder && (
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Order Tersedia (Radius 3KM)</Text>
          {availableOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Order #{order.id}</Text>
                <Text style={styles.orderDistance}>{order.distance}</Text>
              </View>
              <Text style={styles.orderCustomer}>{order.customer.fullName}</Text>
              <Text style={styles.orderRoute}>
                {order.pickupAddress} → {order.deliveryAddress}
              </Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderFare}>Rp {order.totalFare}</Text>
                <Text style={styles.orderTime}>{order.estimatedDuration} menit</Text>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                >
                  <Text style={styles.acceptButtonText}>Terima</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Order Detail Modal */}
      <Modal visible={showOrderModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detail Order</Text>
            {selectedOrder && (
              <>
                <Text style={styles.modalText}>Order #{selectedOrder.id}</Text>
                <Text style={styles.modalText}>Customer: {selectedOrder.customer.fullName}</Text>
                <Text style={styles.modalText}>Telepon: {selectedOrder.customer.phone}</Text>
                <Text style={styles.modalText}>Jarak: {selectedOrder.distance}</Text>
                <Text style={styles.modalText}>Estimasi: {selectedOrder.estimatedDuration} menit</Text>
                <Text style={styles.modalFare}>Total Ongkir: Rp {selectedOrder.totalFare}</Text>
                <Text style={styles.modalCommission}>
                  Anda terima: Rp {Math.round(parseInt(selectedOrder.totalFare) * 0.7).toLocaleString()} (70%)
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => setShowOrderModal(false)}
                  >
                    <Text style={styles.rejectButtonText}>Tolak</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={() => acceptOrder(selectedOrder)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Terima Order</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Photo Proof Modal */}
      <Modal visible={showProofModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.proofModalContent}>
            <Text style={styles.modalTitle}>Bukti Pengiriman</Text>
            <Text style={styles.proofInstructions}>
              Ambil foto barang yang telah diterima customer sebagai bukti pengiriman
            </Text>
            
            {capturedPhoto ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: capturedPhoto.uri }} style={styles.proofPhoto} />
                <Text style={styles.photoInfo}>✅ Foto berhasil diambil</Text>
                <TouchableOpacity style={styles.retakeButton} onPress={takePhoto}>
                  <Text style={styles.retakeButtonText}>📷 Ambil Ulang</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.takePhotoButton} onPress={takePhoto}>
                <Text style={styles.takePhotoIcon}>📷</Text>
                <Text style={styles.takePhotoText}>Ambil Foto Bukti</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.proofModalButtons}>
              <TouchableOpacity 
                style={styles.cancelProofButton}
                onPress={() => {
                  setShowProofModal(false);
                  setCapturedPhoto(null);
                }}
              >
                <Text style={styles.cancelProofButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.submitProofButton,
                  !capturedPhoto && styles.submitProofButtonDisabled
                ]}
                onPress={submitProofAndComplete}
                disabled={!capturedPhoto || completingOrder}
              >
                {completingOrder ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitProofButtonText}>
                    {capturedPhoto ? "✅ Selesaikan Order" : "Ambil Foto Dulu"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Menu */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🏠 Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🗺️ Peta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowChat(true)}>
          <Text style={styles.menuText}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>👤 Profil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  logo: {
    width: 150,
    height: 80,
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  phoneInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  chatIconButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chatIcon: {
    fontSize: 24,
  },
  chatIconText: {
    fontSize: 10,
    color: '#666',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleType: {
    fontSize: 12,
    color: '#666',
  },
  onlineToggle: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  earningsCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  earningsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 14,
    color: '#666',
  },
  withdrawButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  locationUpdate: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
  activeOrderCard: {
    backgroundColor: '#E8F5E8',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  orderInfo: {
    marginBottom: 15,
  },
  orderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  fareText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ordersSection: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDistance: {
    fontSize: 12,
    color: '#666',
  },
  orderCustomer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  orderRoute: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderFare: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderTime: {
    fontSize: 12,
    color: '#666',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  proofModalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalFare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  modalCommission: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Photo proof styles
  proofInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  takePhotoButton: {
    backgroundColor: '#f0f0f0',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  takePhotoIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  takePhotoText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  proofPhoto: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 8,
    marginBottom: 10,
  },
  photoInfo: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  retakeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  proofModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelProofButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelProofButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitProofButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitProofButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitProofButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Chat styles
  chatHeader: {
    backgroundColor: '#4CAF50',
    padding: 15,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  chatHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    color: '#C8E6C9',
    fontSize: 12,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  adminMessage: {
    alignItems: 'flex-start',
  },
  driverMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  adminBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  driverBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  adminText: {
    color: '#333',
  },
  driverText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
  },
  adminTimestamp: {
    color: '#999',
  },
  driverTimestamp: {
    color: '#C8E6C9',
  },
  typingText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 12,
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickActions: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickActionsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#666',
  },
  bottomMenu: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginTop: 20,
  },
  menuItem: {
    alignItems: 'center',
  },
  menuText: {
    fontSize: 12,
    color: '#666',
  },
});

export default BakusamDriverEnhanced;