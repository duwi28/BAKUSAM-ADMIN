-- =====================================================
-- BAKUSAM EXPRESS DATABASE SCHEMA
-- Platform Logistik Indonesia dengan Sistem Multi-Language
-- =====================================================

-- Database Setup
CREATE DATABASE IF NOT EXISTS bakusam_express;
USE bakusam_express;

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'operator', 'supervisor') DEFAULT 'operator',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    language_preference ENUM('id', 'en', 'ar', 'zh', 'ja') DEFAULT 'id',
    theme_preference ENUM('light', 'dark', 'system') DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CUSTOMERS
-- =====================================================

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(50) DEFAULT 'Jakarta',
    postal_code VARCHAR(10),
    customer_type ENUM('individual', 'corporate') DEFAULT 'individual',
    segment ENUM('VIP', 'Regular', 'New') DEFAULT 'New',
    loyalty_score INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0.00,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    preferred_delivery_time VARCHAR(20),
    location_coordinates VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. VEHICLES
-- =====================================================

CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('motor', 'mobil', 'pickup', 'truck') NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    year INT,
    color VARCHAR(30),
    max_weight DECIMAL(8,2) DEFAULT 0.00,
    max_volume DECIMAL(8,2) DEFAULT 0.00,
    fuel_type ENUM('bensin', 'solar', 'electric') DEFAULT 'bensin',
    transmission ENUM('manual', 'automatic') DEFAULT 'manual',
    insurance_number VARCHAR(50),
    insurance_expiry DATE,
    last_maintenance DATE,
    odometer INT DEFAULT 0,
    status ENUM('available', 'in_use', 'maintenance', 'retired') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. DRIVERS
-- =====================================================

CREATE TABLE drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    nik VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    sim_number VARCHAR(20) UNIQUE NOT NULL,
    sim_type ENUM('A', 'B1', 'B2', 'C') NOT NULL,
    sim_expiry DATE NOT NULL,
    vehicle_type ENUM('motor', 'mobil', 'pickup', 'truck') NOT NULL,
    priority_level ENUM('priority', 'normal') DEFAULT 'normal',
    status ENUM('active', 'inactive', 'suspended', 'on_break') DEFAULT 'inactive',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    total_earnings DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
    response_time_avg INT DEFAULT 0, -- dalam menit
    last_active TIMESTAMP NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    photo_url VARCHAR(255),
    documents_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    hire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. DRIVER-VEHICLE ASSIGNMENTS
-- =====================================================

CREATE TABLE driver_vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_active_assignment (driver_id, vehicle_id, is_active)
);

-- =====================================================
-- 6. ORDERS
-- =====================================================

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    driver_id INT NULL,
    vehicle_id INT NULL,
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10,8),
    pickup_longitude DECIMAL(11,8),
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    distance_km DECIMAL(8,2) DEFAULT 0.00,
    weight_kg DECIMAL(8,2) DEFAULT 0.00,
    package_description TEXT,
    special_instructions TEXT,
    
    -- Pricing
    base_fare DECIMAL(10,2) NOT NULL,
    distance_fare DECIMAL(10,2) DEFAULT 0.00,
    weight_fare DECIMAL(10,2) DEFAULT 0.00,
    additional_charges DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    payment_method ENUM('cash', 'transfer', 'ewallet', 'corporate') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    advance_payment DECIMAL(10,2) DEFAULT 0.00, -- Talangan untuk motor
    
    -- Status & Tracking
    status ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    priority ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
    
    -- Timestamps
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    picked_up_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    estimated_delivery TIMESTAMP NULL,
    
    -- Proof & Feedback
    pickup_photo_url VARCHAR(255),
    delivery_photo_url VARCHAR(255),
    recipient_signature_url VARCHAR(255),
    customer_rating INT DEFAULT 0,
    customer_feedback TEXT,
    driver_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_ordered_at (ordered_at),
    INDEX idx_customer_driver (customer_id, driver_id)
);

-- =====================================================
-- 7. PRICING RULES
-- =====================================================

