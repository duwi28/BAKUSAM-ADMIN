import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import driverApi from "./driver-api";
import { DriverRecommendationEngine } from "./driver-recommendation";
import { insertDriverSchema, insertCustomerSchema, insertVehicleSchema, insertOrderSchema, insertPricingRuleSchema, insertPromotionSchema, insertNotificationSchema, insertComplaintSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const driverStats = await storage.getDriverStats();
      const orderStats = await storage.getOrderStats();
      const revenueStats = await storage.getRevenueStats();
      
      res.json({
        drivers: driverStats,
        orders: orderStats,
        revenue: revenueStats
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const driverData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(driverData);
      res.status(201).json(driver);
    } catch (error) {
      res.status(400).json({ message: "Invalid driver data" });
    }
  });

  app.patch("/api/drivers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const driver = await storage.updateDriver(id, updates);
      
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: "Failed to update driver" });
    }
  });

  // Update driver priority level
  app.patch("/api/drivers/:id/priority", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { priorityLevel } = req.body;

      if (!priorityLevel || !["priority", "normal"].includes(priorityLevel)) {
        return res.status(400).json({ message: "Level prioritas tidak valid" });
      }

      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ message: "Driver tidak ditemukan" });
      }

      await storage.updateDriver(driverId, { priorityLevel });

      const priorityText = priorityLevel === "priority" ? "👑 Prioritas" : "👤 Normal";
      res.json({ 
        message: `Berhasil mengubah level prioritas driver ${driver.fullName} menjadi ${priorityText}`,
        priorityLevel 
      });
    } catch (error) {
      console.error("Error updating driver priority:", error);
      res.status(500).json({ message: "Gagal memperbarui level prioritas driver" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const customer = await storage.updateCustomer(id, updates);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      
      // Enrich orders with customer and driver data
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const customer = await storage.getCustomer(order.customerId);
          const driver = order.driverId ? await storage.getDriver(order.driverId) : null;
          
          return {
            ...order,
            customer: customer ? { id: customer.id, fullName: customer.fullName, phone: customer.phone } : null,
            driver: driver ? { id: driver.id, fullName: driver.fullName, phone: driver.phone } : null
          };
        })
      );
      
      res.json(enrichedOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  // Create manual order
  app.post("/api/orders/manual", async (req, res) => {
    try {
      const {
        pickupAddress,
        pickupPhone,
        deliveryAddress,
        deliveryPhone,
        advanceAmount,
        baseFare,
        totalFare,
        itemType,
        itemDescription,
        vehicleType,
        priority,
        notes
      } = req.body;

      // Validation
      if (!pickupAddress || !deliveryAddress || !pickupPhone || !deliveryPhone) {
        return res.status(400).json({ message: "Alamat dan nomor HP wajib diisi" });
      }

      // Create a dummy customer for manual orders
      const customerData = {
        fullName: `Customer Manual Order`,
        phone: pickupPhone,
        email: `manual_${Date.now()}@bakusamexpress.com`,
        address: pickupAddress
      };
      
      const customer = await storage.createCustomer(customerData);

      // Create the order
      const orderData = {
        customerId: customer.id,
        pickupAddress: `${pickupAddress} (Tel: ${pickupPhone})`,
        deliveryAddress: `${deliveryAddress} (Tel: ${deliveryPhone})`,
        distance: "0 km", // Will be calculated later
        baseFare: baseFare?.toString() || "0",
        totalFare: totalFare?.toString() || "0",
        status: priority === "urgent" ? "urgent" : "pending",
        notes: `Manual Order - ${itemType}\n${itemDescription || ""}\nTalangan: Rp ${advanceAmount || 0}\nVehicle: ${vehicleType}\n${notes || ""}`
      };

      const order = await storage.createOrder(orderData);
      
      res.status(201).json({
        message: "Order manual berhasil dibuat",
        order,
        customer
      });
    } catch (error) {
      console.error("Error creating manual order:", error);
      res.status(500).json({ message: "Gagal membuat order manual" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const order = await storage.updateOrder(id, updates);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      
      // Enrich vehicles with driver data
      const enrichedVehicles = await Promise.all(
        vehicles.map(async (vehicle) => {
          const driver = await storage.getDriver(vehicle.driverId);
          return {
            ...vehicle,
            driver: driver ? { id: driver.id, fullName: driver.fullName } : null
          };
        })
      );
      
      res.json(enrichedVehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  // Pricing Rules
  app.get("/api/pricing-rules", async (req, res) => {
    try {
      const rules = await storage.getPricingRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pricing rules" });
    }
  });

  app.post("/api/pricing-rules", async (req, res) => {
    try {
      const ruleData = insertPricingRuleSchema.parse(req.body);
      const rule = await storage.createPricingRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid pricing rule data" });
    }
  });

  // Promotions
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions", async (req, res) => {
    try {
      const promotionData = insertPromotionSchema.parse(req.body);
      const promotion = await storage.createPromotion(promotionData);
      res.status(201).json(promotion);
    } catch (error) {
      res.status(400).json({ message: "Invalid promotion data" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  // Complaints
  app.get("/api/complaints", async (req, res) => {
    try {
      const complaints = await storage.getComplaints();
      
      // Enrich complaints with order, customer, and driver data
      const enrichedComplaints = await Promise.all(
        complaints.map(async (complaint) => {
          const order = await storage.getOrder(complaint.orderId);
          const customer = await storage.getCustomer(complaint.customerId);
          const driver = complaint.driverId ? await storage.getDriver(complaint.driverId) : null;
          
          return {
            ...complaint,
            order: order ? { id: order.id, pickupAddress: order.pickupAddress, deliveryAddress: order.deliveryAddress } : null,
            customer: customer ? { id: customer.id, fullName: customer.fullName } : null,
            driver: driver ? { id: driver.id, fullName: driver.fullName } : null
          };
        })
      );
      
      res.json(enrichedComplaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    try {
      const complaintData = insertComplaintSchema.parse(req.body);
      const complaint = await storage.createComplaint(complaintData);
      res.status(201).json(complaint);
    } catch (error) {
      res.status(400).json({ message: "Invalid complaint data" });
    }
  });

  // System Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.patch("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const setting = await storage.updateSystemSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  // Driver Priority System APIs
  app.post("/api/drivers/:id/priority/upgrade", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { reason, expiryDate } = req.body;
      
      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }

      const updatedDriver = await storage.updateDriver(driverId, {
        priorityLevel: "priority",
        priorityExpiryDate: expiryDate ? new Date(expiryDate) : null
      });

      res.json({ 
        success: true, 
        driver: updatedDriver,
        message: "Driver berhasil di-upgrade ke prioritas"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upgrade driver priority" });
    }
  });

  app.post("/api/drivers/:id/priority/downgrade", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      
      const updatedDriver = await storage.updateDriver(driverId, {
        priorityLevel: "normal",
        priorityExpiryDate: null
      });

      res.json({ 
        success: true, 
        driver: updatedDriver,
        message: "Driver berhasil diturunkan ke level normal"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to downgrade driver priority" });
    }
  });

  app.post("/api/drivers/:id/advertising/toggle", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { isAdvertising } = req.body;
      
      const updatedDriver = await storage.updateDriver(driverId, {
        isAdvertising: isAdvertising
      });

      res.json({ 
        success: true, 
        driver: updatedDriver,
        message: isAdvertising ? "Iklan driver diaktifkan" : "Iklan driver dinonaktifkan"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle advertising" });
    }
  });

  app.get("/api/drivers/priority/stats", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      
      const priorityStats = {
        total: drivers.length,
        priority: drivers.filter(d => d.priorityLevel === "priority").length,
        normal: drivers.filter(d => d.priorityLevel === "normal").length,
        advertising: drivers.filter(d => d.isAdvertising).length,
        highRating: drivers.filter(d => parseFloat(d.rating || "0") >= 4.8).length,
        available: drivers.filter(d => d.status === "active").length
      };

      res.json(priorityStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch priority stats" });
    }
  });

  // Driver Balance Management APIs
  app.post("/api/drivers/:id/balance/add", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { amount, description } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Amount harus lebih besar dari 0" });
      }

      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ error: "Driver tidak ditemukan" });
      }

      const previousBalance = driver.balance || 0;
      const newBalance = previousBalance + amount;

      // Update driver balance
      const updatedDriver = await storage.updateDriver(driverId, {
        balance: newBalance
      });

      res.json({
        success: true,
        driver: updatedDriver,
        transaction: {
          previousBalance,
          newBalance,
          amount,
          description
        },
        message: `Berhasil menambah saldo Rp ${amount.toLocaleString('id-ID')}`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to add balance" });
    }
  });

  app.post("/api/drivers/:id/balance/deduct", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const { amount, description } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Amount harus lebih besar dari 0" });
      }

      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ error: "Driver tidak ditemukan" });
      }

      const previousBalance = driver.balance || 0;
      const newBalance = Math.max(0, previousBalance - amount);

      // Update driver balance
      const updatedDriver = await storage.updateDriver(driverId, {
        balance: newBalance
      });

      res.json({
        success: true,
        driver: updatedDriver,
        transaction: {
          previousBalance,
          newBalance,
          amount: -amount,
          description
        },
        message: `Berhasil mengurangi saldo Rp ${amount.toLocaleString('id-ID')}`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to deduct balance" });
    }
  });

  app.get("/api/drivers/:id/balance/history", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      
      // For now, return mock transaction history
      // In real implementation, this would query the balance transactions table
      const mockHistory = [
        {
          id: 1,
          amount: 50000,
          type: "manual_add",
          description: "Top up saldo manual",
          previousBalance: 0,
          newBalance: 50000,
          transactionDate: new Date().toISOString()
        },
        {
          id: 2,
          amount: 25000,
          type: "order_payment",
          description: "Pembayaran order #123",
          previousBalance: 50000,
          newBalance: 75000,
          transactionDate: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      res.json(mockHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance history" });
    }
  });

  app.get("/api/drivers/balance/summary", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      
      const balanceSummary = {
        totalDrivers: drivers.length,
        totalBalance: drivers.reduce((sum, driver) => sum + (driver.balance || 0), 0),
        averageBalance: drivers.length > 0 
          ? Math.round(drivers.reduce((sum, driver) => sum + (driver.balance || 0), 0) / drivers.length)
          : 0,
        driversWithBalance: drivers.filter(d => (d.balance || 0) > 0).length,
        highestBalance: Math.max(...drivers.map(d => d.balance || 0)),
        lowestBalance: Math.min(...drivers.map(d => d.balance || 0))
      };

      res.json(balanceSummary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance summary" });
    }
  });

  // === SISTEM REKOMENDASI DRIVER ===
  
  // API: Mendapatkan rekomendasi driver untuk order tertentu
  app.post("/api/orders/:orderId/driver-recommendations", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { maxRecommendations = 5 } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order tidak ditemukan" });
      }

      const recommendations = await DriverRecommendationEngine.getDriverRecommendations(
        order, 
        maxRecommendations
      );

      res.json({
        success: true,
        order: {
          id: order.id,
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          distance: order.distance
        },
        recommendations,
        totalRecommendations: recommendations.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting driver recommendations:", error);
      res.status(500).json({ error: "Gagal mendapatkan rekomendasi driver" });
    }
  });

  // API: Mendapatkan rekomendasi driver untuk order baru (manual order)
  app.post("/api/driver-recommendations/new-order", async (req, res) => {
    try {
      const { pickupAddress, deliveryAddress, distance, maxRecommendations = 5 } = req.body;
      
      if (!pickupAddress || !deliveryAddress || !distance) {
        return res.status(400).json({ 
          error: "pickupAddress, deliveryAddress, dan distance harus diisi" 
        });
      }

      // Buat object order sementara untuk rekomendasi
      const tempOrder = {
        id: 0,
        customerId: 0,
        driverId: null,
        pickupAddress,
        deliveryAddress,
        distance: distance.toString(),
        baseFare: "0",
        totalFare: "0",
        status: "pending",
        rating: null,
        orderDate: new Date(),
        completedDate: null,
        notes: null
      };

      const recommendations = await DriverRecommendationEngine.getDriverRecommendations(
        tempOrder, 
        maxRecommendations
      );

      res.json({
        success: true,
        orderDetails: { pickupAddress, deliveryAddress, distance },
        recommendations,
        totalRecommendations: recommendations.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting recommendations for new order:", error);
      res.status(500).json({ error: "Gagal mendapatkan rekomendasi driver" });
    }
  });

  // API: Mendapatkan insights performa driver individual
  app.get("/api/drivers/:id/performance-insights", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      
      const insights = await DriverRecommendationEngine.getDriverPerformanceInsights(driverId);

      res.json({
        success: true,
        driverId,
        ...insights,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting driver performance insights:", error);
      res.status(500).json({ error: "Gagal mendapatkan insights performa driver" });
    }
  });

  // API: Mendapatkan ranking driver berdasarkan performa
  app.get("/api/drivers/performance-ranking", async (req, res) => {
    try {
      const { limit = 10, sortBy = 'recommendationScore' } = req.query;
      
      const drivers = await storage.getDrivers();
      const activeDrivers = drivers.filter(d => d.status === 'active');
      
      const driverRankings = [];
      
      for (const driver of activeDrivers) {
        try {
          const insights = await DriverRecommendationEngine.getDriverPerformanceInsights(driver.id);
          
          // Hitung skor rekomendasi untuk ranking
          const tempOrder = {
            id: 0, customerId: 0, driverId: null, pickupAddress: "", 
            deliveryAddress: "", distance: "5", baseFare: "0", totalFare: "0",
            status: "pending", rating: null, orderDate: new Date(), 
            completedDate: null, notes: null
          };
          
          const recommendations = await DriverRecommendationEngine.getDriverRecommendations(tempOrder, 1);
          const recommendationScore = recommendations.length > 0 ? recommendations[0].recommendationScore : 0;
          
          driverRankings.push({
            driver: {
              id: driver.id,
              fullName: driver.fullName,
              vehicleType: driver.vehicleType,
              priorityLevel: driver.priorityLevel,
              rating: driver.rating
            },
            metrics: insights.metrics,
            ranking: insights.ranking,
            recommendationScore,
            topInsights: insights.insights.slice(0, 2)
          });
        } catch (error) {
          console.error(`Error processing driver ${driver.id}:`, error);
        }
      }

      // Sort berdasarkan parameter yang diminta
      if (sortBy === 'completionRate') {
        driverRankings.sort((a, b) => b.metrics.completionRate - a.metrics.completionRate);
      } else if (sortBy === 'rating') {
        driverRankings.sort((a, b) => b.metrics.averageRating - a.metrics.averageRating);
      } else {
        driverRankings.sort((a, b) => b.recommendationScore - a.recommendationScore);
      }

      res.json({
        success: true,
        rankings: driverRankings.slice(0, parseInt(limit as string)),
        sortBy,
        totalDrivers: driverRankings.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting driver rankings:", error);
      res.status(500).json({ error: "Gagal mendapatkan ranking driver" });
    }
  });

  // === FITUR BERBAGI CERITA DAN PENGALAMAN DRIVER ===
  
  // API: Mendapatkan semua cerita driver
  app.get("/api/driver-stories", async (req, res) => {
    try {
      const { category, mood, search } = req.query;
      
      // Mock data cerita driver untuk demonstrasi
      const mockStories = [
        {
          id: 1,
          driverId: 1,
          title: "Pengalaman Pertama Mengantar di Hujan Deras",
          content: "Hari itu hujan sangat deras, tapi saya tetap harus mengantar orderan. Awalnya takut, tapi ternyata customer sangat pengertian dan bahkan memberi tip tambahan. Pelajaran penting: selalu bawa jas hujan dan komunikasi yang baik dengan customer adalah kunci!",
          category: "experience",
          mood: "positive",
          tags: ["hujan", "tips", "customer", "pengalaman"],
          isAnonymous: false,
          isApproved: true,
          likesCount: 15,
          commentsCount: 8,
          viewsCount: 120,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          driver: {
            id: 1,
            fullName: "Budi Santoso",
            vehicleType: "Motor",
            rating: "4.8"
          },
          isLiked: false
        },
        {
          id: 2,
          driverId: 2,
          title: "Tips Hemat BBM untuk Driver Motor",
          content: "Setelah 3 tahun jadi driver, saya menemukan cara menghemat BBM hingga 30%. Kuncinya: jaga kecepatan konstan 40-50 km/jam, hindari rem mendadak, dan pastikan angin ban selalu cukup. Juga, pilih rute yang minim macet meski agak jauh.",
          category: "tips",
          mood: "educational",
          tags: ["hemat", "bbm", "motor", "tips"],
          isAnonymous: false,
          isApproved: true,
          likesCount: 32,
          commentsCount: 15,
          viewsCount: 280,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          driver: {
            id: 2,
            fullName: "Sari Wahyuni",
            vehicleType: "Motor",
            rating: "4.9"
          },
          isLiked: true
        },
        {
          id: 3,
          driverId: 1,
          title: "Cerita Lucu: Customer yang Lupa Alamat",
          content: "Ada customer yang pesan tapi lupa alamat lengkap. Dia cuma bilang 'rumah warna biru di dekat warung'. Saya keliling 1 jam, akhirnya ketemu setelah telpon 5 kali. Ternyata rumahnya hijau, bukan biru! Tapi customer baik hati, kasih tip besar karena merasa bersalah 😄",
          category: "funny",
          mood: "positive",
          tags: ["lucu", "customer", "alamat", "pengalaman"],
          isAnonymous: false,
          isApproved: true,
          likesCount: 45,
          commentsCount: 22,
          viewsCount: 350,
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          driver: {
            id: 1,
            fullName: "Budi Santoso",
            vehicleType: "Motor",
            rating: "4.8"
          },
          isLiked: false
        },
        {
          id: 4,
          driverId: 3,
          title: "Strategi Mencari Order di Jam Sepi",
          content: "Jam 2-4 siang biasanya sepi order. Tapi saya punya trik: tunggu di dekat rumah sakit, perkantoran, atau mall. Biasanya ada yang butuh antar makanan atau dokumen mendadak. Juga, aktifkan notifikasi dari semua platform delivery.",
          category: "tips",
          mood: "educational",
          tags: ["strategi", "jam sepi", "lokasi", "order"],
          isAnonymous: false,
          isApproved: true,
          likesCount: 28,
          commentsCount: 12,
          viewsCount: 195,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          driver: {
            id: 3,
            fullName: "Driver Anonim",
            vehicleType: "Motor",
            rating: "4.7"
          },
          isLiked: false
        }
      ];

      let filteredStories = mockStories;

      // Filter berdasarkan kategori
      if (category && category !== 'all') {
        filteredStories = filteredStories.filter(story => story.category === category);
      }

      // Filter berdasarkan mood
      if (mood) {
        filteredStories = filteredStories.filter(story => story.mood === mood);
      }

      // Filter berdasarkan pencarian
      if (search) {
        const searchLower = search.toString().toLowerCase();
        filteredStories = filteredStories.filter(story => 
          story.title.toLowerCase().includes(searchLower) ||
          story.content.toLowerCase().includes(searchLower) ||
          story.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      res.json(filteredStories);
    } catch (error) {
      console.error("Error fetching driver stories:", error);
      res.status(500).json({ error: "Gagal mengambil cerita driver" });
    }
  });

  // API: Membuat cerita driver baru
  app.post("/api/driver-stories", async (req, res) => {
    try {
      const { title, content, category, mood, tags, isAnonymous, driverId } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Judul dan konten cerita harus diisi" });
      }

      const newStory = {
        id: Date.now(), // Simple ID generation for demo
        driverId,
        title,
        content,
        category: category || 'experience',
        mood: mood || 'positive',
        tags: tags || [],
        isAnonymous: isAnonymous || false,
        isApproved: false, // Perlu moderasi admin
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        driver: {
          id: driverId,
          fullName: isAnonymous ? "Driver Anonim" : "User Baru",
          vehicleType: "Motor",
          rating: "4.5"
        },
        isLiked: false
      };

      res.status(201).json({
        success: true,
        message: "Cerita berhasil dibuat dan menunggu persetujuan admin",
        story: newStory
      });
    } catch (error) {
      console.error("Error creating driver story:", error);
      res.status(500).json({ error: "Gagal membuat cerita" });
    }
  });

  // API: Like/Unlike cerita
  app.post("/api/driver-stories/:id/like", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const { driverId } = req.body;

      // Simulasi toggle like
      res.json({
        success: true,
        message: "Like berhasil ditoggle",
        newLikeCount: Math.floor(Math.random() * 50) + 10
      });
    } catch (error) {
      console.error("Error toggling story like:", error);
      res.status(500).json({ error: "Gagal toggle like" });
    }
  });

  // API: Mendapatkan tips driver
  app.get("/api/driver-tips", async (req, res) => {
    try {
      const { category, difficulty } = req.query;

      // Mock data tips driver
      const mockTips = [
        {
          id: 1,
          driverId: 1,
          title: "Cara Membaca GPS dengan Efektif",
          content: "Sebelum berangkat, pelajari dulu rute di GPS. Catat landmark penting seperti spbu, minimarket, atau gedung tinggi. Jangan hanya andalkan suara GPS, karena kadang sinyal hilang di area padat.",
          category: "navigation",
          difficulty: "beginner",
          helpfulCount: 25,
          isVerified: true,
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          driver: {
            id: 1,
            fullName: "Budi Santoso",
            vehicleType: "Motor"
          },
          isHelpful: false
        },
        {
          id: 2,
          driverId: 2,
          title: "Komunikasi Sopan dengan Customer Marah",
          content: "Jika customer marah, tetap tenang dan dengarkan keluhan mereka. Minta maaf meski bukan salah kita, lalu tawarkan solusi. Hindari membalas dengan nada tinggi. Ingat, review buruk bisa merusak rating kita.",
          category: "customer_service",
          difficulty: "intermediate",
          helpfulCount: 18,
          isVerified: true,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          driver: {
            id: 2,
            fullName: "Sari Wahyuni",
            vehicleType: "Motor"
          },
          isHelpful: true
        },
        {
          id: 3,
          driverId: 3,
          title: "Perawatan Motor Harian untuk Driver",
          content: "Setiap pagi, cek tekanan ban, oli mesin, dan rem. Bersihkan kaca spion dan lampu. Sekali seminggu, cuci motor dan cek busi. Motor yang terawat = performa maksimal = penghasilan optimal.",
          category: "vehicle_maintenance",
          difficulty: "beginner",
          helpfulCount: 31,
          isVerified: false,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          driver: {
            id: 3,
            fullName: "Agus Pratama",
            vehicleType: "Motor"
          },
          isHelpful: false
        }
      ];

      let filteredTips = mockTips;

      if (category) {
        filteredTips = filteredTips.filter(tip => tip.category === category);
      }

      if (difficulty) {
        filteredTips = filteredTips.filter(tip => tip.difficulty === difficulty);
      }

      res.json(filteredTips);
    } catch (error) {
      console.error("Error fetching driver tips:", error);
      res.status(500).json({ error: "Gagal mengambil tips driver" });
    }
  });

  // API: Membuat tip baru
  app.post("/api/driver-tips", async (req, res) => {
    try {
      const { title, content, category, difficulty, driverId } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Judul dan konten tips harus diisi" });
      }

      const newTip = {
        id: Date.now(),
        driverId,
        title,
        content,
        category: category || 'navigation',
        difficulty: difficulty || 'beginner',
        helpfulCount: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
        driver: {
          id: driverId,
          fullName: "User Baru",
          vehicleType: "Motor"
        },
        isHelpful: false
      };

      res.status(201).json({
        success: true,
        message: "Tips berhasil dibuat",
        tip: newTip
      });
    } catch (error) {
      console.error("Error creating driver tip:", error);
      res.status(500).json({ error: "Gagal membuat tips" });
    }
  });

  // API: Tandai tips sebagai helpful
  app.post("/api/driver-tips/:id/helpful", async (req, res) => {
    try {
      const tipId = parseInt(req.params.id);
      const { driverId, isHelpful } = req.body;

      res.json({
        success: true,
        message: isHelpful ? "Tips ditandai helpful" : "Tips ditandai tidak helpful",
        newHelpfulCount: Math.floor(Math.random() * 40) + 5
      });
    } catch (error) {
      console.error("Error marking tip as helpful:", error);
      res.status(500).json({ error: "Gagal menandai tips" });
    }
  });

  // === SISTEM KESELAMATAN DRIVER REAL-TIME ===

  // Safety Alerts API
  app.get("/api/safety-alerts", async (req, res) => {
    try {
      const alerts = await storage.getSafetyAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching safety alerts:", error);
      res.status(500).json({ error: "Failed to fetch safety alerts" });
    }
  });

  app.post("/api/safety-alerts", async (req, res) => {
    try {
      const validatedData = insertSafetyAlertSchema.parse(req.body);
      const newAlert = await storage.createSafetyAlert(validatedData);
      res.status(201).json(newAlert);
    } catch (error) {
      console.error("Error creating safety alert:", error);
      res.status(400).json({ error: "Invalid safety alert data" });
    }
  });

  app.post("/api/safety-alerts/:id/acknowledge", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const updatedAlert = await storage.acknowledgeSafetyAlert(alertId);
      
      if (!updatedAlert) {
        return res.status(404).json({ error: "Safety alert not found" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      console.error("Error acknowledging safety alert:", error);
      res.status(500).json({ error: "Failed to acknowledge safety alert" });
    }
  });

  // Driver Safety Status API
  app.get("/api/driver-safety-status", async (req, res) => {
    try {
      const statuses = await storage.getDriverSafetyStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching driver safety statuses:", error);
      res.status(500).json({ error: "Failed to fetch driver safety statuses" });
    }
  });

  app.post("/api/driver-safety/:driverId/emergency", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      await storage.triggerEmergencyAlert(driverId);
      
      // Create emergency alert
      await storage.createSafetyAlert({
        driverId: driverId,
        alertType: "emergency",
        severity: "critical",
        title: "EMERGENCY ALERT - Driver Panic Button",
        message: "Driver telah mengaktifkan tombol darurat. Segera hubungi dan berikan bantuan!",
        location: "GPS tracking active",
        isActive: true,
        isAcknowledged: false,
        expiresAt: null,
        metadata: null
      });
      
      res.json({ success: true, message: "Emergency alert triggered" });
    } catch (error) {
      console.error("Error triggering emergency alert:", error);
      res.status(500).json({ error: "Failed to trigger emergency alert" });
    }
  });

  app.patch("/api/driver-safety-status/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const updates = req.body;
      
      const updatedStatus = await storage.updateDriverSafetyStatus(driverId, updates);
      
      if (!updatedStatus) {
        return res.status(404).json({ error: "Driver safety status not found" });
      }
      
      res.json(updatedStatus);
    } catch (error) {
      console.error("Error updating driver safety status:", error);
      res.status(500).json({ error: "Failed to update driver safety status" });
    }
  });

  // Safety Incidents API
  app.get("/api/safety-incidents", async (req, res) => {
    try {
      const incidents = await storage.getSafetyIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching safety incidents:", error);
      res.status(500).json({ error: "Failed to fetch safety incidents" });
    }
  });

  app.post("/api/safety-incidents", async (req, res) => {
    try {
      const validatedData = insertSafetyIncidentSchema.parse(req.body);
      const newIncident = await storage.createSafetyIncident(validatedData);
      res.status(201).json(newIncident);
    } catch (error) {
      console.error("Error creating safety incident:", error);
      res.status(400).json({ error: "Invalid safety incident data" });
    }
  });

  app.patch("/api/safety-incidents/:id", async (req, res) => {
    try {
      const incidentId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedIncident = await storage.updateSafetyIncident(incidentId, updates);
      
      if (!updatedIncident) {
        return res.status(404).json({ error: "Safety incident not found" });
      }
      
      res.json(updatedIncident);
    } catch (error) {
      console.error("Error updating safety incident:", error);
      res.status(500).json({ error: "Failed to update safety incident" });
    }
  });

  // Safety Statistics API
  app.get("/api/safety-statistics", async (req, res) => {
    try {
      const stats = await storage.getSafetyStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching safety statistics:", error);
      res.status(500).json({ error: "Failed to fetch safety statistics" });
    }
  });

  // Driver API routes
  app.use("/api/driver", driverApi);

  const httpServer = createServer(app);
  return httpServer;
}
