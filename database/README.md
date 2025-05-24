# 🗄️ Database Bakusam Express

## 📍 Lokasi File Database
```
bakusam-admin/
├── database/
│   ├── bakusam_express_database.sql    # File utama database
│   ├── README.md                       # Panduan ini
│   └── migrations/                     # (opsional) untuk update schema
```

## 🚀 Cara Install Database

### 1. **Persiapkan MySQL Server**
Pastikan MySQL sudah terinstall dan berjalan di server Anda.

### 2. **Import Database**
```bash
# Dari root folder bakusam-admin
mysql -u root -p < database/bakusam_express_database.sql

# Atau dengan path lengkap
mysql -u root -p bakusam_express < database/bakusam_express_database.sql
```

### 3. **Verifikasi Import**
```sql
USE bakusam_express;
SHOW TABLES;
SELECT COUNT(*) FROM drivers;  -- Harus ada 4 sample drivers
SELECT COUNT(*) FROM orders;   -- Harus ada 4 sample orders
```

### 4. **Update Environment Variables**
Update file `.env` di root project:
```env
DATABASE_URL="mysql://username:password@localhost:3306/bakusam_express"
PGDATABASE=bakusam_express
PGHOST=localhost
PGPORT=3306
PGUSER=bakusam_app
PGPASSWORD=BakusamApp2024!
```

## 🛡️ Security Settings

Database sudah dilengkapi dengan:
- **App User**: `bakusam_app` (full access)
- **Read-only User**: `bakusam_readonly` (untuk reporting)
- **Encrypted passwords** dan proper permissions

## 📊 Struktur Database

### Core Tables (14):
1. `users` - Admin dan operator
2. `customers` - Data pelanggan
3. `drivers` - Data driver dengan priority system
4. `vehicles` - Kendaraan dengan assignment
5. `orders` - Order management lengkap
6. `pricing_rules` - Aturan tarif dinamis
7. `promotions` - Sistem promosi dan discount
8. `notifications` - Push notification system
9. `driver_safety_status` - Real-time safety monitoring
10. `safety_incidents` - Incident management
11. `system_settings` - Konfigurasi sistem
12. `daily_analytics` - Analytics harian
13. `route_optimizations` - Data optimasi rute
14. `driver_vehicles` - Assignment driver-kendaraan

### Advanced Features:
- **Views** untuk query performance
- **Stored Procedures** untuk auto-assignment
- **Triggers** untuk update otomatis
- **Indexes** untuk performa optimal

## 🌐 Multi-Language Support

Database mendukung 5 bahasa:
- 🇮🇩 Indonesian (default)
- 🇺🇸 English  
- 🇸🇦 Arabic (RTL)
- 🇨🇳 Chinese
- 🇯🇵 Japanese

## 📈 Sample Data

Database sudah include sample data siap pakai:
- 4 Drivers dengan berbagai vehicle types
- 4 Customers (VIP, Regular, New)
- 4 Orders dengan status berbeda
- Pricing rules untuk semua vehicle types
- 3 Active promotions
- Analytics data 7 hari terakhir

## 🔧 Maintenance

### Backup Database:
```bash
mysqldump -u root -p bakusam_express > backup_$(date +%Y%m%d).sql
```

### Update Schema:
Gunakan migration files di folder `migrations/` untuk update schema tanpa kehilangan data.

---

**Ready to use!** 🚀 Database Bakusam Express siap mendukung semua fitur canggih di admin dashboard!