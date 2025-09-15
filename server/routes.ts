import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./openai";
import { 
  insertTenantSchema,
  insertUserSchema, 
  insertProductSchema,
  insertOrderSchema,
  insertConversationSchema,
  insertKnowledgeBaseSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tenant management routes
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  app.post("/api/tenants", async (req, res) => {
    try {
      const validatedData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(validatedData);
      res.status(201).json(tenant);
    } catch (error) {
      res.status(400).json({ error: "Invalid tenant data" });
    }
  });

  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const tenant = await storage.getTenant(req.params.id);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenant" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const { tenantId } = req.query;
      const users = tenantId 
        ? await storage.getUsersByTenant(tenantId as string)
        : [];
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Product catalog routes
  app.get("/api/products", async (req, res) => {
    try {
      const { tenantId, search } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      const products = search 
        ? await storage.searchProducts(tenantId as string, search as string)
        : await storage.getProductsByTenant(tenantId as string);
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      
      // Create initial inventory record
      await storage.createInventory({
        productId: product.id,
        quantityAvailable: 0,
        quantityReserved: 0,
        reorderPoint: 10,
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const { tenantId } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      const inventory = await storage.getInventoryByTenant(tenantId as string);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.put("/api/inventory/:productId", async (req, res) => {
    try {
      const updates = z.object({
        quantityAvailable: z.number().optional(),
        quantityReserved: z.number().optional(),
        reorderPoint: z.number().optional(),
      }).parse(req.body);

      const inventory = await storage.updateInventory(req.params.productId, updates);
      if (!inventory) {
        return res.status(404).json({ error: "Inventory not found" });
      }
      res.json(inventory);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  // Order management routes
  app.get("/api/orders", async (req, res) => {
    try {
      const { tenantId, customerId } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      const orders = customerId
        ? await storage.getOrdersByCustomer(tenantId as string, customerId as string)
        : await storage.getOrdersByTenant(tenantId as string);
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      const order = await storage.createOrder({
        ...validatedData,
        orderNumber,
      });

      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const updates = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(req.params.id, updates);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const { tenantId } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      const conversations = await storage.getConversationsByTenant(tenantId as string);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, tenantId, customerId, channel } = req.body;
      
      if (!message || !tenantId) {
        return res.status(400).json({ error: "Message and tenant ID required" });
      }

      // Get tenant's products and knowledge base for context
      const products = await storage.getProductsByTenant(tenantId);
      const knowledgeBase = await storage.getKnowledgeBaseByTenant(tenantId);

      // Analyze message with AI
      const aiResult = await aiService.analyzeCustomerMessage(
        message,
        tenantId,
        products,
        knowledgeBase
      );

      // Log conversation
      await storage.createConversation({
        tenantId,
        customerId,
        channel,
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          { role: "assistant", content: aiResult.response, timestamp: new Date() }
        ],
        intent: aiResult.intent,
        confidence: aiResult.confidence.toString(),
        handoffRequested: aiResult.requiresEscalation,
        status: aiResult.requiresEscalation ? "escalated" : "active",
      });

      // Track demand if no results found and search intent
      if (aiResult.intent === "search" && aiResult.suggestedProducts?.length === 0) {
        await storage.createDemandTracking({
          tenantId,
          query: message,
          category: aiResult.entities.categories?.[0] || "general",
          searchCount: 1,
          noResultsCount: 1,
          potentialRevenue: "0",
          lastSearched: new Date(),
        });
      }

      res.json({
        response: aiResult.response,
        intent: aiResult.intent,
        confidence: aiResult.confidence,
        suggestedProducts: aiResult.suggestedProducts,
        requiresEscalation: aiResult.requiresEscalation,
      });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "AI service temporarily unavailable" });
    }
  });

  // Knowledge base routes
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const { tenantId, search } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      const items = search
        ? await storage.searchKnowledgeBase(tenantId as string, search as string)
        : await storage.getKnowledgeBaseByTenant(tenantId as string);
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const validatedData = insertKnowledgeBaseSchema.parse(req.body);
      const item = await storage.createKnowledgeBase(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid knowledge base data" });
    }
  });

  // Analytics and dashboard routes
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const { tenantId } = req.query;
      const stats = await storage.getTenantStats(tenantId as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/tenant-activity", async (req, res) => {
    try {
      const tenants = await storage.getAllTenants();
      const activity = [];

      for (const tenant of tenants.slice(0, 5)) { // Limit to top 5
        const conversations = await storage.getConversationsByTenant(tenant.id);
        const orders = await storage.getOrdersByTenant(tenant.id);
        const revenue = orders.reduce((sum, order) => 
          sum + parseFloat(order.totalAmount.toString()), 0);

        activity.push({
          tenant,
          conversationCount: conversations.length,
          orderCount: orders.length,
          revenue,
          status: conversations.length > 100 ? "active" : 
                  conversations.length > 50 ? "moderate" : "low"
        });
      }

      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenant activity" });
    }
  });

  app.get("/api/analytics/demand-tracking", async (req, res) => {
    try {
      const { tenantId } = req.query;
      if (!tenantId) {
        return res.status(400).json({ error: "Tenant ID required" });
      }

      const demandData = await storage.getDemandTracking(tenantId as string);
      
      // Sort by search count descending
      const sortedDemand = demandData
        .sort((a, b) => b.searchCount - a.searchCount)
        .slice(0, 10);

      res.json(sortedDemand);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch demand data" });
    }
  });

  // Document generation routes
  app.post("/api/documents/quote", async (req, res) => {
    try {
      const { tenantId, customerId, customerName, customerEmail, items } = req.body;
      
      if (!tenantId || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Invalid quote request" });
      }

      const tenant = await storage.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Generate quote content using AI
      const quoteContent = await aiService.generateQuoteContent(
        { name: customerName, email: customerEmail },
        items,
        tenant
      );

      const document = await storage.createDocument({
        tenantId,
        orderId: null,
        type: "quote",
        documentNumber: `QT-${Date.now()}`,
        content: quoteContent,
        status: "generated",
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Quote generation error:", error);
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