CREATE TABLE pricing_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL,
    vehicle_type ENUM('motor', 'mobil', 'pickup', 'truck') NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    per_km_rate DECIMAL(10,2) NOT NULL,
    per_kg_rate DECIMAL(10,2) DEFAULT 0.00,
    minimum_fare DECIMAL(10,2) NOT NULL,
    maximum_distance_km INT DEFAULT 0, -- 0 = unlimited
    time_based_multiplier JSON, -- {"peak_hours": 1.5, "night": 1.2}
    area_multiplier JSON, -- {"jakarta_pusat": 1.2, "jakarta_timur": 1.0}
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE NOT NULL,
    valid_until DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. PROMOTIONS
-- =====================================================

CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed_amount', 'free_delivery') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount DECIMAL(10,2) DEFAULT 0.00,
    usage_limit INT DEFAULT 0, -- 0 = unlimited
    usage_count INT DEFAULT 0,
    customer_usage_limit INT DEFAULT 1,
    applicable_vehicle_types JSON, -- ["motor", "mobil"]
    target_customer_segments JSON, -- ["VIP", "Regular"]
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('order', 'payment', 'promotion', 'system', 'weather', 'emergency') NOT NULL,
    target_type ENUM('all_drivers', 'specific_driver', 'all_customers', 'specific_customer', 'admin') NOT NULL,
    target_id INT NULL, -- driver_id atau customer_id jika specific
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    delivery_method JSON, -- ["push", "sms", "email", "in_app"]
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    status ENUM('draft', 'scheduled', 'sent', 'failed') DEFAULT 'draft',
    read_at TIMESTAMP NULL,
    metadata JSON, -- additional data seperti order_id, route_info, etc
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (target_id) REFERENCES drivers(id) ON DELETE SET NULL,
    INDEX idx_target (target_type, target_id),
    INDEX idx_status_priority (status, priority)
);

-- =====================================================
-- 10. DRIVER SAFETY & MONITORING
-- =====================================================

CREATE TABLE driver_safety_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id INT NOT NULL,
    status ENUM('safe', 'alert', 'emergency', 'offline') DEFAULT 'offline',
    last_heartbeat TIMESTAMP NULL,
    current_speed DECIMAL(5,2) DEFAULT 0.00,
    fatigue_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    driving_hours_today DECIMAL(4,2) DEFAULT 0.00,
    break_time_remaining INT DEFAULT 0, -- menit
    emergency_contacts_notified BOOLEAN DEFAULT FALSE,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    battery_level INT DEFAULT 100,
    network_signal_strength INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_driver_safety (driver_id)
);

-- =====================================================
-- 11. SAFETY INCIDENTS
-- =====================================================

CREATE TABLE safety_incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id INT NOT NULL,
    incident_type ENUM('accident', 'breakdown', 'theft', 'harassment', 'weather', 'traffic', 'other') NOT NULL,
    severity ENUM('minor', 'moderate', 'major', 'critical') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location_address TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    status ENUM('reported', 'investigating', 'resolved', 'closed') DEFAULT 'reported',
    response_team_notified BOOLEAN DEFAULT FALSE,
    emergency_services_called BOOLEAN DEFAULT FALSE,
    insurance_claim_number VARCHAR(50),
    photos JSON, -- array of photo URLs
    witness_contacts JSON, -- array of contact info
    police_report_number VARCHAR(50),
    estimated_cost DECIMAL(12,2) DEFAULT 0.00,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
    INDEX idx_severity_status (severity, status),
    INDEX idx_incident_date (created_at)
);

-- =====================================================
-- 12. SYSTEM SETTINGS
-- =====================================================

CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- bisa diakses driver app
    last_modified_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (last_modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 13. ANALYTICS & REPORTS DATA
-- =====================================================

CREATE TABLE daily_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE UNIQUE NOT NULL,
    total_orders INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    total_distance_km DECIMAL(10,2) DEFAULT 0.00,
    average_delivery_time DECIMAL(6,2) DEFAULT 0.00,
    active_drivers INT DEFAULT 0,
    peak_hour_start TIME,
    peak_hour_end TIME,
    weather_conditions JSON, -- weather impact data
    customer_satisfaction_avg DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 14. ROUTE OPTIMIZATION & WEATHER
-- =====================================================

CREATE TABLE route_optimizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    optimization_type ENUM('distance', 'time', 'fuel', 'weather', 'traffic') NOT NULL,
    original_route JSON, -- original route data
    optimized_route JSON, -- optimized route data
    weather_conditions JSON, -- weather data at time of optimization
    traffic_conditions JSON, -- traffic data
    fuel_saved_liters DECIMAL(6,2) DEFAULT 0.00,
    time_saved_minutes INT DEFAULT 0,
    cost_saved DECIMAL(10,2) DEFAULT 0.00,
    safety_score INT DEFAULT 0, -- 0-100
    applied_at TIMESTAMP NULL,
    completion_status ENUM('pending', 'applied', 'completed', 'cancelled') DEFAULT 'pending',
    driver_feedback TEXT,
    actual_vs_predicted JSON, -- comparison data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    INDEX idx_optimization_type (optimization_type),
    INDEX idx_applied_date (applied_at)
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Users
INSERT INTO users (username, email, password_hash, full_name, role, phone, language_preference) VALUES
('admin', 'admin@bakusamexpress.com', '$2b$10$hash1', 'Admin Bakusam', 'admin', '08123456789', 'id'),
('operator1', 'operator1@bakusamexpress.com', '$2b$10$hash2', 'Operator Satu', 'operator', '08123456790', 'id'),
('supervisor1', 'supervisor@bakusamexpress.com', '$2b$10$hash3', 'Supervisor Jakarta', 'supervisor', '08123456791', 'en');

-- Vehicles
INSERT INTO vehicles (license_plate, vehicle_type, brand, model, year, color, max_weight, status) VALUES
('B 1234 ABC', 'motor', 'Honda', 'Beat', 2022, 'Merah', 50.00, 'available'),
('B 5678 DEF', 'mobil', 'Toyota', 'Avanza', 2021, 'Putih', 1000.00, 'available'),
('B 9012 GHI', 'pickup', 'Daihatsu', 'Hi-Max', 2020, 'Biru', 1500.00, 'available'),
('B 3456 JKL', 'motor', 'Yamaha', 'Mio', 2023, 'Hitam', 50.00, 'available');

-- Drivers
INSERT INTO drivers (full_name, phone, email, nik, address, sim_number, sim_type, sim_expiry, vehicle_type, priority_level, status, rating, hire_date) VALUES
('Budi Santoso', '08234567890', 'budi@example.com', '1234567890123456', 'Jl. Sudirman No. 123, Jakarta', 'SIM123456789', 'C', '2025-12-31', 'motor', 'priority', 'active', 4.8, '2023-01-15'),
('Siti Rahayu', '08234567891', 'siti@example.com', '1234567890123457', 'Jl. Gatot Subroto No. 456, Jakarta', 'SIM123456790', 'B1', '2025-10-15', 'mobil', 'normal', 'active', 4.5, '2023-02-01'),
('Ahmad Wijaya', '08234567892', 'ahmad@example.com', '1234567890123458', 'Jl. HR Rasuna Said No. 789, Jakarta', 'SIM123456791', 'B2', '2026-03-20', 'pickup', 'normal', 'active', 4.3, '2023-03-10'),
('Dewi Lestari', '08234567893', 'dewi@example.com', '1234567890123459', 'Jl. Thamrin No. 321, Jakarta', 'SIM123456792', 'C', '2025-08-30', 'motor', 'priority', 'active', 4.7, '2023-04-05');

-- Driver-Vehicle Assignments
INSERT INTO driver_vehicles (driver_id, vehicle_id, assigned_date) VALUES
(1, 1, '2023-01-15'),
(2, 2, '2023-02-01'),
(3, 3, '2023-03-10'),
(4, 4, '2023-04-05');

-- Customers
INSERT INTO customers (full_name, phone, email, address, segment, total_orders, total_spent) VALUES
('PT. Teknologi Maju', '02112345678', 'order@tekno-maju.com', 'SCBD Lot 8, Jakarta Selatan', 'VIP', 25, 8500000.00),
('Sarah Aminah', '08567890123', 'sarah.aminah@gmail.com', 'Jl. Kemang Raya No. 45, Jakarta Selatan', 'Regular', 8, 1250000.00),
('Budi Hartono', '08567890124', 'budi.hartono@yahoo.com', 'Jl. Menteng Dalam No. 12, Jakarta Pusat', 'New', 2, 150000.00),
('CV. Sumber Rejeki', '02187654321', 'admin@sumberrejeki.co.id', 'Jl. Pluit Raya No. 88, Jakarta Utara', 'Regular', 15, 3200000.00);

-- Orders
INSERT INTO orders (order_number, customer_id, driver_id, vehicle_id, pickup_address, delivery_address, distance_km, weight_kg, base_fare, total_amount, status, payment_method) VALUES
('ORD20241201001', 1, 1, 1, 'SCBD Lot 8, Jakarta Selatan', 'Jl. Sudirman No. 200, Jakarta Pusat', 12.5, 5.0, 25000, 35000, 'delivered', 'corporate'),
('ORD20241201002', 2, 2, 2, 'Jl. Kemang Raya No. 45, Jakarta Selatan', 'Jl. Kuningan No. 88, Jakarta Selatan', 8.2, 15.0, 30000, 45000, 'in_transit', 'ewallet'),
('ORD20241201003', 3, NULL, NULL, 'Jl. Menteng Dalam No. 12, Jakarta Pusat', 'Jl. Cikini Raya No. 55, Jakarta Pusat', 5.1, 2.0, 20000, 25000, 'pending', 'cash'),
('ORD20241201004', 4, 3, 3, 'Jl. Pluit Raya No. 88, Jakarta Utara', 'Jl. Kelapa Gading No. 123, Jakarta Utara', 15.8, 50.0, 40000, 75000, 'assigned', 'transfer');

-- Pricing Rules
INSERT INTO pricing_rules (rule_name, vehicle_type, base_fare, per_km_rate, per_kg_rate, minimum_fare, valid_from) VALUES
('Motor Jakarta 2024', 'motor', 15000, 2500, 500, 20000, '2024-01-01'),
('Mobil Jakarta 2024', 'mobil', 25000, 3500, 1000, 30000, '2024-01-01'),
('Pickup Jakarta 2024', 'pickup', 35000, 4500, 1500, 40000, '2024-01-01'),
('Truck Jakarta 2024', 'truck', 50000, 6000, 2000, 60000, '2024-01-01');

-- Promotions
INSERT INTO promotions (code, name, description, type, value, minimum_order_amount, start_date, end_date) VALUES
('NEWUSER50', 'Diskon New User', 'Diskon 50% untuk pengguna baru', 'percentage', 50.00, 25000, '2024-01-01', '2024-12-31'),
('FASTDELIVERY', 'Gratis Ongkir Express', 'Gratis ongkos kirim untuk pengiriman express', 'free_delivery', 0.00, 50000, '2024-01-01', '2024-06-30'),
('LOYAL100K', 'Cashback 100K', 'Cashback Rp 100.000 untuk pelanggan setia', 'fixed_amount', 100000.00, 500000, '2024-01-01', '2024-12-31');

-- System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES
('max_delivery_radius_km', '50', 'number', 'operational', 'Radius maksimum pengiriman dalam kilometer'),
('default_language', 'id', 'string', 'localization', 'Bahasa default sistem'),
('emergency_contact_number', '08001234567', 'string', 'safety', 'Nomor kontak darurat'),
('weather_api_enabled', 'true', 'boolean', 'features', 'Aktifkan integrasi weather API'),
('driver_break_interval_hours', '4', 'number', 'safety', 'Interval wajib istirahat driver dalam jam'),
('max_working_hours_per_day', '12', 'number', 'safety', 'Maksimum jam kerja driver per hari');

-- Daily Analytics (contoh data 7 hari terakhir)
INSERT INTO daily_analytics (date, total_orders, completed_orders, cancelled_orders, total_revenue, active_drivers) VALUES
('2024-11-25', 145, 132, 13, 4250000.00, 18),
('2024-11-26', 167, 155, 12, 4890000.00, 20),
('2024-11-27', 134, 125, 9, 3950000.00, 17),
('2024-11-28', 189, 175, 14, 5650000.00, 22),
('2024-11-29', 156, 145, 11, 4320000.00, 19),
('2024-11-30', 178, 165, 13, 5120000.00, 21),
('2024-12-01', 198, 185, 13, 5850000.00, 23);

-- Driver Safety Status
INSERT INTO driver_safety_status (driver_id, status, last_heartbeat, fatigue_level, driving_hours_today, location_lat, location_lng) VALUES
(1, 'safe', NOW(), 'low', 6.5, -6.200000, 106.816666),
(2, 'safe', NOW(), 'medium', 8.2, -6.234567, 106.845678),
(3, 'alert', NOW(), 'high', 10.1, -6.189012, 106.823456),
(4, 'safe', NOW(), 'low', 4.3, -6.178901, 106.834567);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Orders performance indexes
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
CREATE INDEX idx_orders_driver_status ON orders(driver_id, status);
CREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at);

