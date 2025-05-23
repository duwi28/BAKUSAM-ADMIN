import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";

const router = Router();

// Driver Authentication
const loginSchema = z.object({
  phone: z.string(),
  password: z.string().optional(), // For now, simple phone-based auth
});

router.post("/auth/login", async (req, res) => {
  try {
    const { phone } = loginSchema.parse(req.body);
    
    // Find driver by phone
    const drivers = await storage.getDrivers();
    const driver = drivers.find(d => d.phone === phone);
    
    if (!driver) {
      return res.status(404).json({ error: "Driver tidak ditemukan" });
    }
    
    if (driver.status !== 'active') {
      return res.status(403).json({ error: "Akun belum diverifikasi atau sedang disuspend" });
    }
    
    // Generate simple session token (in production, use JWT)
    const token = `driver_${driver.id}_${Date.now()}`;
    
    res.json({
      token,
      driver: {
        id: driver.id,
        fullName: driver.fullName,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        rating: driver.rating,
        status: driver.status
      }
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid request" });
  }
});

// Driver Location Update
const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional(),
});

router.post("/location/update", async (req, res) => {
  try {
    const driverId = req.headers.authorization?.replace('Bearer ', '');
    if (!driverId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const location = locationSchema.parse(req.body);
    
    // In real app, store in location tracking table
    // For now, we'll simulate this
    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: "Invalid location data" });
  }
});

// Get Available Orders (within radius)
router.get("/orders/available", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 3; // Default 3km
    
    const orders = await storage.getOrders();
    const availableOrders = orders.filter(order => 
      order.status === 'pending' && !order.driverId
    );
    
    // Simulate distance calculation (in real app, use Maps API)
    const ordersWithDistance = availableOrders.map(order => ({
      ...order,
      estimatedDistance: Math.round(Math.random() * 5 + 1), // 1-5 km
      estimatedDuration: Math.round(Math.random() * 15 + 5), // 5-20 mins
      customer: { fullName: "Customer Name", phone: "08123456789" } // Join with customer data
    })).filter(order => order.estimatedDistance <= radius);
    
    res.json(ordersWithDistance);
  } catch (error) {
    res.status(400).json({ error: "Invalid request" });
  }
});

// Accept Order
router.post("/orders/:orderId/accept", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const driverId = req.headers.authorization?.replace('Bearer driver_', '')?.split('_')[0];
    
    if (!driverId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const order = await storage.updateOrder(orderId, {
      driverId: parseInt(driverId),
      status: 'assigned'
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: "Failed to accept order" });
  }
});

// Update Order Status
const statusSchema = z.object({
  status: z.enum(['assigned', 'picked_up', 'in_transit', 'delivered', 'completed']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  notes: z.string().optional(),
  proofPhoto: z.string().optional(), // Base64 image
});

router.post("/orders/:orderId/status", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status, location, notes, proofPhoto } = statusSchema.parse(req.body);
    
    const updateData: any = { status };
    
    if (notes) updateData.notes = notes;
    if (status === 'completed') {
      updateData.completedDate = new Date();
    }
    
    const order = await storage.updateOrder(orderId, updateData);
    
    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ error: "Failed to update order status" });
  }
});

// Get Driver's Active Orders
router.get("/orders/active", async (req, res) => {
  try {
    const driverId = req.headers.authorization?.replace('Bearer driver_', '')?.split('_')[0];
    
    if (!driverId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const orders = await storage.getOrders();
    const activeOrders = orders.filter(order => 
      order.driverId === parseInt(driverId) && 
      ['assigned', 'picked_up', 'in_transit'].includes(order.status)
    );
    
    res.json(activeOrders);
  } catch (error) {
    res.status(400).json({ error: "Failed to get active orders" });
  }
});

// Get Driver Earnings Report
router.get("/earnings/report", async (req, res) => {
  try {
    const driverId = req.headers.authorization?.replace('Bearer driver_', '')?.split('_')[0];
    const period = req.query.period as string || 'daily'; // daily, weekly, monthly
    
    if (!driverId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const orders = await storage.getOrders();
    const completedOrders = orders.filter(order => 
      order.driverId === parseInt(driverId) && 
      order.status === 'completed'
    );
    
    // Calculate earnings (simulation)
    const today = new Date();
    const todayEarnings = completedOrders
      .filter(order => {
        const orderDate = new Date(order.orderDate || '');
        return orderDate.toDateString() === today.toDateString();
      })
      .reduce((sum, order) => sum + (parseFloat(order.totalFare) * 0.7), 0); // 70% to driver
    
    const thisMonthEarnings = completedOrders
      .filter(order => {
        const orderDate = new Date(order.orderDate || '');
        return orderDate.getMonth() === today.getMonth() && 
               orderDate.getFullYear() === today.getFullYear();
      })
      .reduce((sum, order) => sum + (parseFloat(order.totalFare) * 0.7), 0);
    
    res.json({
      today: todayEarnings,
      thisMonth: thisMonthEarnings,
      totalOrders: completedOrders.length,
      balance: todayEarnings + thisMonthEarnings, // Simplified balance
      commissionRate: 0.7 // 70% to driver, 30% platform fee
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to get earnings report" });
  }
});

// Driver Status Toggle (Online/Offline)
router.post("/status/toggle", async (req, res) => {
  try {
    const driverId = req.headers.authorization?.replace('Bearer driver_', '')?.split('_')[0];
    const { status } = req.body; // 'active' or 'offline'
    
    if (!driverId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const driver = await storage.updateDriver(parseInt(driverId), { status });
    
    if (!driver) {
      return res.status(404).json({ error: "Driver tidak ditemukan" });
    }
    
    res.json({ success: true, status: driver.status });
  } catch (error) {
    res.status(400).json({ error: "Failed to update status" });
  }
});

// Get Notifications for Driver
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await storage.getNotifications();
    const driverNotifications = notifications.filter(notification => 
      notification.targetType === 'drivers' || notification.targetType === 'all'
    );
    
    res.json(driverNotifications);
  } catch (error) {
    res.status(400).json({ error: "Failed to get notifications" });
  }
});

export default router;