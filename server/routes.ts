import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import driverApi from "./driver-api";
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

  // Driver API routes
  app.use("/api/driver", driverApi);

  const httpServer = createServer(app);
  return httpServer;
}
