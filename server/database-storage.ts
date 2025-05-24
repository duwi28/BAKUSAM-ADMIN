import { eq, desc, count, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, drivers, customers, vehicles, orders, pricingRules, 
  promotions, notifications, complaints, systemSettings,
  safetyAlerts, driverSafetyStatus, safetyIncidents,
  type User, type InsertUser,
  type Driver, type InsertDriver,
  type Customer, type InsertCustomer,
  type Vehicle, type InsertVehicle,
  type Order, type InsertOrder,
  type PricingRule, type InsertPricingRule,
  type Promotion, type InsertPromotion,
  type Notification, type InsertNotification,
  type Complaint, type InsertComplaint,
  type SystemSetting, type InsertSystemSetting,
  type SafetyAlert, type InsertSafetyAlert,
  type DriverSafetyStatus, type InsertDriverSafetyStatus,
  type SafetyIncident, type InsertSafetyIncident
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).orderBy(desc(drivers.joinDate));
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const result = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
    return result[0];
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const result = await db.insert(drivers).values({
      ...driver,
      joinDate: new Date(),
      totalOrders: 0,
      rating: "0"
    }).returning();
    return result[0];
  }

  async updateDriver(id: number, updates: Partial<Driver>): Promise<Driver | undefined> {
    const result = await db.update(drivers).set(updates).where(eq(drivers.id, id)).returning();
    return result[0];
  }

  async getDriverStats(): Promise<{ total: number; active: number; suspended: number; pending: number }> {
    const [totalResult] = await db.select({ count: count() }).from(drivers);
    const [activeResult] = await db.select({ count: count() }).from(drivers).where(eq(drivers.status, "active"));
    const [suspendedResult] = await db.select({ count: count() }).from(drivers).where(eq(drivers.status, "suspended"));
    const [pendingResult] = await db.select({ count: count() }).from(drivers).where(eq(drivers.status, "pending"));

    return {
      total: totalResult.count,
      active: activeResult.count,
      suspended: suspendedResult.count,
      pending: pendingResult.count
    };
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.joinDate));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values({
      ...customer,
      joinDate: new Date(),
      totalOrders: 0
    }).returning();
    return result[0];
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return result[0];
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return result[0];
  }

  async getVehiclesByDriver(driverId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.driverId, driverId));
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(vehicle).returning();
    return result[0];
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const result = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
    return result[0];
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.orderDate));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values({
      ...order,
      orderDate: new Date(),
      completedDate: null
    }).returning();
    return result[0];
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async getOrderStats(): Promise<{ total: number; pending: number; completed: number; cancelled: number }> {
    const [totalResult] = await db.select({ count: count() }).from(orders);
    const [pendingResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
    const [completedResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "completed"));
    const [cancelledResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "cancelled"));

    return {
      total: totalResult.count,
      pending: pendingResult.count,
      completed: completedResult.count,
      cancelled: cancelledResult.count
    };
  }

  async getRevenueStats(): Promise<{ today: number; thisWeek: number; thisMonth: number }> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const completedOrders = await db.select().from(orders).where(eq(orders.status, "completed"));

    const todayRevenue = completedOrders
      .filter(order => order.orderDate && order.orderDate >= startOfToday)
      .reduce((sum, order) => sum + parseFloat(order.totalFare), 0);

    const weekRevenue = completedOrders
      .filter(order => order.orderDate && order.orderDate >= startOfWeek)
      .reduce((sum, order) => sum + parseFloat(order.totalFare), 0);

    const monthRevenue = completedOrders
      .filter(order => order.orderDate && order.orderDate >= startOfMonth)
      .reduce((sum, order) => sum + parseFloat(order.totalFare), 0);

    return {
      today: todayRevenue,
      thisWeek: weekRevenue,
      thisMonth: monthRevenue
    };
  }

  // Pricing Rules
  async getPricingRules(): Promise<PricingRule[]> {
    return await db.select().from(pricingRules);
  }

  async createPricingRule(rule: InsertPricingRule): Promise<PricingRule> {
    const result = await db.insert(pricingRules).values(rule).returning();
    return result[0];
  }

  async updatePricingRule(id: number, updates: Partial<PricingRule>): Promise<PricingRule | undefined> {
    const result = await db.update(pricingRules).set(updates).where(eq(pricingRules.id, id)).returning();
    return result[0];
  }

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return await db.select().from(promotions).orderBy(desc(promotions.startDate));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const result = await db.insert(promotions).values({
      ...promotion,
      usageCount: 0
    }).returning();
    return result[0];
  }

  async updatePromotion(id: number, updates: Partial<Promotion>): Promise<Promotion | undefined> {
    const result = await db.update(promotions).set(updates).where(eq(promotions.id, id)).returning();
    return result[0];
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdDate));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values({
      ...notification,
      createdDate: new Date()
    }).returning();
    return result[0];
  }

  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    return await db.select().from(complaints).orderBy(desc(complaints.createdDate));
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const result = await db.insert(complaints).values({
      ...complaint,
      createdDate: new Date(),
      resolvedDate: null
    }).returning();
    return result[0];
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const result = await db.update(complaints).set(updates).where(eq(complaints.id, id)).returning();
    return result[0];
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
    
    if (existing.length > 0) {
      const result = await db.update(systemSettings).set({ value }).where(eq(systemSettings.key, key)).returning();
      return result[0];
    } else {
      const result = await db.insert(systemSettings).values({
        key,
        value,
        description: null
      }).returning();
      return result[0];
    }
  }

  // Safety Alerts Methods
  async getSafetyAlerts(): Promise<SafetyAlert[]> {
    const result = await db.select({
      id: safetyAlerts.id,
      driverId: safetyAlerts.driverId,
      alertType: safetyAlerts.alertType,
      severity: safetyAlerts.severity,
      title: safetyAlerts.title,
      message: safetyAlerts.message,
      location: safetyAlerts.location,
      isActive: safetyAlerts.isActive,
      isAcknowledged: safetyAlerts.isAcknowledged,
      acknowledgedAt: safetyAlerts.acknowledgedAt,
      createdAt: safetyAlerts.createdAt,
      expiresAt: safetyAlerts.expiresAt,
      metadata: safetyAlerts.metadata,
      driver: {
        id: drivers.id,
        fullName: drivers.fullName,
        vehicleType: drivers.vehicleType,
        phone: drivers.phone
      }
    })
    .from(safetyAlerts)
    .leftJoin(drivers, eq(safetyAlerts.driverId, drivers.id))
    .orderBy(desc(safetyAlerts.createdAt));
    
    return result;
  }

  async createSafetyAlert(alert: InsertSafetyAlert): Promise<SafetyAlert> {
    const result = await db.insert(safetyAlerts).values({
      ...alert,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async acknowledgeSafetyAlert(alertId: number): Promise<SafetyAlert | undefined> {
    const result = await db
      .update(safetyAlerts)
      .set({ 
        isAcknowledged: true, 
        acknowledgedAt: new Date() 
      })
      .where(eq(safetyAlerts.id, alertId))
      .returning();
    return result[0];
  }

  // Driver Safety Status Methods
  async getDriverSafetyStatuses(): Promise<DriverSafetyStatus[]> {
    const result = await db.select({
      id: driverSafetyStatus.id,
      driverId: driverSafetyStatus.driverId,
      currentLocation: driverSafetyStatus.currentLocation,
      speed: driverSafetyStatus.speed,
      isOnDuty: driverSafetyStatus.isOnDuty,
      lastActiveTime: driverSafetyStatus.lastActiveTime,
      batteryLevel: driverSafetyStatus.batteryLevel,
      signalStrength: driverSafetyStatus.signalStrength,
      safetyScore: driverSafetyStatus.safetyScore,
      emergencyContact: driverSafetyStatus.emergencyContact,
      isInEmergency: driverSafetyStatus.isInEmergency,
      lastEmergencyAlert: driverSafetyStatus.lastEmergencyAlert,
      updatedAt: driverSafetyStatus.updatedAt,
      driver: {
        id: drivers.id,
        fullName: drivers.fullName,
        vehicleType: drivers.vehicleType,
        phone: drivers.phone
      }
    })
    .from(driverSafetyStatus)
    .leftJoin(drivers, eq(driverSafetyStatus.driverId, drivers.id))
    .orderBy(desc(driverSafetyStatus.updatedAt));
    
    return result;
  }

  async updateDriverSafetyStatus(driverId: number, updates: Partial<DriverSafetyStatus>): Promise<DriverSafetyStatus | undefined> {
    const result = await db
      .update(driverSafetyStatus)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(driverSafetyStatus.driverId, driverId))
      .returning();
    return result[0];
  }

  async triggerEmergencyAlert(driverId: number): Promise<void> {
    await db
      .update(driverSafetyStatus)
      .set({ 
        isInEmergency: true, 
        lastEmergencyAlert: new Date(),
        updatedAt: new Date()
      })
      .where(eq(driverSafetyStatus.driverId, driverId));
  }

  // Safety Incidents Methods
  async getSafetyIncidents(): Promise<SafetyIncident[]> {
    const result = await db.select({
      id: safetyIncidents.id,
      driverId: safetyIncidents.driverId,
      incidentType: safetyIncidents.incidentType,
      severity: safetyIncidents.severity,
      description: safetyIncidents.description,
      location: safetyIncidents.location,
      reportedAt: safetyIncidents.reportedAt,
      resolvedAt: safetyIncidents.resolvedAt,
      status: safetyIncidents.status,
      witnessContact: safetyIncidents.witnessContact,
      policeReport: safetyIncidents.policeReport,
      insuranceClaim: safetyIncidents.insuranceClaim,
      actionsTaken: safetyIncidents.actionsTaken,
      followUpRequired: safetyIncidents.followUpRequired,
      driver: {
        id: drivers.id,
        fullName: drivers.fullName,
        vehicleType: drivers.vehicleType
      }
    })
    .from(safetyIncidents)
    .leftJoin(drivers, eq(safetyIncidents.driverId, drivers.id))
    .orderBy(desc(safetyIncidents.reportedAt));
    
    return result;
  }

  async createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident> {
    const result = await db.insert(safetyIncidents).values({
      ...incident,
      reportedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateSafetyIncident(incidentId: number, updates: Partial<SafetyIncident>): Promise<SafetyIncident | undefined> {
    const result = await db
      .update(safetyIncidents)
      .set(updates)
      .where(eq(safetyIncidents.id, incidentId))
      .returning();
    return result[0];
  }

  // Safety Statistics
  async getSafetyStatistics(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    emergencyCount: number;
    averageSafetyScore: number;
    incidentsByType: Record<string, number>;
  }> {
    const alerts = await this.getSafetyAlerts();
    const statuses = await this.getDriverSafetyStatuses();
    const incidents = await this.getSafetyIncidents();

    const activeAlerts = alerts.filter(alert => alert.isActive).length;
    const emergencyCount = statuses.filter(status => status.isInEmergency).length;
    const averageSafetyScore = statuses.length > 0 
      ? statuses.reduce((sum, status) => sum + status.safetyScore, 0) / statuses.length 
      : 100;

    const incidentsByType = incidents.reduce((acc, incident) => {
      acc[incident.incidentType] = (acc[incident.incidentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAlerts: alerts.length,
      activeAlerts,
      emergencyCount,
      averageSafetyScore: Math.round(averageSafetyScore),
      incidentsByType
    };
  }
}