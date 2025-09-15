import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants table
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  industry: varchar("industry", { length: 100 }),
  settings: jsonb("settings").default('{}'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table with tenant association
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).default("user"), // user, admin, super_admin
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product catalog
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  sku: varchar("sku", { length: 50 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").default('[]'),
  specifications: jsonb("specifications").default('{}'),
  images: jsonb("images").default('[]'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory tracking
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantityAvailable: integer("quantity_available").default(0),
  quantityReserved: integer("quantity_reserved").default(0),
  reorderPoint: integer("reorder_point").default(10),
  lastRestocked: timestamp("last_restocked"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping carts
export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  customerId: text("customer_id"), // External customer identifier
  sessionId: text("session_id"),
  items: jsonb("items").default('[]'), // Array of cart items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  customerId: text("customer_id"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  items: jsonb("items").notNull(), // Array of order items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, processing, completed, cancelled
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  source: varchar("source", { length: 50 }), // telegram, whatsapp, web
  conversationId: uuid("conversation_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversations (AI chat logs)
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  customerId: text("customer_id"),
  channel: varchar("channel", { length: 20 }), // telegram, whatsapp
  messages: jsonb("messages").default('[]'), // Array of message objects
  intent: varchar("intent", { length: 100 }), // search, compare, add_to_cart, etc.
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  handoffRequested: boolean("handoff_requested").default(false),
  status: varchar("status", { length: 50 }).default("active"), // active, closed, escalated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Knowledge base
export const knowledgeBase = pgTable("knowledge_base", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").default('[]'),
  isPublic: boolean("is_public").default(false),
  embedding: jsonb("embedding"), // Vector embedding for RAG
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents (quotes, invoices)
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  orderId: uuid("order_id").references(() => orders.id),
  type: varchar("type", { length: 50 }).notNull(), // quote, invoice, receipt
  documentNumber: varchar("document_number", { length: 50 }).notNull(),
  content: jsonb("content").notNull(),
  filePath: text("file_path"),
  status: varchar("status", { length: 50 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Demand tracking
export const demandTracking = pgTable("demand_tracking", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  query: text("query").notNull(),
  category: varchar("category", { length: 100 }),
  searchCount: integer("search_count").default(1),
  noResultsCount: integer("no_results_count").default(0),
  potentialRevenue: decimal("potential_revenue", { precision: 10, scale: 2 }),
  lastSearched: timestamp("last_searched").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, updatedAt: true });
export const insertCartSchema = createInsertSchema(carts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertDemandTrackingSchema = createInsertSchema(demandTracking).omit({ id: true, createdAt: true });

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DemandTracking = typeof demandTracking.$inferSelect;
export type InsertDemandTracking = z.infer<typeof insertDemandTrackingSchema>;
