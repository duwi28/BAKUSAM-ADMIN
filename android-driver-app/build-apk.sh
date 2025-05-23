#!/bin/bash

# 🚀 Bakusam Express Driver - APK Builder Script
# Script otomatis untuk membangun APK Android

echo "🏗️  Memulai proses build APK Bakusam Driver..."

# Periksa apakah Android SDK tersedia
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME tidak ditemukan!"
    echo "📋 Silakan install Android Studio dan set ANDROID_HOME"
    echo "   export ANDROID_HOME=/path/to/android-sdk"
    exit 1
fi

# Periksa Gradle wrapper
if [ ! -f "./gradlew" ]; then
    echo "⚠️  Gradle wrapper tidak ditemukan!"
    echo "📋 Membuat Gradle wrapper..."
    gradle wrapper
fi

# Berikan permission execute untuk gradlew
chmod +x ./gradlew

# Clean previous builds
echo "🧹 Membersihkan build sebelumnya..."
./gradlew clean

# Build debug APK
echo "🔨 Membangun debug APK..."
./gradlew assembleDebug

# Periksa hasil build
if [ -f "./app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK berhasil dibuat!"
    echo "📁 Lokasi: ./app/build/outputs/apk/debug/app-debug.apk"
    echo "📏 Ukuran APK:"
    ls -lh ./app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}'
    
    echo ""
    echo "🎉 SUKSES! APK Bakusam Driver siap digunakan!"
    echo "📲 Cara install:"
    echo "   1. Copy APK ke smartphone Android"
    echo "   2. Enable 'Unknown Sources' di Settings"
    echo "   3. Tap file APK untuk install"
    echo ""
    echo "🔧 Install via ADB:"
    echo "   adb install ./app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Build gagal! Periksa error di atas."
    exit 1
fi