-- Drivers performance indexes  
CREATE INDEX idx_drivers_status_priority ON drivers(status, priority_level);
CREATE INDEX idx_drivers_location ON drivers(current_location_lat, current_location_lng);
CREATE INDEX idx_drivers_vehicle_type ON drivers(vehicle_type, status);

-- Notifications performance indexes
CREATE INDEX idx_notifications_target_status ON notifications(target_type, target_id, status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at, status);

-- Analytics performance indexes
CREATE INDEX idx_daily_analytics_date ON daily_analytics(date);
CREATE INDEX idx_safety_incidents_driver_date ON safety_incidents(driver_id, created_at);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Driver performance summary view
CREATE VIEW driver_performance_summary AS
SELECT 
    d.id,
    d.full_name,
    d.vehicle_type,
    d.priority_level,
    d.status,
    d.rating,
    d.total_orders,
    d.completion_rate,
    d.response_time_avg,
    dss.status as safety_status,
    dss.fatigue_level,
    dss.driving_hours_today,
    COUNT(o.id) as orders_today,
    SUM(o.total_amount) as revenue_today
FROM drivers d
LEFT JOIN driver_safety_status dss ON d.id = dss.driver_id
LEFT JOIN orders o ON d.id = o.driver_id AND DATE(o.created_at) = CURDATE()
GROUP BY d.id;

