import OpenAI from "openai";
import type { Conversation, Product, KnowledgeBase } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIAnalysisResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  response: string;
  suggestedProducts?: string[];
  requiresEscalation: boolean;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  priceRange?: { min: number; max: number };
  features?: string[];
}

export class AIService {
  async analyzeCustomerMessage(
    message: string,
    tenantId: string,
    products: Product[],
    knowledgeBase: KnowledgeBase[]
  ): Promise<AIAnalysisResult> {
    try {
      const systemPrompt = `You are an expert AI sales assistant for a multi-tenant e-commerce platform. 
      Analyze the customer message and provide structured insights.
      
      Available products: ${JSON.stringify(products.slice(0, 20))} // Limit context
      Knowledge base: ${JSON.stringify(knowledgeBase.slice(0, 10))}
      
      Respond with JSON in this format:
      {
        "intent": "search|compare|add_to_cart|create_quote|checkout|kb_answer|status|handoff|unknown",
        "confidence": 0.0-1.0,
        "entities": {
          "product_names": [],
          "price_range": {"min": 0, "max": 0},
          "categories": [],
          "features": []
        },
        "response": "customer-facing response text",
        "suggestedProducts": ["product_id1", "product_id2"],
        "requiresEscalation": false
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        intent: result.intent || "unknown",
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        entities: result.entities || {},
        response: result.response || "I'm not sure how to help with that. Let me connect you with a human agent.",
        suggestedProducts: result.suggestedProducts || [],
        requiresEscalation: result.requiresEscalation || result.confidence < 0.5,
      };
    } catch (error) {
      console.error("AI analysis failed:", error);
      return {
        intent: "unknown",
        confidence: 0,
        entities: {},
        response: "I'm experiencing technical difficulties. Let me connect you with a human agent.",
        suggestedProducts: [],
        requiresEscalation: true,
      };
    }
  }

  async generateProductComparison(products: Product[]): Promise<string> {
    if (products.length < 2) {
      throw new Error("Need at least 2 products to compare");
    }

    try {
      const prompt = `Compare these products and provide a detailed analysis highlighting key differences, pros and cons:
      
      ${JSON.stringify(products, null, 2)}
      
      Format the response as a clear comparison with recommendations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      return response.choices[0].message.content || "Unable to generate comparison.";
    } catch (error) {
      console.error("Product comparison failed:", error);
      throw new Error("Failed to generate product comparison");
    }
  }

  async searchProducts(params: ProductSearchParams, availableProducts: Product[]): Promise<Product[]> {
    try {
      const searchPrompt = `Based on this search query: "${params.query}", 
      find the most relevant products from this catalog:
      
      ${JSON.stringify(availableProducts, null, 2)}
      
      Consider:
      - Product names and descriptions
      - Categories and tags
      - Price range: ${params.priceRange ? `$${params.priceRange.min}-$${params.priceRange.max}` : "any"}
      - Required features: ${params.features?.join(", ") || "none"}
      
      Respond with JSON containing an array of product IDs ranked by relevance:
      { "productIds": ["id1", "id2", "id3"], "reasoning": "explanation" }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: searchPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      const productIds = result.productIds || [];
      
      return availableProducts.filter(product => productIds.includes(product.id));
    } catch (error) {
      console.error("AI product search failed:", error);
      // Fallback to simple text matching
      return availableProducts.filter(product => 
        product.name.toLowerCase().includes(params.query.toLowerCase()) ||
        product.description?.toLowerCase().includes(params.query.toLowerCase())
      );
    }
  }

  async generateQuoteContent(
    customer: { name: string; email?: string },
    items: Array<{ product: Product; quantity: number; price: number }>,
    tenantInfo: { name: string; settings?: any }
  ): Promise<any> {
    try {
      const prompt = `Generate a professional quote document content for:
      
      Customer: ${customer.name} ${customer.email ? `(${customer.email})` : ""}
      Company: ${tenantInfo.name}
      
      Items:
      ${items.map(item => `- ${item.product.name} x${item.quantity} @ $${item.price} each`).join("\n")}
      
      Total: $${items.reduce((sum, item) => sum + (item.quantity * item.price), 0)}
      
      Include:
      - Professional formatting
      - Terms and conditions
      - Validity period (30 days)
      - Payment terms
      
      Respond with JSON containing the quote structure.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Quote generation failed:", error);
      throw new Error("Failed to generate quote content");
    }
  }

  async extractProductInfo(description: string): Promise<Partial<Product>> {
    try {
      const prompt = `Extract structured product information from this description:
      
      "${description}"
      
      Respond with JSON containing:
      {
        "name": "product name",
        "category": "category",
        "specifications": {},
        "tags": [],
        "estimatedPrice": 0
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Product info extraction failed:", error);
      return {};
    }
  }

  async generateDemandInsights(demandData: any[]): Promise<string> {
    try {
      const prompt = `Analyze this demand tracking data and provide actionable business insights:
      
      ${JSON.stringify(demandData, null, 2)}
      
      Focus on:
      - Stock gaps and procurement recommendations
      - Market trends and opportunities
      - Customer behavior patterns
      - Revenue optimization suggestions
      
      Provide a concise executive summary.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return response.choices[0].message.content || "No insights available.";
    } catch (error) {
      console.error("Demand insights generation failed:", error);
      return "Unable to generate demand insights at this time.";
    }
  }
}

export const aiService = new AIService();
