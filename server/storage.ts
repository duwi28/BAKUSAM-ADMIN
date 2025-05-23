import {
  users, drivers, customers, vehicles, orders, pricingRules, promotions, notifications, complaints, systemSettings,
  type User, type InsertUser,
  type Driver, type InsertDriver,
  type Customer, type InsertCustomer,
  type Vehicle, type InsertVehicle,
  type Order, type InsertOrder,
  type PricingRule, type InsertPricingRule,
  type Promotion, type InsertPromotion,
  type Notification, type InsertNotification,
  type Complaint, type InsertComplaint,
  type SystemSetting, type InsertSystemSetting
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: number, updates: Partial<Driver>): Promise<Driver | undefined>;
  getDriverStats(): Promise<{ total: number; active: number; suspended: number; pending: number }>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByDriver(driverId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined>;
  getOrderStats(): Promise<{ total: number; pending: number; completed: number; cancelled: number }>;
  getRevenueStats(): Promise<{ today: number; thisWeek: number; thisMonth: number }>;

  // Pricing
  getPricingRules(): Promise<PricingRule[]>;
  createPricingRule(rule: InsertPricingRule): Promise<PricingRule>;
  updatePricingRule(id: number, updates: Partial<PricingRule>): Promise<PricingRule | undefined>;

  // Promotions
  getPromotions(): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, updates: Partial<Promotion>): Promise<Promotion | undefined>;

  // Notifications
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;

  // Complaints
  getComplaints(): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined>;

  // System Settings
  getSystemSettings(): Promise<SystemSetting[]>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private drivers: Map<number, Driver> = new Map();
  private customers: Map<number, Customer> = new Map();
  private vehicles: Map<number, Vehicle> = new Map();
  private orders: Map<number, Order> = new Map();
  private pricingRules: Map<number, PricingRule> = new Map();
  private promotions: Map<number, Promotion> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private complaints: Map<number, Complaint> = new Map();
  private systemSettings: Map<string, SystemSetting> = new Map();
  
  private currentUserId = 1;
  private currentDriverId = 1;
  private currentCustomerId = 1;
  private currentVehicleId = 1;
  private currentOrderId = 1;
  private currentPricingRuleId = 1;
  private currentPromotionId = 1;
  private currentNotificationId = 1;
  private currentComplaintId = 1;
  private currentSystemSettingId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data
    const sampleDrivers: InsertDriver[] = [
      {
        fullName: "Budi Santoso",
        phone: "081234567890",
        email: "budi@example.com",
        nik: "3201234567890001",
        address: "Jl. Merdeka No. 10, Jakarta",
        simNumber: "SIM123456789",
        vehicleType: "motor",
        status: "active",
        rating: "4.8",
        totalOrders: 245
      },
      {
        fullName: "Ahmad Rizki",
        phone: "081234567891",
        email: "ahmad@example.com",
        nik: "3201234567890002",
        address: "Jl. Sudirman No. 25, Jakarta",
        simNumber: "SIM123456790",
        vehicleType: "motor",
        status: "active",
        rating: "4.7",
        totalOrders: 189
      }
    ];

    const sampleCustomers: InsertCustomer[] = [
      {
        fullName: "Andi Wijaya",
        phone: "082234567890",
        email: "andi@example.com",
        address: "Jl. Gatot Subroto No. 15, Jakarta",
        status: "active",
        totalOrders: 23
      },
      {
        fullName: "Sari Indah",
        phone: "082234567891",
        email: "sari@example.com",
        address: "Jl. Thamrin No. 8, Jakarta",
        status: "active",
        totalOrders: 15
      }
    ];

    const sampleOrders: InsertOrder[] = [
      {
        customerId: 1,
        driverId: 1,
        pickupAddress: "Mall Taman Anggrek",
        deliveryAddress: "Apartemen Sudirman",
        distance: "5.2",
        baseFare: "15000",
        totalFare: "25000",
        status: "completed",
        rating: 5,
        notes: "Pengiriman lancar",
        completedDate: new Date()
      },
      {
        customerId: 2,
        driverId: 2,
        pickupAddress: "Senayan City",
        deliveryAddress: "Kemang Village",
        distance: "7.8",
        baseFare: "18000",
        totalFare: "32000",
        status: "delivery"
      }
    ];

    // Add sample data
    sampleDrivers.forEach(driver => this.createDriver(driver));
    sampleCustomers.forEach(customer => this.createCustomer(customer));
    sampleOrders.forEach(order => this.createOrder(order));

    // Initialize system settings
    this.systemSettings.set("operational_hours_start", {
      id: 1,
      key: "operational_hours_start",
      value: "06:00",
      description: "Jam mulai operasional"
    });
    this.systemSettings.set("operational_hours_end", {
      id: 2,
      key: "operational_hours_end",
      value: "22:00",
      description: "Jam akhir operasional"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = this.currentDriverId++;
    const driver: Driver = { 
      ...insertDriver, 
      id,
      joinDate: new Date(),
      totalOrders: insertDriver.totalOrders || 0,
      rating: insertDriver.rating || "0.00"
    };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriver(id: number, updates: Partial<Driver>): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;
    
    const updatedDriver = { ...driver, ...updates };
    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }

  async getDriverStats(): Promise<{ total: number; active: number; suspended: number; pending: number }> {
    const drivers = Array.from(this.drivers.values());
    return {
      total: drivers.length,
      active: drivers.filter(d => d.status === "active").length,
      suspended: drivers.filter(d => d.status === "suspended").length,
      pending: drivers.filter(d => d.status === "pending").length
    };
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      joinDate: new Date(),
      totalOrders: insertCustomer.totalOrders || 0
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehiclesByDriver(driverId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(v => v.driverId === driverId);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { ...insertVehicle, id };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...updates };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id,
      orderDate: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrderStats(): Promise<{ total: number; pending: number; completed: number; cancelled: number }> {
    const orders = Array.from(this.orders.values());
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending" || o.status === "assigned" || o.status === "pickup" || o.status === "delivery").length,
      completed: orders.filter(o => o.status === "completed").length,
      cancelled: orders.filter(o => o.status === "cancelled").length
    };
  }

  async getRevenueStats(): Promise<{ today: number; thisWeek: number; thisMonth: number }> {
    const orders = Array.from(this.orders.values()).filter(o => o.status === "completed");
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      today: orders
        .filter(o => o.completedDate && o.completedDate >= startOfToday)
        .reduce((sum, o) => sum + parseFloat(o.totalFare), 0),
      thisWeek: orders
        .filter(o => o.completedDate && o.completedDate >= startOfWeek)
        .reduce((sum, o) => sum + parseFloat(o.totalFare), 0),
      thisMonth: orders
        .filter(o => o.completedDate && o.completedDate >= startOfMonth)
        .reduce((sum, o) => sum + parseFloat(o.totalFare), 0)
    };
  }

  // Pricing Rules
  async getPricingRules(): Promise<PricingRule[]> {
    return Array.from(this.pricingRules.values());
  }

  async createPricingRule(insertPricingRule: InsertPricingRule): Promise<PricingRule> {
    const id = this.currentPricingRuleId++;
    const rule: PricingRule = { ...insertPricingRule, id };
    this.pricingRules.set(id, rule);
    return rule;
  }

  async updatePricingRule(id: number, updates: Partial<PricingRule>): Promise<PricingRule | undefined> {
    const rule = this.pricingRules.get(id);
    if (!rule) return undefined;
    
    const updatedRule = { ...rule, ...updates };
    this.pricingRules.set(id, updatedRule);
    return updatedRule;
  }

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return Array.from(this.promotions.values());
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const id = this.currentPromotionId++;
    const promotion: Promotion = { ...insertPromotion, id, usageCount: 0 };
    this.promotions.set(id, promotion);
    return promotion;
  }

  async updatePromotion(id: number, updates: Partial<Promotion>): Promise<Promotion | undefined> {
    const promotion = this.promotions.get(id);
    if (!promotion) return undefined;
    
    const updatedPromotion = { ...promotion, ...updates };
    this.promotions.set(id, updatedPromotion);
    return updatedPromotion;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id,
      createdDate: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  // Complaints
  async getComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const id = this.currentComplaintId++;
    const complaint: Complaint = { 
      ...insertComplaint, 
      id,
      createdDate: new Date()
    };
    this.complaints.set(id, complaint);
    return complaint;
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    
    const updatedComplaint = { ...complaint, ...updates };
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values());
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const existing = this.systemSettings.get(key);
    if (existing) {
      const updated = { ...existing, value };
      this.systemSettings.set(key, updated);
      return updated;
    } else {
      const id = this.currentSystemSettingId++;
      const setting: SystemSetting = { id, key, value, description: null };
      this.systemSettings.set(key, setting);
      return setting;
    }
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
