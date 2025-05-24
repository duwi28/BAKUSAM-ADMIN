# 🔗 Panduan Integrasi Bakusam Admin & Driver App

## 🌟 Overview
Menghubungkan web admin dashboard dengan Android driver app untuk sistem logistik terintegrasi.

## 📋 Langkah-Langkah Integrasi

### 1. **Setup API Endpoints untuk Driver App**

Web admin sudah menyediakan API endpoints yang dibutuhkan driver app:

```
🔗 Driver Authentication:
POST /api/driver/login
POST /api/driver/register

📦 Order Management:
GET /api/driver/current-order
GET /api/driver/orders/history
POST /api/driver/orders/{id}/accept
POST /api/driver/orders/{id}/pickup
POST /api/driver/orders/{id}/complete

📍 Location Tracking:
POST /api/driver/location/update
GET /api/driver/location/current

💰 Financial:
GET /api/driver/balance
GET /api/driver/earnings
POST /api/driver/withdrawal

🔔 Notifications:
GET /api/driver/notifications
POST /api/driver/notifications/read
```

### 2. **Konfigurasi URL Server di Driver App**

Dalam file `MainActivity.java` Android app, update base URL:

```java
public class MainActivity extends AppCompatActivity {
    // Update dengan URL server Anda
    private static final String BASE_URL = "https://your-bakusam-admin.com/api/";
    // Atau untuk development: "http://localhost:5000/api/"
    
    // Untuk testing lokal dengan emulator:
    // private static final String BASE_URL = "http://10.0.2.2:5000/api/";
}
```

### 3. **Real-Time Synchronization**

**WebSocket Connection untuk Real-Time Updates:**
- Admin dashboard mengirim order baru → Driver app terima notifikasi
- Driver update lokasi → Admin dashboard update peta real-time
- Status order berubah → Kedua sisi sinkron otomatis

### 4. **Fitur Terintegrasi yang Sudah Siap**

✅ **Order Assignment System**
- Admin assign order → Driver dapat notifikasi instant
- Auto-assignment berdasarkan prioritas & lokasi

✅ **Real-Time Tracking**
- Driver app kirim koordinat GPS → Admin lihat di peta
- Customer dapat track progress pengiriman

✅ **Weather Integration**
- Admin kirim route optimization → Driver terima rute terbaik
- Weather alerts dari admin → Driver dapat peringatan cuaca

✅ **Communication System**
- Driver community chat terintegrasi
- Emergency alerts & notifications

✅ **Payment & Balance**
- System talangan untuk motor drivers
- Real-time balance updates
- Commission calculations

### 5. **Database Synchronization**

Kedua sistem menggunakan database yang sama:
- Driver data sync real-time
- Order status updates instant
- Location tracking tersimpan
- Performance analytics terupdate

### 6. **Multi-Language Support**

Driver app akan otomatis mengikuti setting bahasa:
- Indonesian (default)
- English
- Arabic
- Chinese  
- Japanese

## 🚀 **Quick Setup untuk Testing**

### Local Development:
1. Jalankan web admin: `npm run dev` (port 5000)
2. Update driver app URL ke: `http://10.0.2.2:5000/api/`
3. Install driver APK di emulator/device
4. Test login dengan data dari database

### Production Setup:
1. Deploy web admin ke server
2. Update driver app URL ke production URL
3. Build & distribute APK ke drivers
4. Monitor via admin dashboard

## 🔧 **API Authentication**

Driver app menggunakan session-based auth:
```
POST /api/driver/login
{
  "phone": "08234567890",
  "password": "driver123"
}

Response:
{
  "success": true,
  "driver": {...},
  "sessionId": "..."
}
```

## 📊 **Monitoring & Analytics**

Admin dashboard akan menampilkan:
- Driver locations real-time
- Order completion rates
- Response times
- Performance metrics
- Revenue analytics

## 🎯 **Next Steps**

1. **Test Connection**: Coba login dari driver app ke admin
2. **Verify Real-Time**: Check GPS tracking di admin dashboard  
3. **Test Orders**: Assign order dari admin, terima di driver app
4. **Monitor Performance**: Lihat analytics di dashboard

---

**Ready to connect!** 🚀 Sistem Bakusam Admin & Driver App siap terintegrasi penuh!