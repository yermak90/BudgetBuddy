import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, Bot, User, Filter, ExternalLink, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Conversation } from "@shared/schema";

const createConversationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerContact: z.string().min(1, "Contact information is required"),
  channel: z.enum(["telegram", "whatsapp", "web"]),
  status: z.enum(["active", "closed", "escalated"]).default("active"),
});

type CreateConversationData = z.infer<typeof createConversationSchema>;

export default function Conversations() {
  const { selectedTenant } = useTenantContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["/api/conversations", selectedTenant?.id],
    queryFn: () => selectedTenant ? api.getConversations(selectedTenant.id) : Promise.resolve([]),
    enabled: !!selectedTenant,
  });

  const form = useForm<CreateConversationData>({
    resolver: zodResolver(createConversationSchema),
    defaultValues: {
      customerName: "",
      customerContact: "",
      channel: "whatsapp",
      status: "active",
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: CreateConversationData) => {
      if (!selectedTenant) throw new Error("No tenant selected");
      return apiRequest('/api/conversations', 'POST', {
        ...data,
        tenantId: selectedTenant.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedTenant?.id] });
      setShowCreateDialog(false);
      form.reset();
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'closed': return 'secondary';
      case 'escalated': return 'destructive';
      default: return 'outline';
    }
  };

  const getChannelVariant = (channel: string) => {
    switch (channel) {
      case 'telegram': return 'default';
      case 'whatsapp': return 'secondary';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: string | null) => {
    if (!confidence) return 'text-muted-foreground';
    const conf = parseFloat(confidence);
    if (conf >= 0.8) return 'text-accent';
    if (conf >= 0.6) return 'text-chart-3';
    return 'text-chart-4';
  };

  const filteredConversations = conversations?.filter((conversation: Conversation) => {
    const matchesSearch = !searchQuery || 
      conversation.customerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.intent?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || conversation.status === statusFilter;
    const matchesChannel = channelFilter === "all" || conversation.channel === channelFilter;
    
    return matchesSearch && matchesStatus && matchesChannel;
  }) || [];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
    { value: "escalated", label: "Escalated" },
  ];

  const channelOptions = [
    { value: "all", label: "All Channels" },
    { value: "telegram", label: "Telegram" },
    { value: "whatsapp", label: "WhatsApp" },
  ];

  const statsCards = [
    {
      title: "Total Conversations",
      value: filteredConversations.length,
      color: "primary",
    },
    {
      title: "Active",
      value: filteredConversations.filter((c: Conversation) => c.status === 'active').length,
      color: "accent",
    },
    {
      title: "Escalated",
      value: filteredConversations.filter((c: Conversation) => c.status === 'escalated').length,
      color: "destructive",
    },
    {
      title: "Avg Confidence",
      value: filteredConversations.length > 0 
        ? `${(filteredConversations.reduce((sum: number, c: Conversation) => sum + (parseFloat(c.confidence || '0')), 0) / filteredConversations.length * 100).toFixed(1)}%`
        : "0%",
      color: "chart-3",
    },
  ];

  return (
    <div className="min-h-screen flex" data-testid="conversations-page">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Conversations" description="Monitor AI chat interactions and customer support" />
        
        <div className="flex-1 overflow-auto p-6">
          {!selectedTenant ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a tenant</h3>
                <p className="text-muted-foreground">
                  Choose a tenant from the dropdown above to view conversations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Conversations List */}
              <div className="lg:col-span-1 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {statsCards.map((card) => (
                    <Card key={card.title} data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs font-medium">{card.title}</p>
                          <p className="text-lg font-bold text-foreground">{card.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Filters */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-conversations"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={channelFilter} onValueChange={setChannelFilter}>
                      <SelectTrigger data-testid="select-channel-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {channelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Conversations List */}
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Recent Conversations ({filteredConversations.length})</CardTitle>
                      <Button 
                        size="sm" 
                        onClick={() => setShowCreateDialog(true)}
                        data-testid="new-conversation-button"
                        disabled={!selectedTenant}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="p-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
                        ))}
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="p-8 text-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No conversations found</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[500px]">
                        <div className="p-2 space-y-2">
                          {filteredConversations.map((conversation: Conversation) => (
                            <div
                              key={conversation.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedConversation?.id === conversation.id ? 'bg-muted border-primary' : 'bg-background'
                              }`}
                              onClick={() => setSelectedConversation(conversation)}
                              data-testid={`conversation-item-${conversation.id}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={getChannelVariant(conversation.channel || 'web')} className="text-xs">
                                    {conversation.channel || 'web'}
                                  </Badge>
                                  <Badge variant={getStatusVariant(conversation.status || 'active')} className="text-xs">
                                    {conversation.status || 'active'}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : 'Unknown'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  {conversation.customerId || 'Anonymous'}
                                </p>
                                {conversation.intent && (
                                  <p className="text-xs text-muted-foreground capitalize">
                                    Intent: {conversation.intent}
                                  </p>
                                )}
                                {conversation.confidence && (
                                  <p className={`text-xs ${getConfidenceColor(conversation.confidence)}`}>
                                    Confidence: {(parseFloat(conversation.confidence) * 100).toFixed(1)}%
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Conversation Detail */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  {selectedConversation ? (
                    <>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              Conversation with {selectedConversation.customerId || 'Anonymous'}
                            </CardTitle>
                            {selectedConversation.handoffRequested && (
                              <Badge variant="destructive">Handoff Requested</Badge>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Full Details
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Channel: {selectedConversation.channel || 'web'}</span>
                          <span>Status: {selectedConversation.status}</span>
                          <span>Started: {selectedConversation.createdAt ? new Date(selectedConversation.createdAt).toLocaleString() : 'Unknown'}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                          {selectedConversation.messages && Array.isArray(selectedConversation.messages) ? (
                            <div className="space-y-4">
                              {selectedConversation.messages.map((message: any, index: number) => (
                                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      message.role === 'user' ? 'bg-primary' : 'bg-accent'
                                    }`}>
                                      {message.role === 'user' ? (
                                        <User className="w-4 h-4 text-primary-foreground" />
                                      ) : (
                                        <Bot className="w-4 h-4 text-accent-foreground" />
                                      )}
                                    </div>
                                    <div className={`rounded-lg p-3 ${
                                      message.role === 'user' 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted'
                                    }`}>
                                      <p className="text-sm">{message.content}</p>
                                      {message.timestamp && (
                                        <p className={`text-xs mt-1 ${
                                          message.role === 'user' 
                                            ? 'text-primary-foreground/70' 
                                            : 'text-muted-foreground'
                                        }`}>
                                          {new Date(message.timestamp).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                              <p>No messages in this conversation</p>
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                        <p className="text-muted-foreground">
                          Choose a conversation from the list to view details
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Conversation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createConversationMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter customer name" 
                        {...field} 
                        data-testid="input-customer-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Email, phone, or username" 
                        {...field} 
                        data-testid="input-customer-contact"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-channel">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="web">Web Chat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createConversationMutation.isPending}
                  data-testid="button-create-conversation"
                >
                  {createConversationMutation.isPending ? "Creating..." : "Start Conversation"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