-- Active orders summary view
CREATE VIEW active_orders_summary AS
SELECT 
    o.*,
    c.full_name as customer_name,
    c.phone as customer_phone,
    d.full_name as driver_name,
    d.phone as driver_phone,
    v.license_plate,
    v.vehicle_type
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN drivers d ON o.driver_id = d.id
LEFT JOIN vehicles v ON o.vehicle_id = v.id
WHERE o.status IN ('pending', 'assigned', 'picked_up', 'in_transit');

-- Revenue summary view
CREATE VIEW revenue_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
    SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN status = 'delivered' THEN total_amount ELSE NULL END) as avg_order_value
FROM orders
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure untuk assign driver otomatis ke order
CREATE PROCEDURE assign_driver_to_order(
    IN order_id INT,
    OUT assigned_driver_id INT,
    OUT assignment_status VARCHAR(20)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE driver_id INT;
    DECLARE driver_priority VARCHAR(20);
    DECLARE driver_distance DECIMAL(10,2);
    
    -- Cursor untuk mencari driver terbaik
    DECLARE driver_cursor CURSOR FOR
        SELECT d.id, d.priority_level,
               (6371 * acos(cos(radians(o.pickup_latitude)) 
                * cos(radians(d.current_location_lat)) 
                * cos(radians(d.current_location_lng) - radians(o.pickup_longitude)) 
                + sin(radians(o.pickup_latitude)) 
                * sin(radians(d.current_location_lat)))) AS distance
        FROM drivers d, orders o
        WHERE o.id = order_id
          AND d.status = 'active'
          AND d.is_online = TRUE
          AND d.vehicle_type = (SELECT vehicle_type FROM orders WHERE id = order_id LIMIT 1)
          AND d.id NOT IN (
              SELECT driver_id FROM orders 
              WHERE driver_id IS NOT NULL 
                AND status IN ('assigned', 'picked_up', 'in_transit')
          )
        ORDER BY d.priority_level DESC, distance ASC, d.rating DESC
        LIMIT 5;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SET assigned_driver_id = NULL;
    SET assignment_status = 'NO_DRIVER_AVAILABLE';
    
    OPEN driver_cursor;
    
    driver_loop: LOOP
        FETCH driver_cursor INTO driver_id, driver_priority, driver_distance;
        
        IF done THEN
            LEAVE driver_loop;
        END IF;
        
        -- Check jarak maksimum (50km)
        IF driver_distance <= 50 THEN
            -- Assign driver ke order
            UPDATE orders 
            SET driver_id = driver_id, 
                status = 'assigned',
                assigned_at = NOW()
            WHERE id = order_id;
            
            SET assigned_driver_id = driver_id;
            SET assignment_status = 'SUCCESS';
            LEAVE driver_loop;
        END IF;
    END LOOP;
    
    CLOSE driver_cursor;
END//

-- Procedure untuk update driver location
CREATE PROCEDURE update_driver_location(
    IN driver_id INT,
    IN lat DECIMAL(10,8),
    IN lng DECIMAL(11,8),
    IN speed DECIMAL(5,2),
    IN battery_level INT
)
BEGIN
    -- Update driver location
    UPDATE drivers 
    SET current_location_lat = lat,
        current_location_lng = lng,
        last_active = NOW(),
        is_online = TRUE
    WHERE id = driver_id;
    
    -- Update safety status
    INSERT INTO driver_safety_status (driver_id, status, last_heartbeat, current_speed, location_lat, location_lng, battery_level)
    VALUES (driver_id, 'safe', NOW(), speed, lat, lng, battery_level)
    ON DUPLICATE KEY UPDATE
        last_heartbeat = NOW(),
        current_speed = speed,
        location_lat = lat,
        location_lng = lng,
        battery_level = battery_level,
        updated_at = NOW();
END//

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger untuk update customer statistics setelah order selesai
CREATE TRIGGER update_customer_stats_after_order
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE customers 
        SET total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total_amount,
            average_order_value = total_spent / total_orders,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
END//

-- Trigger untuk update driver statistics setelah order selesai
CREATE TRIGGER update_driver_stats_after_order
AFTER UPDATE ON orders  
FOR EACH ROW
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE drivers 
        SET total_orders = total_orders + 1,
            total_earnings = total_earnings + (NEW.total_amount * 0.8), -- 80% untuk driver
            completion_rate = (
                SELECT (COUNT(CASE WHEN status = 'delivered' THEN 1 END) * 100.0 / COUNT(*))
                FROM orders 
                WHERE driver_id = NEW.driver_id
            ),
            updated_at = NOW()
        WHERE id = NEW.driver_id;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- SECURITY & PERMISSIONS
-- =====================================================

-- Create aplikasi users
CREATE USER 'bakusam_app'@'%' IDENTIFIED BY 'BakusamApp2024!';
CREATE USER 'bakusam_readonly'@'%' IDENTIFIED BY 'BakusamRead2024!';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON bakusam_express.* TO 'bakusam_app'@'%';
GRANT SELECT ON bakusam_express.* TO 'bakusam_readonly'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- =====================================================
-- END OF BAKUSAM EXPRESS DATABASE SCHEMA
-- =====================================================

-- Database telah siap digunakan!
-- Total tables: 14
-- Total views: 3  
-- Total procedures: 2
-- Total triggers: 2
-- Features: Multi-language, Safety monitoring, Analytics, Route optimization