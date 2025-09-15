import { apiRequest } from "./queryClient";

export const api = {
  // Tenant management
  async getTenants() {
    const response = await apiRequest("GET", "/api/tenants");
    return response.json();
  },

  async createTenant(data: any) {
    const response = await apiRequest("POST", "/api/tenants", data);
    return response.json();
  },

  async getTenant(id: string) {
    const response = await apiRequest("GET", `/api/tenants/${id}`);
    return response.json();
  },

  // Products
  async getProducts(tenantId: string, search?: string) {
    const params = new URLSearchParams({ tenantId });
    if (search) params.append("search", search);
    const response = await apiRequest("GET", `/api/products?${params}`);
    return response.json();
  },

  async createProduct(data: any) {
    const response = await apiRequest("POST", "/api/products", data);
    return response.json();
  },

  async updateProduct(id: string, data: any) {
    const response = await apiRequest("PUT", `/api/products/${id}`, data);
    return response.json();
  },

  async deleteProduct(id: string) {
    const response = await apiRequest("DELETE", `/api/products/${id}`);
    return response.ok;
  },

  // Orders
  async getOrders(tenantId: string) {
    const response = await apiRequest("GET", `/api/orders?tenantId=${tenantId}`);
    return response.json();
  },

  async createOrder(data: any) {
    const response = await apiRequest("POST", "/api/orders", data);
    return response.json();
  },

  async updateOrder(id: string, data: any) {
    const response = await apiRequest("PUT", `/api/orders/${id}`, data);
    return response.json();
  },

  // Conversations
  async getConversations(tenantId: string) {
    const response = await apiRequest("GET", `/api/conversations?tenantId=${tenantId}`);
    return response.json();
  },

  async createConversation(data: any) {
    const response = await apiRequest("POST", "/api/conversations", data);
    return response.json();
  },

  // AI Chat
  async sendMessage(data: { message: string; tenantId: string; customerId?: string; channel?: string }) {
    const response = await apiRequest("POST", "/api/ai/chat", data);
    return response.json();
  },

  // Knowledge Base
  async getKnowledgeBase(tenantId: string, search?: string) {
    const params = new URLSearchParams({ tenantId });
    if (search) params.append("search", search);
    const response = await apiRequest("GET", `/api/knowledge-base?${params}`);
    return response.json();
  },

  async createKnowledgeBase(data: any) {
    const response = await apiRequest("POST", "/api/knowledge-base", data);
    return response.json();
  },

  // Analytics
  async getStats(tenantId?: string) {
    const params = tenantId ? `?tenantId=${tenantId}` : "";
    const response = await apiRequest("GET", `/api/analytics/stats${params}`);
    return response.json();
  },

  async getTenantActivity() {
    const response = await apiRequest("GET", "/api/analytics/tenant-activity");
    return response.json();
  },

  async getDemandTracking(tenantId: string) {
    const response = await apiRequest("GET", `/api/analytics/demand-tracking?tenantId=${tenantId}`);
    return response.json();
  },

  // Documents
  async createQuote(data: any) {
    const response = await apiRequest("POST", "/api/documents/quote", data);
    return response.json();
  },
};
