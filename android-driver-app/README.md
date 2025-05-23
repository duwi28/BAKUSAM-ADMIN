# 📱 Bakusam Express - Aplikasi Driver Android

## 🚀 Fitur Utama

### 💰 Sistem Talangan Lengkap
- **Badge Visual**: Indikator "💰 TALANGAN" yang menarik pada order card
- **Modal Konfirmasi**: Detail lengkap dengan perhitungan keuangan real-time
- **Validasi Saldo**: Cek otomatis apakah saldo driver mencukupi
- **Instruksi Jelas**: Panduan 4-langkah untuk proses talangan

### 📊 Dashboard Driver
- **Status Online/Offline**: Toggle dengan indikator visual
- **Penghasilan Real-time**: Update otomatis penghasilan harian dan saldo
- **Order Management**: Terima order reguler dan talangan
- **Penarikan Saldo**: Fitur withdraw dengan validasi minimal

### 🎯 Order Management
- **Order Card Interaktif**: Tampilan order dengan detail lengkap
- **Kategori Order**: Reguler dan talangan dengan visual berbeda
- **Perhitungan Otomatis**: Komisi, net income, dan balance update
- **Konfirmasi Talangan**: Modal khusus dengan warning dan instruksi

## 📂 Struktur Aplikasi

```
android-driver-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/bakusamexpress/driver/
│   │   │   ├── MainActivity.java          # Activity utama
│   │   │   └── TalanganConfirmActivity.java # Modal konfirmasi talangan
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   ├── activity_main.xml      # Layout utama
│   │   │   │   ├── order_card.xml         # Layout kartu order
│   │   │   │   └── activity_talangan_confirm.xml # Layout konfirmasi
│   │   │   ├── values/
│   │   │   │   ├── strings.xml            # Text strings
│   │   │   │   └── colors.xml             # Warna aplikasi
│   │   │   └── drawable/
│   │   │       └── gradient_green.xml     # Background gradient
│   │   └── AndroidManifest.xml            # Konfigurasi aplikasi
│   └── build.gradle                       # Dependencies & build config
```

## 🛠️ Cara Build APK

### Prerequisites
- Android Studio Arctic Fox atau lebih baru
- Android SDK API 21-33
- Java 8 atau lebih baru

### Langkah Build
1. **Buka Project di Android Studio**
   ```bash
   cd android-driver-app
   # Buka folder ini di Android Studio
   ```

2. **Sync Dependencies**
   - Klik "Sync Now" ketika diminta
   - Tunggu download dependencies selesai

3. **Build APK**
   ```bash
   # Via terminal
   ./gradlew assembleDebug
   
   # Atau via Android Studio:
   # Build → Build Bundle(s) / APK(s) → Build APK(s)
   ```

4. **Lokasi APK**
   ```
   app/build/outputs/apk/debug/app-debug.apk
   ```

## 📲 Instalasi di Android

### Cara 1: ADB Install
```bash
adb install app-debug.apk
```

### Cara 2: Manual Install
1. Transfer APK ke smartphone Android
2. Enable "Unknown Sources" di Settings
3. Tap file APK untuk install
4. Ikuti instruksi instalasi

## 🎮 Demo & Testing

### Fitur yang Bisa Dicoba:
- **Toggle Online/Offline**: Switch status driver
- **Terima Order Reguler**: Klik "Terima" pada order tanpa talangan
- **Terima Order Talangan**: Klik "💰 Terima + Talangan"
- **Konfirmasi Talangan**: Modal dengan perhitungan detail
- **Update Saldo**: Lihat perubahan balance real-time

### Data Demo:
- **Driver**: Budi Santoso (Rating 4.8⭐)
- **Penghasilan Awal**: Rp 150.000
- **Saldo Awal**: Rp 850.000
- **3 Order Sample**: Mix reguler dan talangan

## 🔧 Kustomisasi

### Ubah Data Driver
Edit `MainActivity.java`:
```java
// Ganti nama driver
TextView driverName = findViewById(R.id.driverName);
driverName.setText("Nama Driver Anda");

// Ganti penghasilan awal
private int currentEarnings = 150000; // Ubah sesuai kebutuhan
private int currentBalance = 850000;  // Ubah sesuai kebutuhan
```

### Ubah Warna Tema
Edit `res/values/colors.xml`:
```xml
<color name="green_500">#4CAF50</color>     <!-- Warna utama -->
<color name="orange_500">#FF9800</color>    <!-- Warna talangan -->
```

### Tambah Order Baru
Edit method `loadOrders()` di `MainActivity.java`:
```java
addOrderCard(4, "Customer Baru", "08123456789", 
    "Pickup Location", "Delivery Location", 
    "5.0 km", 45000, 25000, "Keperluan talangan", 30);
```

## 🔐 Permissions

Aplikasi memerlukan permissions:
- `INTERNET`: Koneksi ke server
- `ACCESS_FINE_LOCATION`: GPS tracking
- `CALL_PHONE`: Telepon customer
- `CAMERA`: Foto bukti pengiriman
- `VIBRATE`: Notifikasi order

## 🚀 Production Ready

### Untuk Release:
1. **Generate Signed APK**
   - Build → Generate Signed Bundle/APK
   - Pilih "APK" dan buat keystore baru
   - Build release APK

2. **Optimasi**
   - Enable ProGuard untuk minifikasi
   - Compress resources dan assets
   - Test di berbagai device Android

3. **Upload ke Play Store**
   - Siapkan screenshots dan description
   - Upload APK ke Google Play Console
   - Submit untuk review

## 📞 Support

Untuk bantuan teknis atau customization lebih lanjut, silakan hubungi tim development Bakusam Express.

---

**🎉 Selamat! Aplikasi driver Android Bakusam Express dengan fitur talangan telah siap digunakan!**