import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email").notNull().unique(),
  nik: text("nik").notNull().unique(),
  address: text("address").notNull(),
  simNumber: text("sim_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  status: text("status").notNull().default("active"), // active, suspended, pending
  rating: text("rating").default("0"),
  totalOrders: integer("total_orders").default(0),
  joinDate: timestamp("join_date").defaultNow(),
  // Priority System Fields
  priorityLevel: text("priority_level").notNull().default("normal"), // priority, normal
  priorityScore: integer("priority_score").default(0), // 0-100 calculated score
  isAdvertising: boolean("is_advertising").default(false), // Driver yang pasang iklan
  completionRate: integer("completion_rate").default(100), // Percentage 0-100
  responseTime: integer("response_time").default(300), // Average response time in seconds
  consecutiveRejects: integer("consecutive_rejects").default(0), // Berapa kali reject berturut-turut
  lastOrderDate: timestamp("last_order_date"),
  priorityExpiryDate: timestamp("priority_expiry_date"), // Kapan prioritas expired
  commission: integer("commission").default(70), // Custom commission per driver
  balance: integer("balance").default(0), // Saldo driver dalam rupiah
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email").notNull().unique(),
  address: text("address"),
  status: text("status").notNull().default("active"), // active, blocked
  totalOrders: integer("total_orders").default(0),
  joinDate: timestamp("join_date").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  vehicleType: text("vehicle_type").notNull(), // motor, mobil, pickup
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  plateNumber: text("plate_number").notNull().unique(),
  stnkNumber: text("stnk_number").notNull(),
  status: text("status").notNull().default("verified"), // verified, pending, rejected
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  driverId: integer("driver_id"),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  distance: decimal("distance", { precision: 10, scale: 2 }).notNull(),
  baseFare: decimal("base_fare", { precision: 10, scale: 2 }).notNull(),
  totalFare: decimal("total_fare", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, assigned, pickup, delivery, completed, cancelled
  orderDate: timestamp("order_date").defaultNow(),
  completedDate: timestamp("completed_date"),
  rating: integer("rating"),
  notes: text("notes"),
});

export const pricingRules = pgTable("pricing_rules", {
  id: serial("id").primaryKey(),
  vehicleType: text("vehicle_type").notNull(),
  baseFare: decimal("base_fare", { precision: 10, scale: 2 }).notNull(),
  perKmRate: decimal("per_km_rate", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, success, error
  targetType: text("target_type").notNull(), // all, drivers, customers
  isRead: boolean("is_read").default(false),
  createdDate: timestamp("created_date").defaultNow(),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  customerId: integer("customer_id").notNull(),
  driverId: integer("driver_id"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, investigating, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdDate: timestamp("created_date").defaultNow(),
  resolvedDate: timestamp("resolved_date"),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
});

// Priority Assignment System Tables
export const orderAssignments = pgTable("order_assignments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  responseStatus: text("response_status").default("pending"), // pending, accepted, rejected, timeout
  responseTime: integer("response_time"), // in seconds
  priorityScore: integer("priority_score").default(0), // Score used for assignment
  assignmentReason: text("assignment_reason"), // priority, advertising, rating, availability
});

export const driverPriorityLogs = pgTable("driver_priority_logs", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  previousLevel: text("previous_level").notNull(),
  newLevel: text("new_level").notNull(),
  reason: text("reason").notNull(), // rating_upgrade, advertising_purchase, manual_promotion, etc
  changedAt: timestamp("changed_at").defaultNow(),
  changedBy: integer("changed_by"), // admin user id
});

// Driver Stories and Experience Sharing System
export const driverStories = pgTable("driver_stories", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("experience"), // experience, tips, challenge, achievement, funny
  mood: text("mood").default("positive"), // positive, neutral, challenging, educational
  tags: text("tags").array(), // ["tips", "traffic", "customer_service", "rain", etc]
  imageUrl: text("image_url"), // Optional image
  isAnonymous: boolean("is_anonymous").default(false),
  isApproved: boolean("is_approved").default(false), // Admin moderation
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  viewsCount: integer("views_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storyComments = pgTable("story_comments", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull().references(() => driverStories.id),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyLikes = pgTable("story_likes", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => driverStories.id),
  commentId: integer("comment_id").references(() => storyComments.id),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const driverTips = pgTable("driver_tips", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // navigation, customer_service, vehicle_maintenance, safety, earnings
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
  helpfulCount: integer("helpful_count").default(0),
  isVerified: boolean("is_verified").default(false), // Verified by experienced drivers or admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const tipRatings = pgTable("tip_ratings", {
  id: serial("id").primaryKey(),
  tipId: integer("tip_id").notNull().references(() => driverTips.id),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const driverBalanceTransactions = pgTable("driver_balance_transactions", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  amount: integer("amount").notNull(), // Amount in rupiah (positive for credit, negative for debit)
  type: text("type").notNull(), // manual_add, manual_deduct, order_payment, bonus, penalty
  description: text("description").notNull(),
  previousBalance: integer("previous_balance").notNull(),
  newBalance: integer("new_balance").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdBy: integer("created_by"), // admin user id
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDriverSchema = createInsertSchema(drivers).omit({ 
  id: true, 
  joinDate: true, 
  totalOrders: true, 
  rating: true,
  priorityScore: true,
  lastOrderDate: true
});
export const insertOrderAssignmentSchema = createInsertSchema(orderAssignments).omit({ id: true, assignedAt: true });
export const insertDriverPriorityLogSchema = createInsertSchema(driverPriorityLogs).omit({ id: true, changedAt: true });
export const insertDriverBalanceTransactionSchema = createInsertSchema(driverBalanceTransactions).omit({ id: true, transactionDate: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, joinDate: true, totalOrders: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderDate: true, completedDate: true });
export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({ id: true });
export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true, usageCount: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdDate: true });
export const insertComplaintSchema = createInsertSchema(complaints).omit({ id: true, createdDate: true, resolvedDate: true });
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

// Driver Stories Schema Types
export const insertDriverStorySchema = createInsertSchema(driverStories).omit({ id: true, likesCount: true, commentsCount: true, viewsCount: true, createdAt: true, updatedAt: true });
export const insertStoryCommentSchema = createInsertSchema(storyComments).omit({ id: true, likesCount: true, createdAt: true });
export const insertStoryLikeSchema = createInsertSchema(storyLikes).omit({ id: true, createdAt: true });
export const insertDriverTipSchema = createInsertSchema(driverTips).omit({ id: true, helpfulCount: true, isVerified: true, createdAt: true });
export const insertTipRatingSchema = createInsertSchema(tipRatings).omit({ id: true, createdAt: true });

export type DriverStory = typeof driverStories.$inferSelect;
export type InsertDriverStory = z.infer<typeof insertDriverStorySchema>;

export type StoryComment = typeof storyComments.$inferSelect;
export type InsertStoryComment = z.infer<typeof insertStoryCommentSchema>;

export type StoryLike = typeof storyLikes.$inferSelect;
export type InsertStoryLike = z.infer<typeof insertStoryLikeSchema>;

export type DriverTip = typeof driverTips.$inferSelect;
export type InsertDriverTip = z.infer<typeof insertDriverTipSchema>;

export type TipRating = typeof tipRatings.$inferSelect;
export type InsertTipRating = z.infer<typeof insertTipRatingSchema>;
