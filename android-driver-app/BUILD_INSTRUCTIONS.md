# 🚀 Panduan Build APK Bakusam Express Driver

## 📋 Prerequisites
Pastikan Anda memiliki tools berikut terinstall:
- **Android Studio** (Arctic Fox atau lebih baru)
- **Java 8+** atau **OpenJDK 8+**
- **Android SDK** (API Level 21-33)

## 🔧 Langkah-Langkah Build APK

### 1. Setup Environment
```bash
# Install Android Studio dari: https://developer.android.com/studio
# Pastikan Android SDK sudah terinstall
```

### 2. Import Project
1. Buka Android Studio
2. Pilih **"Open an existing Android Studio project"**
3. Navigate ke folder `android-driver-app`
4. Klik **"OK"**

### 3. Sync Dependencies
- Android Studio akan otomatis melakukan sync
- Tunggu hingga proses "Gradle Sync" selesai
- Jika ada error, klik **"Sync Now"**

### 4. Build APK Debug
```bash
# Via Terminal di Android Studio:
./gradlew assembleDebug

# Atau via menu Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### 5. Lokasi APK
File APK akan tersedia di:
```
android-driver-app/app/build/outputs/apk/debug/app-debug.apk
```

## 📲 Install APK ke Android

### Via ADB (Android Debug Bridge)
```bash
# Install via ADB
adb install app-debug.apk

# Jika device belum dikenali:
adb devices
```

### Via Manual Install
1. Copy file `app-debug.apk` ke smartphone Android
2. Buka **Settings → Security**
3. Enable **"Unknown Sources"** atau **"Install from unknown sources"**
4. Tap file APK dan install

## 🎯 Build APK Release (Production)

### 1. Generate Keystore
```bash
keytool -genkey -v -keystore bakusam-release-key.keystore \
  -alias bakusam-driver -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Update app/build.gradle
Tambahkan signing config:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../bakusam-release-key.keystore')
            storePassword 'your_store_password'
            keyAlias 'bakusam-driver'
            keyPassword 'your_key_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release APK
```bash
./gradlew assembleRelease
```

## 🐛 Troubleshooting

### Error: SDK not found
1. Buka **File → Project Structure**
2. Set **Android SDK Location**
3. Download missing SDK components

### Error: Gradle sync failed
1. **File → Invalidate Caches and Restart**
2. **Build → Clean Project**
3. **Build → Rebuild Project**

### Error: Unable to install APK
1. Enable **Developer Options** di Android
2. Enable **USB Debugging**
3. Pastikan **Install via USB** diaktifkan

## ✅ Verifikasi APK

### Test di Emulator
1. Buka **AVD Manager** di Android Studio
2. Create virtual device (API 21+)
3. Install dan test APK

### Test di Device Fisik
1. Connect smartphone via USB
2. Enable **Developer Options** & **USB Debugging**
3. Install APK dan test semua fitur

## 🎉 Hasil Akhir

APK yang berhasil dibuild akan memiliki fitur:
- ✅ Dashboard driver dengan toggle online/offline
- ✅ Sistem talangan lengkap dengan modal konfirmasi
- ✅ Update saldo dan penghasilan real-time
- ✅ Interface Bahasa Indonesia
- ✅ Material Design yang responsive
- ✅ Perhitungan komisi otomatis

**Size APK**: ~2-3 MB (optimized)
**Compatible**: Android 5.0+ (API 21+)
**Permissions**: Internet, Location, Phone, Camera, Vibrate

---

🚀 **APK siap untuk distribusi ke driver Bakusam Express!**