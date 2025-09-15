import { 
  type Tenant, type InsertTenant,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Inventory, type InsertInventory,
  type Cart, type InsertCart,
  type Order, type InsertOrder,
  type Conversation, type InsertConversation,
  type KnowledgeBase, type InsertKnowledgeBase,
  type Document, type InsertDocument,
  type DemandTracking, type InsertDemandTracking,
  tenants, users, products, inventory, carts, orders, conversations, knowledgeBase, documents, demandTracking
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tenant management
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;

  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Product catalog
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByTenant(tenantId: string): Promise<Product[]>;
  searchProducts(tenantId: string, query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Inventory
  getInventory(productId: string): Promise<Inventory | undefined>;
  getInventoryByTenant(tenantId: string): Promise<Inventory[]>;
  updateInventory(productId: string, updates: Partial<Inventory>): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;

  // Shopping carts
  getCart(id: string): Promise<Cart | undefined>;
  getCartBySession(tenantId: string, sessionId: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  updateCart(id: string, updates: Partial<Cart>): Promise<Cart | undefined>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByTenant(tenantId: string): Promise<Order[]>;
  getOrdersByCustomer(tenantId: string, customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByTenant(tenantId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;

  // Knowledge base
  getKnowledgeBase(id: string): Promise<KnowledgeBase | undefined>;
  getKnowledgeBaseByTenant(tenantId: string): Promise<KnowledgeBase[]>;
  searchKnowledgeBase(tenantId: string, query: string): Promise<KnowledgeBase[]>;
  createKnowledgeBase(kb: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByTenant(tenantId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;

  // Demand tracking
  getDemandTracking(tenantId: string): Promise<DemandTracking[]>;
  createDemandTracking(demand: InsertDemandTracking): Promise<DemandTracking>;
  updateDemandTracking(id: string, updates: Partial<DemandTracking>): Promise<DemandTracking | undefined>;

  // Analytics
  getTenantStats(tenantId?: string): Promise<{
    activeTenants: number;
    totalConversations: number;
    totalRevenue: number;
    aiAccuracy: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // No initialization needed for database storage
  }

  // Tenant methods
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant || undefined;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const [updatedTenant] = await db.update(tenants)
      .set(updates)
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant || undefined;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByTenant(tenantId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.tenantId, tenantId))
      .orderBy(desc(products.createdAt));
  }

  async searchProducts(tenantId: string, query: string): Promise<Product[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          sql`(LOWER(${products.name}) LIKE ${lowerQuery} OR LOWER(${products.description}) LIKE ${lowerQuery} OR LOWER(${products.category}) LIKE ${lowerQuery})`
        )
      )
      .orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Inventory methods
  async getInventory(productId: string): Promise<Inventory | undefined> {
    const [inv] = await db.select().from(inventory).where(eq(inventory.productId, productId));
    return inv || undefined;
  }

  async getInventoryByTenant(tenantId: string): Promise<Inventory[]> {
    return await db.select({
      id: inventory.id,
      productId: inventory.productId,
      quantityAvailable: inventory.quantityAvailable,
      quantityReserved: inventory.quantityReserved,
      reorderPoint: inventory.reorderPoint,
      lastRestocked: inventory.lastRestocked,
      updatedAt: inventory.updatedAt,
    })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(eq(products.tenantId, tenantId));
  }

  async updateInventory(productId: string, updates: Partial<Inventory>): Promise<Inventory | undefined> {
    const [updatedInventory] = await db.update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.productId, productId))
      .returning();
    return updatedInventory || undefined;
  }

  async createInventory(inventoryData: InsertInventory): Promise<Inventory> {
    const [newInventory] = await db.insert(inventory).values(inventoryData).returning();
    return newInventory;
  }

  // Cart methods
  async getCart(id: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, id));
    return cart || undefined;
  }

  async getCartBySession(tenantId: string, sessionId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts)
      .where(and(eq(carts.tenantId, tenantId), eq(carts.sessionId, sessionId)));
    return cart || undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const [newCart] = await db.insert(carts).values(cart).returning();
    return newCart;
  }

  async updateCart(id: string, updates: Partial<Cart>): Promise<Cart | undefined> {
    const [updatedCart] = await db.update(carts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(carts.id, id))
      .returning();
    return updatedCart || undefined;
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByTenant(tenantId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.tenantId, tenantId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByCustomer(tenantId: string, customerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(and(eq(orders.tenantId, tenantId), eq(orders.customerId, customerId)))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByTenant(tenantId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.tenantId, tenantId))
      .orderBy(desc(conversations.createdAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [updatedConversation] = await db.update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation || undefined;
  }

  // Knowledge base methods
  async getKnowledgeBase(id: string): Promise<KnowledgeBase | undefined> {
    const [kb] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return kb || undefined;
  }

  async getKnowledgeBaseByTenant(tenantId: string): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase)
      .where(eq(knowledgeBase.tenantId, tenantId))
      .orderBy(desc(knowledgeBase.createdAt));
  }

  async searchKnowledgeBase(tenantId: string, query: string): Promise<KnowledgeBase[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.tenantId, tenantId),
          sql`(LOWER(${knowledgeBase.title}) LIKE ${lowerQuery} OR LOWER(${knowledgeBase.content}) LIKE ${lowerQuery})`
        )
      )
      .orderBy(desc(knowledgeBase.createdAt));
  }

  async createKnowledgeBase(kb: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [newKB] = await db.insert(knowledgeBase).values(kb).returning();
    return newKB;
  }

  async updateKnowledgeBase(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined> {
    const [updatedKB] = await db.update(knowledgeBase)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeBase.id, id))
      .returning();
    return updatedKB || undefined;
  }

  // Document methods
  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByTenant(tenantId: string): Promise<Document[]> {
    return await db.select().from(documents)
      .where(eq(documents.tenantId, tenantId))
      .orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  // Demand tracking methods
  async getDemandTracking(tenantId: string): Promise<DemandTracking[]> {
    return await db.select().from(demandTracking)
      .where(eq(demandTracking.tenantId, tenantId))
      .orderBy(desc(demandTracking.lastSearched));
  }

  async createDemandTracking(demand: InsertDemandTracking): Promise<DemandTracking> {
    const [newDemand] = await db.insert(demandTracking).values(demand).returning();
    return newDemand;
  }

  async updateDemandTracking(id: string, updates: Partial<DemandTracking>): Promise<DemandTracking | undefined> {
    const [updatedDemand] = await db.update(demandTracking)
      .set(updates)
      .where(eq(demandTracking.id, id))
      .returning();
    return updatedDemand || undefined;
  }

  // Analytics methods
  async getTenantStats(tenantId?: string): Promise<{
    activeTenants: number;
    totalConversations: number;
    totalRevenue: number;
    aiAccuracy: number;
  }> {
    const conversationFilter = tenantId ? eq(conversations.tenantId, tenantId) : undefined;
    const orderFilter = tenantId ? eq(orders.tenantId, tenantId) : undefined;

    const [conversationStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        handoffs: sql<number>`COUNT(CASE WHEN ${conversations.handoffRequested} = true THEN 1 END)`,
      })
      .from(conversations)
      .where(conversationFilter);

    const [revenueStats] = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .where(orderFilter);

    const [tenantCount] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(tenants)
      .where(tenantId ? eq(tenants.id, tenantId) : eq(tenants.isActive, true));

    const totalConversationsCount = conversationStats?.total || 0;
    const handoffCount = conversationStats?.handoffs || 0;
    const aiAccuracy = totalConversationsCount > 0 
      ? ((totalConversationsCount - handoffCount) / totalConversationsCount) * 100
      : 94.2;

    return {
      activeTenants: tenantId ? 1 : (tenantCount?.count || 0),
      totalConversations: totalConversationsCount,
      totalRevenue: revenueStats?.total || 0,
      aiAccuracy,
    };
  }
}

export const storage = new DatabaseStorage();
