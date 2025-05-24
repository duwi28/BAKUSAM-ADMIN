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
      // Sample data untuk demonstrasi sistem keselamatan driver
      const sampleAlerts = [
        {
          id: 1,
          driverId: 1,
          alertType: "weather",
          severity: "high",
          title: "Peringatan Cuaca Buruk",
          message: "Hujan deras dan angin kencang diperkirakan di area Menteng. Harap berhati-hati dalam berkendara.",
          location: "Jakarta Pusat - Menteng",
          isActive: true,
          isAcknowledged: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          expiresAt: new Date(Date.now() + 7200000).toISOString(),
          driver: {
            id: 1,
            fullName: "Budi Santoso",
            vehicleType: "motor",
            phone: "081234567890"
          }
        },
        {
          id: 2,
          driverId: 2,
          alertType: "traffic",
          severity: "medium",
          title: "Kemacetan Parah",
          message: "Kemacetan panjang di Jalan Sudirman akibat kecelakaan. Gunakan rute alternatif.",
          location: "Jalan Sudirman",
          isActive: true,
          isAcknowledged: true,
          acknowledgedAt: new Date(Date.now() - 1800000).toISOString(),
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          driver: {
            id: 2,
            fullName: "Siti Rahayu",
            vehicleType: "mobil",
            phone: "082345678901"
          }
        }
      ];
      
      res.json(sampleAlerts);
    } catch (error) {
      console.error("Error fetching safety alerts:", error);
      res.status(500).json({ error: "Failed to fetch safety alerts" });
    }
  });

  app.post("/api/safety-alerts", async (req, res) => {
    try {
      const { driverId, alertType, severity, title, message, location } = req.body;
      
      const newAlert = {
        id: Date.now(),
        driverId,
        alertType,
        severity,
        title,
        message,
        location,
        isActive: true,
        isAcknowledged: false,
        createdAt: new Date().toISOString(),
        expiresAt: null
      };
      
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
      // Sample data untuk status keselamatan driver real-time
      const sampleStatuses = [
        {
          id: 1,
          driverId: 1,
          currentLocation: "Jakarta Selatan - Blok M",
          speed: 25,
          isOnDuty: true,
          lastActiveTime: new Date(Date.now() - 300000).toISOString(),
          batteryLevel: 85,
          signalStrength: 95,
          safetyScore: 92,
          emergencyContact: "081234567890",
          isInEmergency: false,
          driver: {
            id: 1,
            fullName: "Budi Santoso",
            vehicleType: "motor",
            phone: "081234567890"
          }
        },
        {
          id: 2,
          driverId: 2,
          currentLocation: "Jakarta Pusat - Menteng",
          speed: 15,
          isOnDuty: true,
          lastActiveTime: new Date(Date.now() - 180000).toISOString(),
          batteryLevel: 45,
          signalStrength: 78,
          safetyScore: 88,
          emergencyContact: "082345678901",
          isInEmergency: false,
          driver: {
            id: 2,
            fullName: "Siti Rahayu",
            vehicleType: "mobil",
            phone: "082345678901"
          }
        }
      ];
      
      res.json(sampleStatuses);
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
      // Sample data untuk insiden keselamatan
      const sampleIncidents = [
        {
          id: 1,
          driverId: 1,
          incidentType: "accident",
          severity: "moderate",
          description: "Kecelakaan ringan dengan motor lain di persimpangan. Tidak ada korban jiwa, hanya luka ringan.",
          location: "Persimpangan Jalan Sudirman - Thamrin",
          reportedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "investigating",
          driver: {
            id: 1,
            fullName: "Budi Santoso",
            vehicleType: "motor"
          }
        },
        {
          id: 2,
          driverId: 2,
          incidentType: "breakdown",
          severity: "minor",
          description: "Ban bocor di tengah jalan, memerlukan bantuan derek untuk penggantian ban.",
          location: "Jalan Gatot Subroto KM 5",
          reportedAt: new Date(Date.now() - 172800000).toISOString(),
          status: "resolved",
          driver: {
            id: 2,
            fullName: "Siti Rahayu",
            vehicleType: "mobil"
          }
        }
      ];
      
      res.json(sampleIncidents);
    } catch (error) {
      console.error("Error fetching safety incidents:", error);
      res.status(500).json({ error: "Failed to fetch safety incidents" });
    }
  });

  app.post("/api/safety-incidents", async (req, res) => {
    try {
      const { driverId, incidentType, severity, description, location } = req.body;
      
      const newIncident = {
        id: Date.now(),
        driverId,
        incidentType,
        severity,
        description,
        location,
        reportedAt: new Date().toISOString(),
        status: "reported"
      };
      
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
      // Sample statistik keselamatan untuk demonstrasi
      const sampleStats = {
        totalAlerts: 15,
        activeAlerts: 8,
        emergencyCount: 1,
        averageSafetyScore: 89,
        incidentsByType: {
          accident: 3,
          breakdown: 2,
          emergency: 1,
          harassment: 0,
          theft: 1
        }
      };
      
      res.json(sampleStats);
    } catch (error) {
      console.error("Error fetching safety statistics:", error);
      res.status(500).json({ error: "Failed to fetch safety statistics" });
    }
  });

  // === HEAT MAP AREA RAMAI ANALYTICS ===

  // Heat Map Data API
  app.get("/api/heat-map", async (req, res) => {
    try {
      const { timeRange = "today", viewMode = "orders" } = req.query;
      
      // Data heat map berdasarkan area real Jakarta
      const heatMapData = [
        {
          id: 1,
          area: "Jakarta Pusat - Menteng",
          coordinates: { lat: -6.1944, lng: 106.8294 },
          orderCount: 245,
          revenue: 1850000,
          averageDistance: 3.2,
          averageWaitTime: 4.5,
          peakHours: ["07:00-09:00", "12:00-14:00", "17:00-19:00"],
          temperature: 'blazing',
          growthRate: 23.5,
          driverCount: 18,
          customerSatisfaction: 4.8,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 2,
          area: "Jakarta Selatan - Blok M",
          coordinates: { lat: -6.2444, lng: 106.7991 },
          orderCount: 189,
          revenue: 1420000,
          averageDistance: 4.1,
          averageWaitTime: 6.2,
          peakHours: ["11:00-13:00", "18:00-20:00"],
          temperature: 'hot',
          growthRate: 18.2,
          driverCount: 14,
          customerSatisfaction: 4.6,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 3,
          area: "Jakarta Barat - Grogol",
          coordinates: { lat: -6.1675, lng: 106.7853 },
          orderCount: 156,
          revenue: 1180000,
          averageDistance: 5.5,
          averageWaitTime: 8.1,
          peakHours: ["08:00-10:00", "19:00-21:00"],
          temperature: 'warm',
          growthRate: 12.8,
          driverCount: 11,
          customerSatisfaction: 4.4,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 4,
          area: "Jakarta Timur - Cawang",
          coordinates: { lat: -6.2383, lng: 106.8742 },
          orderCount: 98,
          revenue: 740000,
          averageDistance: 6.8,
          averageWaitTime: 12.3,
          peakHours: ["07:00-08:00", "17:00-18:00"],
          temperature: 'cold',
          growthRate: 5.4,
          driverCount: 7,
          customerSatisfaction: 4.2,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 5,
          area: "Jakarta Utara - Kelapa Gading",
          coordinates: { lat: -6.1562, lng: 106.9096 },
          orderCount: 134,
          revenue: 1010000,
          averageDistance: 4.7,
          averageWaitTime: 7.8,
          peakHours: ["09:00-11:00", "15:00-17:00"],
          temperature: 'warm',
          growthRate: 15.3,
          driverCount: 10,
          customerSatisfaction: 4.5,
          lastUpdated: new Date().toISOString()
        }
      ];

      res.json(heatMapData);
    } catch (error) {
      console.error("Error fetching heat map data:", error);
      res.status(500).json({ error: "Failed to fetch heat map data" });
    }
  });

  // Time Slots Analysis API
  app.get("/api/heat-map/time-slots", async (req, res) => {
    try {
      const { timeRange = "today" } = req.query;
      
      // Data analisis per jam berdasarkan pola real ojek online
      const timeSlotData = [
        { hour: 5, orderCount: 8, revenue: 60000, driverAvailability: 95 },
        { hour: 6, orderCount: 15, revenue: 112500, driverAvailability: 85 },
        { hour: 7, orderCount: 45, revenue: 337500, driverAvailability: 72 },
        { hour: 8, orderCount: 65, revenue: 487500, driverAvailability: 58 },
        { hour: 9, orderCount: 38, revenue: 285000, driverAvailability: 67 },
        { hour: 10, orderCount: 28, revenue: 210000, driverAvailability: 78 },
        { hour: 11, orderCount: 42, revenue: 315000, driverAvailability: 65 },
        { hour: 12, orderCount: 58, revenue: 435000, driverAvailability: 52 },
        { hour: 13, orderCount: 48, revenue: 360000, driverAvailability: 61 },
        { hour: 14, orderCount: 35, revenue: 262500, driverAvailability: 73 },
        { hour: 15, orderCount: 29, revenue: 217500, driverAvailability: 81 },
        { hour: 16, orderCount: 31, revenue: 232500, driverAvailability: 76 },
        { hour: 17, orderCount: 52, revenue: 390000, driverAvailability: 48 },
        { hour: 18, orderCount: 61, revenue: 457500, driverAvailability: 42 },
        { hour: 19, orderCount: 44, revenue: 330000, driverAvailability: 59 },
        { hour: 20, orderCount: 33, revenue: 247500, driverAvailability: 68 },
        { hour: 21, orderCount: 25, revenue: 187500, driverAvailability: 79 },
        { hour: 22, orderCount: 18, revenue: 135000, driverAvailability: 88 },
        { hour: 23, orderCount: 12, revenue: 90000, driverAvailability: 92 }
      ];

      res.json(timeSlotData);
    } catch (error) {
      console.error("Error fetching time slot data:", error);
      res.status(500).json({ error: "Failed to fetch time slot data" });
    }
  });

  // Heat Map Statistics API
  app.get("/api/heat-map/statistics", async (req, res) => {
    try {
      const statistics = {
        totalAreas: 25,
        activeAreas: 18,
        hotZones: 6,
        totalOrders: 1247,
        totalRevenue: 9350000,
        averageGrowthRate: 16.8,
        peakTimeStart: "07:00",
        peakTimeEnd: "09:00",
        topPerformingArea: "Jakarta Pusat - Menteng",
        lowestPerformingArea: "Jakarta Timur - Cawang"
      };

      res.json(statistics);
    } catch (error) {
      console.error("Error fetching heat map statistics:", error);
      res.status(500).json({ error: "Failed to fetch heat map statistics" });
    }
  });

  // === PUSH NOTIFICATIONS SYSTEM ===
  
  // Get push notifications history
  app.get("/api/push-notifications", async (req, res) => {
    try {
      const notifications = [
        {
          id: 1,
          title: "Order Baru Tersedia!",
          message: "Ada order pickup di Jakarta Pusat dengan jarak 2.3 km dari lokasi Anda",
          type: "order_new",
          targetType: "all",
          targetIds: [],
          scheduledAt: null,
          sentAt: new Date(Date.now() - 300000).toISOString(),
          status: "sent",
          priority: "normal",
          sound: true,
          vibration: true,
          clickAction: "/orders/123",
          deliveryCount: 15,
          readCount: 12
        },
        {
          id: 2,
          title: "Sistem Maintenance",
          message: "Sistem akan maintenance pada pukul 02:00 - 04:00 WIB malam ini",
          type: "system",
          targetType: "all",
          targetIds: [],
          scheduledAt: null,
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          status: "sent",
          priority: "high",
          sound: false,
          vibration: false,
          clickAction: null,
          deliveryCount: 25,
          readCount: 18
        }
      ];
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching push notifications:", error);
      res.status(500).json({ error: "Failed to fetch push notifications" });
    }
  });

  // Send push notification
  app.post("/api/push-notifications/send", async (req, res) => {
    try {
      const notificationData = req.body;
      
      // In real implementation, integrate with FCM or similar service
      const notification = {
        id: Date.now(),
        ...notificationData,
        sentAt: new Date().toISOString(),
        status: "sent",
        deliveryCount: notificationData.targetType === "all" ? 25 : notificationData.targetIds?.length || 0,
        readCount: 0
      };
      
      res.json({ success: true, notification });
    } catch (error) {
      console.error("Error sending push notification:", error);
      res.status(500).json({ error: "Failed to send push notification" });
    }
  });

  // Get notification templates
  app.get("/api/notification-templates", async (req, res) => {
    try {
      const templates = [
        {
          id: 1,
          name: "Order Baru",
          title: "Order Baru Tersedia!",
          message: "Ada order pickup di {location} dengan jarak {distance} km dari lokasi Anda",
          type: "order_new",
          isActive: true
        },
        {
          id: 2,
          name: "Update Order",
          title: "Update Status Order",
          message: "Status order #{orderId} telah berubah menjadi {status}",
          type: "order_update",
          isActive: true
        }
      ];
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching notification templates:", error);
      res.status(500).json({ error: "Failed to fetch notification templates" });
    }
  });

  // === ADMIN DASHBOARD FEATURES ===

  // Analytics & Reports API
  app.get("/api/analytics", async (req, res) => {
    try {
      const { timeRange, dateFilter } = req.query;
      
      const analyticsData = {
        daily: [
          { date: '1 Jan', orders: 45, revenue: 2250000, drivers: 12, completion: 92 },
          { date: '2 Jan', orders: 52, revenue: 2680000, drivers: 15, completion: 89 },
          { date: '3 Jan', orders: 38, revenue: 1920000, drivers: 10, completion: 95 },
          { date: '4 Jan', orders: 61, revenue: 3150000, drivers: 18, completion: 88 },
          { date: '5 Jan', orders: 49, revenue: 2580000, drivers: 14, completion: 91 },
          { date: '6 Jan', orders: 57, revenue: 2890000, drivers: 16, completion: 93 },
          { date: '7 Jan', orders: 43, revenue: 2280000, drivers: 11, completion: 90 }
        ]
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Bulk Operations API
  app.post("/api/bulk-operations", async (req, res) => {
    try {
      const { type, ids, action, value } = req.body;
      
      // In real implementation, update multiple records based on type and action
      const result = {
        success: true,
        updatedCount: ids.length,
        type,
        action,
        value,
        timestamp: new Date().toISOString()
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      res.status(500).json({ error: "Failed to perform bulk operation" });
    }
  });

  // Commission Rules API
  app.get("/api/commission-rules", async (req, res) => {
    try {
      const rules = [
        {
          id: 1,
          vehicleType: "motor",
          baseCommission: 15,
          bonusThreshold: 50,
          bonusCommission: 5,
          priorityBonus: 3
        },
        {
          id: 2,
          vehicleType: "mobil",
          baseCommission: 12,
          bonusThreshold: 30,
          bonusCommission: 4,
          priorityBonus: 2
        },
        {
          id: 3,
          vehicleType: "pickup",
          baseCommission: 10,
          bonusThreshold: 20,
          bonusCommission: 3,
          priorityBonus: 2
        }
      ];
      
      res.json(rules);
    } catch (error) {
      console.error("Error fetching commission rules:", error);
      res.status(500).json({ error: "Failed to fetch commission rules" });
    }
  });

  // Driver Revenues API
  app.get("/api/driver-revenues", async (req, res) => {
    try {
      const { period, driverId } = req.query;
      
      const revenues = [
        {
          driverId: 1,
          driverName: "Budi Santoso",
          vehicleType: "motor",
          priority: "priority",
          completedOrders: 45,
          totalRevenue: 2250000,
          baseCommission: 337500,
          bonusCommission: 112500,
          priorityBonus: 67500,
          totalCommission: 517500,
          netEarnings: 517500
        },
        {
          driverId: 2,
          driverName: "Siti Rahayu",
          vehicleType: "mobil",
          priority: "normal",
          completedOrders: 32,
          totalRevenue: 1920000,
          baseCommission: 230400,
          bonusCommission: 76800,
          priorityBonus: 0,
          totalCommission: 307200,
          netEarnings: 307200
        }
      ];
      
      res.json(revenues);
    } catch (error) {
      console.error("Error fetching driver revenues:", error);
      res.status(500).json({ error: "Failed to fetch driver revenues" });
    }
  });

  // Calculate Commissions API
  app.post("/api/calculate-commissions", async (req, res) => {
    try {
      const { period, driverIds } = req.body;
      
      // In real implementation, recalculate commissions based on current rules
      const result = {
        success: true,
        period,
        driversUpdated: driverIds?.length || "all",
        timestamp: new Date().toISOString(),
        message: "Commissions calculated successfully"
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error calculating commissions:", error);
      res.status(500).json({ error: "Failed to calculate commissions" });
    }
  });

  // Route Optimization API
  app.get("/api/route-optimization", async (req, res) => {
    try {
      const { driverId, mode } = req.query;
      
      const routeOptimizations = [
        {
          id: 1,
          driverId: 1,
          driverName: "Budi Santoso",
          vehicleType: "motor",
          currentLocation: {
            lat: -6.2088,
            lng: 106.8456,
            address: "Jl. Sudirman, Jakarta Pusat"
          },
          assignedOrders: [
            {
              id: 1001,
              pickupAddress: "Mall Grand Indonesia",
              deliveryAddress: "Kemang Village",
              priority: "urgent",
              estimatedTime: 45
            },
            {
              id: 1002,
              pickupAddress: "Plaza Indonesia",
              deliveryAddress: "Senayan City",
              priority: "normal",
              estimatedTime: 35
            }
          ],
          optimizedRoute: {
            totalDistance: 28.5,
            totalTime: 85,
            fuelConsumption: 1.8,
            fuelCost: 18000,
            co2Emission: 4.2,
            stops: [
              {
                orderId: 1001,
                type: "pickup",
                address: "Mall Grand Indonesia",
                arrivalTime: "14:30",
                sequence: 1
              },
              {
                orderId: 1002,
                type: "pickup", 
                address: "Plaza Indonesia",
                arrivalTime: "14:45",
                sequence: 2
              },
              {
                orderId: 1001,
                type: "delivery",
                address: "Kemang Village",
                arrivalTime: "15:20",
                sequence: 3
              },
              {
                orderId: 1002,
                type: "delivery",
                address: "Senayan City",
                arrivalTime: "15:50",
                sequence: 4
              }
            ]
          },
          savings: {
            distanceSaved: 8.2,
            timeSaved: 25,
            fuelSaved: 0.6,
            costSaved: 6000
          }
        }
      ];
      
      res.json(routeOptimizations);
    } catch (error) {
      console.error("Error fetching route optimization:", error);
      res.status(500).json({ error: "Failed to fetch route optimization" });
    }
  });

  app.post("/api/optimize-routes", async (req, res) => {
    try {
      const { driverIds, mode } = req.body;
      
      // Simulate route optimization process
      const result = {
        success: true,
        optimizedRoutes: driverIds?.length || 3,
        mode,
        totalSavings: {
          distance: 15.8,
          time: 45,
          fuel: 1.2,
          cost: 12000
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error optimizing routes:", error);
      res.status(500).json({ error: "Failed to optimize routes" });
    }
  });

  // Driver Community Chat API
  app.get("/api/driver-chat", async (req, res) => {
    try {
      const { channel, filter } = req.query;
      
      const messages = [
        {
          id: 1,
          senderId: 1,
          senderName: "Budi Santoso",
          senderVehicle: "motor",
          message: "Hati-hati di Jl. Sudirman depan Plaza Indonesia, macet parah nih! Estimasi delay 15 menit",
          type: "traffic",
          trafficInfo: {
            severity: "sedang",
            estimatedDelay: 15,
            road: "Jl. Sudirman (depan Plaza Indonesia)"
          },
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          likes: 8,
          isLiked: false,
          channel: "traffic"
        },
        {
          id: 2,
          senderId: 2,
          senderName: "Siti Rahayu",
          senderVehicle: "mobil",
          message: "Tips: kalau delivery ke area Kemang, lebih cepat lewat Jl. Panglima Polim daripada Jl. Kemang Raya",
          type: "tip",
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          likes: 12,
          isLiked: true,
          channel: "tips"
        },
        {
          id: 3,
          senderId: 3,
          senderName: "Ahmad Wijaya",
          senderVehicle: "pickup",
          message: "Ada yang tau bengkel motor 24 jam di area Jaksel? Motor gw mogok nih di Blok M",
          type: "text",
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          likes: 3,
          isLiked: false,
          channel: "general"
        },
        {
          id: 4,
          senderId: 4,
          senderName: "Rina Sari",
          senderVehicle: "motor",
          message: "Update: Jl. Casablanca arah Kuningan udah lancar lagi guys! 👍",
          type: "traffic",
          trafficInfo: {
            severity: "ringan",
            estimatedDelay: 0,
            road: "Jl. Casablanca (arah Kuningan)"
          },
          timestamp: new Date().toISOString(),
          likes: 15,
          isLiked: false,
          channel: "traffic"
        }
      ];
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.get("/api/drivers/online", async (req, res) => {
    try {
      const onlineDrivers = [
        {
          id: 1,
          name: "Budi Santoso",
          vehicleType: "motor",
          location: "Sudirman, Jakarta Pusat",
          status: "online",
          lastSeen: "Baru saja"
        },
        {
          id: 2,
          name: "Siti Rahayu", 
          vehicleType: "mobil",
          location: "Kemang, Jakarta Selatan",
          status: "busy",
          lastSeen: "2 menit yang lalu"
        },
        {
          id: 3,
          name: "Ahmad Wijaya",
          vehicleType: "pickup",
          location: "Blok M, Jakarta Selatan",
          status: "break",
          lastSeen: "5 menit yang lalu"
        },
        {
          id: 4,
          name: "Rina Sari",
          vehicleType: "motor",
          location: "Kuningan, Jakarta Selatan",
          status: "online",
          lastSeen: "1 menit yang lalu"
        }
      ];
      
      res.json(onlineDrivers);
    } catch (error) {
      console.error("Error fetching online drivers:", error);
      res.status(500).json({ error: "Failed to fetch online drivers" });
    }
  });

  app.post("/api/driver-chat/send", async (req, res) => {
    try {
      const { message, type, channel } = req.body;
      
      const newMessage = {
        id: Date.now(),
        senderId: 1, // Current user
        senderName: "Anda",
        senderVehicle: "motor",
        message,
        type,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        channel
      };
      
      res.json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/driver-chat/like", async (req, res) => {
    try {
      const { messageId } = req.body;
      
      res.json({ success: true, messageId });
    } catch (error) {
      console.error("Error liking message:", error);
      res.status(500).json({ error: "Failed to like message" });
    }
  });

  // Real-time Route Optimization API
  app.get("/api/realtime-routes", async (req, res) => {
    try {
      const { driverId, showTraffic } = req.query;
      
      const realtimeRoutes = [
        {
          id: 1,
          driverId: 1,
          driverName: "Budi Santoso",
          vehicleType: "motor",
          vehiclePlate: "B 1234 ABC",
          currentLocation: {
            lat: -6.2088,
            lng: 106.8456
          },
          routePoints: [
            {
              id: 1,
              type: "pickup",
              orderId: 1001,
              lat: -6.2146,
              lng: 106.8451,
              address: "Mall Grand Indonesia",
              estimatedTime: "14:30",
              status: "current",
              priority: "urgent"
            },
            {
              id: 2,
              type: "pickup",
              orderId: 1002,
              lat: -6.2176,
              lng: 106.8467,
              address: "Plaza Indonesia",
              estimatedTime: "14:45",
              status: "pending",
              priority: "normal"
            },
            {
              id: 3,
              type: "delivery",
              orderId: 1001,
              lat: -6.2615,
              lng: 106.8106,
              address: "Kemang Village",
              estimatedTime: "15:20",
              status: "pending",
              priority: "urgent"
            }
          ],
          optimization: {
            totalDistance: 28.5,
            totalTime: 85,
            fuelConsumption: 1.8,
            estimatedCost: 25000,
            co2Emission: 4.2,
            efficiency: 92
          },
          trafficConditions: {
            severity: "moderate",
            affectedSegments: 2,
            delayMinutes: 12
          },
          alternatives: [
            {
              id: 1,
              name: "Via Jl. Panglima Polim",
              distanceDiff: -2.1,
              timeDiff: -8,
              fuelDiff: -0.3,
              score: 85
            },
            {
              id: 2,
              name: "Via Jl. Senopati",
              distanceDiff: 1.5,
              timeDiff: -5,
              fuelDiff: 0.2,
              score: 78
            }
          ],
          isActive: true,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 2,
          driverId: 2,
          driverName: "Siti Rahayu",
          vehicleType: "mobil",
          vehiclePlate: "B 5678 DEF",
          currentLocation: {
            lat: -6.2615,
            lng: 106.8106
          },
          routePoints: [
            {
              id: 4,
              type: "pickup",
              orderId: 1003,
              lat: -6.2297,
              lng: 106.8230,
              address: "Senayan City",
              estimatedTime: "15:00",
              status: "current",
              priority: "normal"
            },
            {
              id: 5,
              type: "delivery",
              orderId: 1003,
              lat: -6.1944,
              lng: 106.8229,
              address: "Central Park Mall",
              estimatedTime: "15:45",
              status: "pending",
              priority: "normal"
            }
          ],
          optimization: {
            totalDistance: 15.2,
            totalTime: 45,
            fuelConsumption: 1.2,
            estimatedCost: 18000,
            co2Emission: 2.8,
            efficiency: 88
          },
          trafficConditions: {
            severity: "light",
            affectedSegments: 0,
            delayMinutes: 0
          },
          alternatives: [
            {
              id: 3,
              name: "Via Tol Dalam Kota",
              distanceDiff: 3.2,
              timeDiff: -12,
              fuelDiff: 0.5,
              score: 92
            }
          ],
          isActive: true,
          lastUpdated: new Date().toISOString()
        }
      ];
      
      res.json(realtimeRoutes);
    } catch (error) {
      console.error("Error fetching realtime routes:", error);
      res.status(500).json({ error: "Failed to fetch realtime routes" });
    }
  });

  app.post("/api/optimize-realtime-route", async (req, res) => {
    try {
      const { driverId, options } = req.body;
      
      // Simulate real-time optimization
      const result = {
        success: true,
        driverId,
        optimizedAt: new Date().toISOString(),
        improvements: {
          timeSaved: 15,
          fuelSaved: 0.8,
          distanceReduced: 3.2,
          efficiencyGain: 7
        },
        newRoute: {
          totalDistance: 25.3,
          totalTime: 70,
          fuelConsumption: 1.0,
          estimatedCost: 20000
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error optimizing realtime route:", error);
      res.status(500).json({ error: "Failed to optimize realtime route" });
    }
  });

  app.post("/api/apply-alternative-route", async (req, res) => {
    try {
      const { driverId, alternativeId } = req.body;
      
      const result = {
        success: true,
        driverId,
        alternativeId,
        appliedAt: new Date().toISOString(),
        notificationSent: true,
        estimatedImpact: {
          timeSaved: 8,
          fuelSaved: 0.3,
          distanceChange: -2.1
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error applying alternative route:", error);
      res.status(500).json({ error: "Failed to apply alternative route" });
    }
  });

  // Recommendation System API
  app.get("/api/recommendations/drivers", async (req, res) => {
    try {
      const { orderId, filterCriteria } = req.query;
      
      const driverRecommendations = [
        {
          driverId: 1,
          driverName: "Budi Santoso",
          vehicleType: "motor",
          vehiclePlate: "B 1234 ABC",
          priority: "priority",
          performanceScore: 95,
          completionRate: 98,
          averageRating: 4.8,
          responseTime: 5,
          distanceFromPickup: 2.3,
          currentWorkload: 1,
          estimatedDeliveryTime: 25,
          confidenceLevel: "Tinggi",
          reasons: [
            "Driver dengan rating tertinggi di area ini",
            "Waktu respons tercepat (5 menit)",
            "Tingkat penyelesaian order 98%",
            "Lokasi terdekat dari pickup point"
          ],
          strengths: [
            "Konsisten memberikan pelayanan terbaik",
            "Sangat familiar dengan area delivery",
            "Komunikasi yang baik dengan customer"
          ],
          potentialConcerns: [
            "Sedang menangani 1 order aktif"
          ],
          recommendationScore: 95,
          availability: "available",
          lastActive: "2 menit yang lalu"
        },
        {
          driverId: 2,
          driverName: "Siti Rahayu",
          vehicleType: "mobil",
          vehiclePlate: "B 5678 DEF",
          priority: "normal",
          performanceScore: 88,
          completionRate: 92,
          averageRating: 4.5,
          responseTime: 8,
          distanceFromPickup: 3.1,
          currentWorkload: 0,
          estimatedDeliveryTime: 35,
          confidenceLevel: "Tinggi",
          reasons: [
            "Driver mobil terbaik untuk order besar",
            "Tidak ada order aktif saat ini",
            "Pengalaman 3+ tahun di area ini"
          ],
          strengths: [
            "Berpengalaman dengan pengiriman fragile items",
            "Kendaraan mobil cocok untuk order besar",
            "Punctual dan reliable"
          ],
          potentialConcerns: [
            "Jarak sedikit lebih jauh dari pickup"
          ],
          recommendationScore: 88,
          availability: "available",
          lastActive: "5 menit yang lalu"
        },
        {
          driverId: 3,
          driverName: "Ahmad Wijaya",
          vehicleType: "pickup",
          vehiclePlate: "B 9012 GHI",
          priority: "normal",
          performanceScore: 82,
          completionRate: 89,
          averageRating: 4.3,
          responseTime: 12,
          distanceFromPickup: 4.8,
          currentWorkload: 2,
          estimatedDeliveryTime: 55,
          confidenceLevel: "Sedang",
          reasons: [
            "Spesialis untuk pengiriman barang besar",
            "Kendaraan pickup ideal untuk order volume tinggi"
          ],
          strengths: [
            "Ahli dalam handling barang besar",
            "Kendaraan pickup dengan kapasitas besar"
          ],
          potentialConcerns: [
            "Sedang menangani 2 order aktif",
            "Waktu respons agak lambat"
          ],
          recommendationScore: 75,
          availability: "busy",
          lastActive: "1 menit yang lalu"
        }
      ];
      
      res.json(driverRecommendations);
    } catch (error) {
      console.error("Error fetching driver recommendations:", error);
      res.status(500).json({ error: "Failed to fetch driver recommendations" });
    }
  });

  app.get("/api/recommendations/routes", async (req, res) => {
    try {
      const { orderId } = req.query;
      
      const routeRecommendations = [
        {
          routeId: 1,
          routeName: "Via Tol Dalam Kota",
          distance: 15.2,
          estimatedTime: 28,
          fuelConsumption: 1.2,
          trafficLevel: "ringan",
          tollCost: 15000,
          roadCondition: "baik",
          recommendationScore: 92,
          advantages: [
            "Rute tercepat dengan traffic minimal",
            "Jalan tol dalam kondisi excellent",
            "Minim kemacetan pada jam ini",
            "Akses langsung ke area tujuan"
          ],
          disadvantages: [
            "Biaya tol lebih mahal",
            "Tidak ada alternatif jika ada gangguan"
          ],
          bestTimeToUse: [
            "Peak hours (07:00-09:00)",
            "Sore hari (17:00-19:00)",
            "Pengiriman urgent"
          ],
          weatherSuitability: 95
        },
        {
          routeId: 2,
          routeName: "Via Jl. Panglima Polim",
          distance: 12.8,
          estimatedTime: 35,
          fuelConsumption: 0.9,
          trafficLevel: "sedang",
          tollCost: 0,
          roadCondition: "baik",
          recommendationScore: 85,
          advantages: [
            "Jarak terpendek ke tujuan",
            "Tidak ada biaya tol",
            "Hemat BBM",
            "Banyak alternatif jalan"
          ],
          disadvantages: [
            "Traffic sedikit padat di persimpangan",
            "Lampu merah cukup banyak"
          ],
          bestTimeToUse: [
            "Off-peak hours",
            "Pengiriman non-urgent",
            "Cuaca hujan (jalan tertutup)"
          ],
          weatherSuitability: 80
        },
        {
          routeId: 3,
          routeName: "Via Jl. Senopati - Kemang",
          distance: 18.5,
          estimatedTime: 42,
          fuelConsumption: 1.5,
          trafficLevel: "padat",
          tollCost: 5000,
          roadCondition: "sedang",
          recommendationScore: 68,
          advantages: [
            "Pemandangan menarik untuk customer VIP",
            "Area komersial dengan banyak landmark",
            "Jalan lebar dan nyaman"
          ],
          disadvantages: [
            "Jarak paling jauh",
            "Traffic padat di jam tertentu",
            "Konsumsi BBM tinggi"
          ],
          bestTimeToUse: [
            "Delivery untuk customer VIP",
            "Weekend (traffic lebih lancar)",
            "Late night delivery"
          ],
          weatherSuitability: 70
        }
      ];
      
      res.json(routeRecommendations);
    } catch (error) {
      console.error("Error fetching route recommendations:", error);
      res.status(500).json({ error: "Failed to fetch route recommendations" });
    }
  });

  app.get("/api/recommendations/customers", async (req, res) => {
    try {
      const { filterCriteria } = req.query;
      
      const customerRecommendations = [
        {
          customerId: 1,
          customerName: "PT. Teknologi Maju",
          segment: "VIP",
          orderFrequency: 25,
          averageOrderValue: 850000,
          preferredDeliveryTime: "09:00-11:00",
          locationArea: "SCBD, Jakarta Selatan",
          loyaltyScore: 95,
          recommendedActions: [
            "Tawarkan paket delivery premium dengan dedicated driver",
            "Berikan discount untuk contract bulanan",
            "Prioritaskan driver terbaik untuk setiap delivery"
          ],
          upsellOpportunities: [
            "Same-day delivery service premium",
            "Bulk delivery discount program",
            "24/7 customer support upgrade"
          ],
          retentionRisk: "rendah",
          nextOrderPrediction: "Besok (90% probability)"
        },
        {
          customerId: 2,
          customerName: "Sarah Aminah",
          segment: "Regular",
          orderFrequency: 8,
          averageOrderValue: 125000,
          preferredDeliveryTime: "14:00-17:00",
          locationArea: "Kemang, Jakarta Selatan",
          loyaltyScore: 72,
          recommendedActions: [
            "Kirim promo untuk meningkatkan frequency",
            "Tawarkan membership program",
            "Follow up setelah delivery untuk feedback"
          ],
          upsellOpportunities: [
            "Express delivery upgrade",
            "Insurance protection add-on",
            "Scheduled delivery subscription"
          ],
          retentionRisk: "sedang",
          nextOrderPrediction: "Minggu depan (65% probability)"
        },
        {
          customerId: 3,
          customerName: "Budi Hartono",
          segment: "New",
          orderFrequency: 2,
          averageOrderValue: 75000,
          preferredDeliveryTime: "10:00-12:00",
          locationArea: "Menteng, Jakarta Pusat",
          loyaltyScore: 45,
          recommendedActions: [
            "Berikan welcome bonus untuk order berikutnya",
            "Assign driver terbaik untuk first impression",
            "Follow up dengan survey kepuasan"
          ],
          upsellOpportunities: [
            "First-time customer discount",
            "Referral program introduction",
            "App download incentive"
          ],
          retentionRisk: "tinggi",
          nextOrderPrediction: "2 minggu lagi (40% probability)"
        }
      ];
      
      res.json(customerRecommendations);
    } catch (error) {
      console.error("Error fetching customer recommendations:", error);
      res.status(500).json({ error: "Failed to fetch customer recommendations" });
    }
  });

  app.post("/api/recommendations/apply", async (req, res) => {
    try {
      const { type, recommendationId, orderId } = req.body;
      
      const result = {
        success: true,
        type,
        recommendationId,
        orderId,
        appliedAt: new Date().toISOString(),
        message: `${type} recommendation applied successfully`,
        impact: {
          expectedImprovement: "15-25% efficiency gain",
          estimatedSavings: "Rp 25,000 per delivery",
          customerSatisfaction: "+12% improvement"
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error applying recommendation:", error);
      res.status(500).json({ error: "Failed to apply recommendation" });
    }
  });

  // Weather-Based Route Optimization API
  app.get("/api/weather/current", async (req, res) => {
    try {
      const { location = 'Jakarta' } = req.query;
      
      // Simulate real weather data - in production, this would call a weather API
      const weatherData = {
        location: location as string,
        temperature: 28 + Math.round(Math.random() * 8), // 28-36°C
        humidity: 65 + Math.round(Math.random() * 25), // 65-90%
        windSpeed: 5 + Math.round(Math.random() * 15), // 5-20 km/h
        visibility: 10 + Math.round(Math.random() * 15), // 10-25 km
        condition: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'][Math.floor(Math.random() * 5)],
        precipitation: Math.round(Math.random() * 100), // 0-100%
        pressure: 1010 + Math.round(Math.random() * 20), // 1010-1030 hPa
        uvIndex: 5 + Math.round(Math.random() * 6), // 5-11
        forecast: [
          {
            time: "12:00",
            temperature: 29,
            condition: "sunny",
            precipitation: 10,
            windSpeed: 8
          },
          {
            time: "13:00", 
            temperature: 31,
            condition: "cloudy",
            precipitation: 20,
            windSpeed: 12
          },
          {
            time: "14:00",
            temperature: 32,
            condition: "cloudy",
            precipitation: 35,
            windSpeed: 15
          },
          {
            time: "15:00",
            temperature: 30,
            condition: "rainy",
            precipitation: 60,
            windSpeed: 18
          }
        ]
      };
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  app.get("/api/weather/routes", async (req, res) => {
    try {
      const { location, vehicleType } = req.query;
      
      const weatherRoutes = [
        {
          routeId: 1,
          routeName: "Rute Tol Dalam Kota (Weather Safe)",
          distance: 15.2,
          estimatedTime: 32, // +4 minutes due to weather
          normalTime: 28,
          weatherAdjustment: 4,
          weatherConditions: ["light_rain", "reduced_visibility"],
          safetyScore: 92,
          fuelConsumption: 1.3,
          tollCost: 15000,
          weatherImpact: {
            visibility: "good",
            roadCondition: "wet",
            trafficImpact: "minor",
            drivingDifficulty: "moderate"
          },
          recommendations: [
            "Gunakan lampu dan hazard saat hujan",
            "Jaga jarak aman 2x lipat karena jalan basah",
            "Hindari pengereman mendadak",
            "Monitor weather update setiap 15 menit"
          ],
          warnings: [
            "Potensi aquaplaning di area underpass",
            "Visibility berkurang 30% saat hujan deras"
          ],
          alternatives: ["Rute Alternatif via Jl. Sudirman", "Rute Bypass via Ring Road"]
        },
        {
          routeId: 2,
          routeName: "Via Jl. Panglima Polim (All Weather)",
          distance: 12.8,
          estimatedTime: 40, // +5 minutes due to weather
          normalTime: 35,
          weatherAdjustment: 5,
          weatherConditions: ["light_rain", "heavy_traffic"],
          safetyScore: 78,
          fuelConsumption: 1.0,
          tollCost: 0,
          weatherImpact: {
            visibility: "poor",
            roadCondition: "wet",
            trafficImpact: "moderate",
            drivingDifficulty: "difficult"
          },
          recommendations: [
            "Aktifkan fog lights untuk visibility",
            "Gunakan jalur paling kanan untuk safety",
            "Siap-siap delay karena traffic weather-related",
            "Bawa handuk ekstra untuk driver"
          ],
          warnings: [
            "Banyak genangan air di persimpangan",
            "Traffic light mungkin bermasalah saat hujan",
            "Pengendara lain berkendara lebih hati-hati"
          ],
          alternatives: ["Rute Tol Alternatif", "Via Jl. Gatot Subroto"]
        },
        {
          routeId: 3,
          routeName: "Via Jl. Senopati (Hujan Heavy Risk)",
          distance: 18.5,
          estimatedTime: 55, // +13 minutes due to weather
          normalTime: 42,
          weatherAdjustment: 13,
          weatherConditions: ["heavy_rain", "flooding_risk"],
          safetyScore: 65,
          fuelConsumption: 1.6,
          tollCost: 5000,
          weatherImpact: {
            visibility: "poor",
            roadCondition: "slippery",
            trafficImpact: "severe",
            drivingDifficulty: "dangerous"
          },
          recommendations: [
            "TIDAK DISARANKAN saat hujan deras",
            "Gunakan rute alternatif untuk keamanan",
            "Jika terpaksa, pastikan ban dalam kondisi prima",
            "Koordinasi dengan customer untuk reschedule"
          ],
          warnings: [
            "Area Kemang rawan banjir saat hujan",
            "Jalan licin dengan risiko slip tinggi",
            "Kemungkinan terjebak traffic 1+ jam"
          ],
          alternatives: ["Rute Tol Dalam Kota (RECOMMENDED)", "Via Jl. HR Rasuna Said"]
        }
      ];
      
      res.json(weatherRoutes);
    } catch (error) {
      console.error("Error fetching weather routes:", error);
      res.status(500).json({ error: "Failed to fetch weather-adjusted routes" });
    }
  });

  app.get("/api/weather/alerts", async (req, res) => {
    try {
      const { location } = req.query;
      
      const weatherAlerts = [
        {
          id: 1,
          type: "rain",
          severity: "medium",
          message: "Hujan sedang hingga lebat diperkirakan dalam 2 jam ke depan",
          affectedAreas: ["Jakarta Selatan", "Jakarta Pusat", "Tangerang"],
          duration: "2-4 jam",
          recommendations: [
            "Gunakan rute tol untuk menghindari genangan",
            "Pastikan kendaraan dalam kondisi prima",
            "Bawa peralatan darurat (payung, handuk)",
            "Informasikan customer tentang kemungkinan delay"
          ]
        },
        {
          id: 2,
          type: "fog",
          severity: "high",
          message: "Kabut tebal di area Kemang - Senopati mengurangi visibility hingga 50%",
          affectedAreas: ["Kemang", "Senopati", "Blok M"],
          duration: "1-2 jam",
          recommendations: [
            "Aktifkan fog lights dan hazard",
            "Kurangi kecepatan hingga 50%",
            "Jaga jarak minimal 100 meter",
            "Hindari overtaking"
          ]
        }
      ];
      
      res.json(weatherAlerts);
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      res.status(500).json({ error: "Failed to fetch weather alerts" });
    }
  });

  app.post("/api/weather/apply-route", async (req, res) => {
    try {
      const { routeId, weatherConditions } = req.body;
      
      const result = {
        success: true,
        routeId,
        weatherConditions,
        appliedAt: new Date().toISOString(),
        message: "Weather-optimized route applied successfully",
        impact: {
          safetyImprovement: "25% safer driving conditions",
          weatherPreparedness: "Full weather adaptation implemented",
          riskReduction: "Weather-related incidents reduced by 40%",
          driverSafety: "Enhanced with real-time weather monitoring"
        },
        monitoringEnabled: true,
        nextWeatherUpdate: "15 minutes"
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error applying weather route:", error);
      res.status(500).json({ error: "Failed to apply weather-optimized route" });
    }
  });

  // === DRIVER APP API ENDPOINTS ===

  // Driver Authentication
  app.post("/api/driver/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      // Find driver by phone
      const drivers = await storage.getDrivers();
      const driver = drivers.find(d => d.phone === phone);
      
      if (!driver) {
        return res.status(401).json({ error: "Driver tidak ditemukan" });
      }
      
      // Simple password check (in production, use proper hashing)
      if (password !== "driver123") {
        return res.status(401).json({ error: "Password salah" });
      }
      
      // Create session (simplified)
      const sessionId = Date.now().toString();
      
      res.json({
        success: true,
        driver: {
          id: driver.id,
          fullName: driver.fullName,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          status: driver.status,
          balance: driver.balance || 0
        },
        sessionId
      });
    } catch (error) {
      console.error("Driver login error:", error);
      res.status(500).json({ error: "Login gagal" });
    }
  });

  // Get available orders for driver
  app.get("/api/driver/orders/available", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const availableOrders = orders.filter(order => 
        order.status === 'pending' && !order.driverId
      );
      
      res.json(availableOrders.map(order => ({
        id: order.id,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount,
        distance: order.distance,
        hasAdvancePayment: order.vehicleType === 'motor' && order.advancePayment > 0,
        advanceAmount: order.advancePayment || 0,
        priority: order.priority || 'normal',
        estimatedTime: Math.round((order.distance || 10) * 3), // 3 minutes per km
        createdAt: order.createdAt
      })));
    } catch (error) {
      console.error("Error fetching available orders:", error);
      res.status(500).json({ error: "Gagal mengambil order tersedia" });
    }
  });

  // Accept order by driver
  app.post("/api/driver/orders/:orderId/accept", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { driverId } = req.body;
      
      const order = await storage.updateOrder(parseInt(orderId), {
        driverId: parseInt(driverId),
        status: 'assigned',
        assignedAt: new Date()
      });
      
      if (!order) {
        return res.status(404).json({ error: "Order tidak ditemukan" });
      }
      
      res.json({
        success: true,
        message: "Order berhasil diterima",
        order: {
          id: order.id,
          status: order.status,
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.totalAmount
        }
      });
    } catch (error) {
      console.error("Error accepting order:", error);
      res.status(500).json({ error: "Gagal menerima order" });
    }
  });

  // Update order status (pickup, in-transit, delivered)
  app.post("/api/driver/orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, notes, photoUrl } = req.body;
      
      const updateData: any = { status };
      
      if (status === 'picked_up') {
        updateData.pickedUpAt = new Date();
        updateData.pickupPhotoUrl = photoUrl;
      } else if (status === 'delivered') {
        updateData.deliveredAt = new Date();
        updateData.deliveryPhotoUrl = photoUrl;
        updateData.driverNotes = notes;
      }
      
      const order = await storage.updateOrder(parseInt(orderId), updateData);
      
      if (!order) {
        return res.status(404).json({ error: "Order tidak ditemukan" });
      }
      
      res.json({
        success: true,
        message: `Order berhasil diupdate ke ${status}`,
        order
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Gagal update status order" });
    }
  });

  // Update driver location
  app.post("/api/driver/location/update", async (req, res) => {
    try {
      const { driverId, latitude, longitude, speed, heading } = req.body;
      
      // Update driver location (simplified - in production use proper location tracking table)
      const driver = await storage.updateDriver(parseInt(driverId), {
        lastActive: new Date(),
        // Note: You'll need to add location fields to driver schema
      });
      
      res.json({
        success: true,
        message: "Lokasi berhasil diupdate",
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Gagal update lokasi" });
    }
  });

  // Get driver balance and earnings
  app.get("/api/driver/:driverId/balance", async (req, res) => {
    try {
      const { driverId } = req.params;
      const driver = await storage.getDriver(parseInt(driverId));
      
      if (!driver) {
        return res.status(404).json({ error: "Driver tidak ditemukan" });
      }
      
      const orders = await storage.getOrders();
      const driverOrders = orders.filter(o => o.driverId === driver.id && o.status === 'delivered');
      
      const totalEarnings = driverOrders.reduce((sum, order) => sum + (order.totalAmount * 0.8), 0); // 80% for driver
      const todayEarnings = driverOrders
        .filter(o => new Date(o.deliveredAt!).toDateString() === new Date().toDateString())
        .reduce((sum, order) => sum + (order.totalAmount * 0.8), 0);
      
      res.json({
        currentBalance: driver.balance || 0,
        totalEarnings,
        todayEarnings,
        totalOrders: driverOrders.length,
        completionRate: driver.completionRate || 0,
        rating: driver.rating || 0
      });
    } catch (error) {
      console.error("Error fetching driver balance:", error);
      res.status(500).json({ error: "Gagal mengambil data balance" });
    }
  });

  // Get driver notifications
  app.get("/api/driver/:driverId/notifications", async (req, res) => {
    try {
      const { driverId } = req.params;
      const notifications = await storage.getNotifications();
      
      const driverNotifications = notifications.filter(n => 
        n.targetType === 'all_drivers' || 
        (n.targetType === 'specific_driver' && n.targetId === parseInt(driverId))
      );
      
      res.json(driverNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        createdAt: n.createdAt,
        isRead: !!n.readAt
      })));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Gagal mengambil notifikasi" });
    }
  });

  // === DRIVER FEATURES ===

  // Get current active order for driver
  app.get("/api/driver/current-order", async (req, res) => {
    try {
      const currentOrder = {
        id: 12345,
        pickupAddress: "Jl. Sudirman No. 1, Jakarta Pusat",
        pickupLat: -6.2088,
        pickupLng: 106.8456,
        deliveryAddress: "Jl. Thamrin No. 15, Jakarta Pusat", 
        deliveryLat: -6.1944,
        deliveryLng: 106.8229,
        customerName: "Budi Santoso",
        customerPhone: "081234567890",
        estimatedDistance: 3.2,
        estimatedTime: 18,
        status: "pickup",
        orderValue: 45000
      };
      
      res.json(currentOrder);
    } catch (error) {
      console.error("Error fetching current order:", error);
      res.status(500).json({ error: "Failed to fetch current order" });
    }
  });

  // Upload photo evidence
  app.post("/api/driver/upload-photos", async (req, res) => {
    try {
      // In real implementation, handle multipart/form-data upload
      // Save photos to storage (AWS S3, Google Cloud, etc.)
      // Save metadata to database
      
      const uploadResult = {
        success: true,
        uploadedPhotos: 3,
        orderId: req.body.orderId || 12345,
        timestamp: new Date().toISOString(),
        message: "Photos uploaded successfully"
      };
      
      res.json(uploadResult);
    } catch (error) {
      console.error("Error uploading photos:", error);
      res.status(500).json({ error: "Failed to upload photos" });
    }
  });

  // === AUTO-ASSIGNMENT SYSTEM ===

  // Get auto-assignment rules
  app.get("/api/auto-assignment/rules", async (req, res) => {
    try {
      const rules = [
        {
          id: 1,
          name: "Priority Motor Jakarta Pusat",
          isActive: true,
          priority: 1,
          conditions: {
            vehicleType: ["motor"],
            driverStatus: ["online"],
            maxDistance: 5,
            minRating: 4.0,
            priorityDriversFirst: true
          },
          weights: {
            distance: 40,
            rating: 20,
            completionRate: 15,
            responseTime: 15,
            workload: 10
          }
        }
      ];
      
      res.json(rules);
    } catch (error) {
      console.error("Error fetching auto-assignment rules:", error);
      res.status(500).json({ error: "Failed to fetch auto-assignment rules" });
    }
  });

  // Create auto-assignment rule
  app.post("/api/auto-assignment/rules", async (req, res) => {
    try {
      const ruleData = req.body;
      
      const newRule = {
        id: Date.now(),
        ...ruleData,
        isActive: true,
        priority: 1
      };
      
      res.json({ success: true, rule: newRule });
    } catch (error) {
      console.error("Error creating auto-assignment rule:", error);
      res.status(500).json({ error: "Failed to create auto-assignment rule" });
    }
  });

  // Get assignment logs
  app.get("/api/auto-assignment/logs", async (req, res) => {
    try {
      const logs = [
        {
          id: 1,
          orderId: 12345,
          driverId: 1,
          driverName: "Budi Santoso",
          assignedAt: new Date(Date.now() - 600000).toISOString(),
          algorithm: "Smart Distance + Rating",
          score: 87.5,
          distance: 2.3,
          responseTime: 45,
          status: "accepted"
        },
        {
          id: 2,
          orderId: 12346,
          driverId: 2,
          driverName: "Siti Rahayu",
          assignedAt: new Date(Date.now() - 1200000).toISOString(),
          algorithm: "Smart Distance + Rating",
          score: 92.1,
          distance: 1.8,
          responseTime: 32,
          status: "accepted"
        }
      ];
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching assignment logs:", error);
      res.status(500).json({ error: "Failed to fetch assignment logs" });
    }
  });

  // Toggle auto-assignment
  app.post("/api/auto-assignment/toggle", async (req, res) => {
    try {
      const { enabled } = req.body;
      
      // In real implementation, update system settings
      res.json({ success: true, enabled });
    } catch (error) {
      console.error("Error toggling auto-assignment:", error);
      res.status(500).json({ error: "Failed to toggle auto-assignment" });
    }
  });

  // Get assignment statistics
  app.get("/api/auto-assignment/stats", async (req, res) => {
    try {
      const stats = {
        totalAssignments: 1247,
        successRate: 92.5,
        avgResponseTime: 1.8,
        autoAssignments: 1152,
        manualAssignments: 95,
        efficiency: 95.2
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching assignment stats:", error);
      res.status(500).json({ error: "Failed to fetch assignment stats" });
    }
  });

  // === PETA REAL-TIME DRIVER TRACKING ===

  // Live GPS Tracking API
  app.get("/api/drivers/live-locations", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      const orders = await storage.getOrders();
      
      const liveLocations = drivers.map(driver => {
        // Find current order for this driver
        const currentOrder = orders.find(order => 
          order.driverId === driver.id && 
          (order.status === 'assigned' || order.status === 'in_progress')
        );

        // Generate realistic Jakarta coordinates
        const jakartaAreas = [
          { lat: -6.2088, lng: 106.8456, area: "Jakarta Pusat" },
          { lat: -6.1944, lng: 106.8229, area: "Jakarta Barat" },
          { lat: -6.2297, lng: 106.8467, area: "Jakarta Selatan" },
          { lat: -6.1754, lng: 106.8272, area: "Jakarta Utara" },
          { lat: -6.2146, lng: 106.8451, area: "Jakarta Timur" }
        ];
        
        const randomArea = jakartaAreas[Math.floor(Math.random() * jakartaAreas.length)];
        
        return {
          id: driver.id,
          driverId: driver.id,
          fullName: driver.fullName,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          priority: driver.priority,
          currentLat: randomArea.lat + (Math.random() - 0.5) * 0.02,
          currentLng: randomArea.lng + (Math.random() - 0.5) * 0.02,
          lastUpdate: new Date(Date.now() - Math.random() * 300000).toISOString(),
          status: driver.status,
          currentSpeed: driver.status === 'busy' ? Math.floor(Math.random() * 50) + 15 : 
                       driver.status === 'online' ? Math.floor(Math.random() * 20) : 0,
          batteryLevel: Math.floor(Math.random() * 40) + 60,
          currentOrder: currentOrder ? {
            id: currentOrder.id,
            pickupAddress: currentOrder.pickupAddress,
            deliveryAddress: currentOrder.deliveryAddress,
            customerName: `Customer-${currentOrder.customerId}`,
            eta: `${Math.floor(Math.random() * 30) + 10} menit`,
            progress: Math.floor(Math.random() * 80) + 20
          } : undefined
        };
      });

      res.json(liveLocations);
    } catch (error) {
      console.error("Error fetching live driver locations:", error);
      res.status(500).json({ error: "Failed to fetch live driver locations" });
    }
  });

  // Driver Locations API
  app.get("/api/driver-locations", async (req, res) => {
    try {
      // Data lokasi driver real-time berdasarkan area Jakarta
      const driverLocations = [
        {
          id: 1,
          driverId: 1,
          fullName: "Budi Santoso",
          phone: "081234567890",
          vehicleType: "motor",
          vehicleNumber: "B 1234 ABC",
          currentLocation: {
            lat: -6.2088,
            lng: 106.8456,
            address: "Jl. Sudirman, Jakarta Pusat"
          },
          status: 'busy',
          isOnDuty: true,
          currentOrderId: 12345,
          speed: 25,
          heading: 45,
          batteryLevel: 85,
          signalStrength: 95,
          lastUpdated: new Date(Date.now() - 30000).toISOString(),
          distanceFromBase: 3.2,
          totalDistanceToday: 87.5,
          ordersCompleted: 12,
          rating: 4.8,
          estimatedArrival: "5 menit",
          destination: {
            lat: -6.2144,
            lng: 106.8294,
            address: "Plaza Indonesia, Jakarta"
          }
        },
        {
          id: 2,
          driverId: 2,
          fullName: "Siti Rahayu",
          phone: "082345678901",
          vehicleType: "mobil",
          vehicleNumber: "B 5678 DEF",
          currentLocation: {
            lat: -6.2444,
            lng: 106.7991,
            address: "Blok M, Jakarta Selatan"
          },
          status: 'online',
          isOnDuty: true,
          speed: 0,
          heading: 0,
          batteryLevel: 42,
          signalStrength: 78,
          lastUpdated: new Date(Date.now() - 60000).toISOString(),
          distanceFromBase: 5.8,
          totalDistanceToday: 125.3,
          ordersCompleted: 18,
          rating: 4.6
        },
        {
          id: 3,
          driverId: 3,
          fullName: "Ahmad Rizki",
          phone: "083456789012",
          vehicleType: "motor",
          vehicleNumber: "B 9012 GHI",
          currentLocation: {
            lat: -6.1675,
            lng: 106.7853,
            address: "Grogol, Jakarta Barat"
          },
          status: 'break',
          isOnDuty: true,
          speed: 0,
          heading: 180,
          batteryLevel: 68,
          signalStrength: 65,
          lastUpdated: new Date(Date.now() - 120000).toISOString(),
          distanceFromBase: 8.1,
          totalDistanceToday: 156.7,
          ordersCompleted: 15,
          rating: 4.4
        },
        {
          id: 4,
          driverId: 4,
          fullName: "Dedi Kurniawan",
          phone: "084567890123",
          vehicleType: "mobil",
          vehicleNumber: "B 3456 JKL",
          currentLocation: {
            lat: -6.2383,
            lng: 106.8742,
            address: "Cawang, Jakarta Timur"
          },
          status: 'online',
          isOnDuty: true,
          speed: 0,
          heading: 270,
          batteryLevel: 91,
          signalStrength: 88,
          lastUpdated: new Date(Date.now() - 45000).toISOString(),
          distanceFromBase: 12.5,
          totalDistanceToday: 203.8,
          ordersCompleted: 22,
          rating: 4.7
        },
        {
          id: 5,
          driverId: 5,
          fullName: "Rina Wati",
          phone: "085678901234",
          vehicleType: "motor",
          vehicleNumber: "B 7890 MNO",
          currentLocation: {
            lat: -6.1562,
            lng: 106.9096,
            address: "Kelapa Gading, Jakarta Utara"
          },
          status: 'busy',
          isOnDuty: true,
          currentOrderId: 12346,
          speed: 35,
          heading: 90,
          batteryLevel: 76,
          signalStrength: 82,
          lastUpdated: new Date(Date.now() - 15000).toISOString(),
          distanceFromBase: 15.3,
          totalDistanceToday: 178.9,
          ordersCompleted: 19,
          rating: 4.5,
          estimatedArrival: "8 menit",
          destination: {
            lat: -6.1444,
            lng: 106.9194,
            address: "Mall Kelapa Gading, Jakarta Utara"
          }
        }
      ];

      res.json(driverLocations);
    } catch (error) {
      console.error("Error fetching driver locations:", error);
      res.status(500).json({ error: "Failed to fetch driver locations" });
    }
  });

  // Traffic Conditions API
  app.get("/api/traffic-conditions", async (req, res) => {
    try {
      const trafficConditions = [
        { area: "Jakarta Pusat", condition: 'heavy', averageSpeed: 15, estimatedDelay: 12 },
        { area: "Jakarta Selatan", condition: 'moderate', averageSpeed: 25, estimatedDelay: 5 },
        { area: "Jakarta Barat", condition: 'smooth', averageSpeed: 40, estimatedDelay: 0 },
        { area: "Jakarta Timur", condition: 'moderate', averageSpeed: 30, estimatedDelay: 3 },
        { area: "Jakarta Utara", condition: 'heavy', averageSpeed: 18, estimatedDelay: 8 }
      ];

      res.json(trafficConditions);
    } catch (error) {
      console.error("Error fetching traffic conditions:", error);
      res.status(500).json({ error: "Failed to fetch traffic conditions" });
    }
  });

  // Driver Tracking History API
  app.get("/api/driver-tracking/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      
      // Sample tracking history untuk driver tertentu
      const trackingHistory = [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          location: { lat: -6.2000, lng: 106.8200, address: "Jl. Thamrin, Jakarta Pusat" },
          speed: 20,
          status: 'busy'
        },
        {
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          location: { lat: -6.2050, lng: 106.8300, address: "Bundaran HI, Jakarta Pusat" },
          speed: 15,
          status: 'busy'
        },
        {
          timestamp: new Date(Date.now() - 900000).toISOString(),
          location: { lat: -6.2088, lng: 106.8456, address: "Jl. Sudirman, Jakarta Pusat" },
          speed: 25,
          status: 'busy'
        }
      ];

      res.json({
        driverId,
        trackingHistory,
        totalPoints: trackingHistory.length
      });
    } catch (error) {
      console.error("Error fetching driver tracking history:", error);
      res.status(500).json({ error: "Failed to fetch driver tracking history" });
    }
  });

  // Driver API routes
  app.use("/api/driver", driverApi);

  const httpServer = createServer(app);
  return httpServer;
}
