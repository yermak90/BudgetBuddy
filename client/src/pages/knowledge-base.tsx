import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, BookOpen, Edit, Eye, Globe, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertKnowledgeBaseSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";
import type { KnowledgeBase } from "@shared/schema";

type KnowledgeBaseFormData = z.infer<typeof insertKnowledgeBaseSchema>;

export default function KnowledgeBasePage() {
  const { selectedTenant } = useTenantContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBase | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const { data: knowledgeBase, isLoading } = useQuery({
    queryKey: ["/api/knowledge-base", selectedTenant?.id, searchQuery],
    queryFn: () => selectedTenant ? api.getKnowledgeBase(selectedTenant.id, searchQuery || undefined) : Promise.resolve([]),
    enabled: !!selectedTenant,
  });

  const createKnowledgeBaseMutation = useMutation({
    mutationFn: api.createKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({
        title: "Success",
        description: "Knowledge base article created successfully",
      });
      setShowCreateForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create knowledge base article",
        variant: "destructive",
      });
    },
  });

  const form = useForm<KnowledgeBaseFormData>({
    resolver: zodResolver(insertKnowledgeBaseSchema),
    defaultValues: {
      tenantId: selectedTenant?.id || "",
      title: "",
      content: "",
      category: "",
      tags: [],
      isPublic: false,
    },
  });

  const onSubmit = (data: KnowledgeBaseFormData) => {
    if (!selectedTenant) return;
    createKnowledgeBaseMutation.mutate({
      ...data,
      tenantId: selectedTenant.id,
    });
  };

  const handleViewArticle = (article: KnowledgeBase) => {
    setSelectedArticle(article);
    setShowViewer(true);
  };

  const categories = Array.from(new Set(knowledgeBase?.map((kb: KnowledgeBase) => kb.category).filter(Boolean))) || [];

  const statsCards = [
    {
      title: "Total Articles",
      value: knowledgeBase?.length || 0,
      color: "primary",
    },
    {
      title: "Public Articles",
      value: knowledgeBase?.filter((kb: KnowledgeBase) => kb.isPublic).length || 0,
      color: "accent",
    },
    {
      title: "Categories",
      value: categories.length,
      color: "chart-3",
    },
    {
      title: "Private Articles",
      value: knowledgeBase?.filter((kb: KnowledgeBase) => !kb.isPublic).length || 0,
      color: "chart-4",
    },
  ];

  return (
    <div className="min-h-screen flex" data-testid="knowledge-base-page">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Knowledge Base" description="Manage AI knowledge base and documentation" />
        
        <div className="flex-1 overflow-auto p-6">
          {!selectedTenant ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a tenant</h3>
                <p className="text-muted-foreground">
                  Choose a tenant from the dropdown above to manage knowledge base articles
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {statsCards.map((card) => (
                  <Card key={card.title} data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                          <p className="text-2xl font-bold text-foreground">{card.value}</p>
                        </div>
                        <div className={`w-10 h-10 bg-${card.color}/10 rounded-lg flex items-center justify-center`}>
                          <BookOpen className={`text-${card.color} w-5 h-5`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Search and Add */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search knowledge base..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-knowledge-base"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  data-testid="button-add-article"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Article
                </Button>
              </div>

              {/* Knowledge Base Articles */}
              {isLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse h-24 bg-muted rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : knowledgeBase?.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "No articles match your search criteria" 
                        : "Start building your knowledge base by adding your first article"}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Article
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {knowledgeBase?.map((article: KnowledgeBase) => (
                    <Card key={article.id} data-testid={`article-card-${article.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                            {article.category && (
                              <Badge variant="secondary" className="mt-2 capitalize">
                                {article.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {article.isPublic ? (
                              <Globe className="w-4 h-4 text-accent" title="Public" />
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground" title="Private" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {article.content.substring(0, 150)}...
                        </p>
                        
                        {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.slice(0, 3).map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{article.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                          <span>Created {new Date(article.createdAt).toLocaleDateString()}</span>
                          <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewArticle(article)}
                            data-testid={`view-article-${article.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            data-testid={`edit-article-${article.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Article Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base Article</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="knowledge-base-form">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter article title"
                        data-testid="input-article-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g. FAQ, Troubleshooting"
                          data-testid="input-article-category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-article-visibility">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="false">Private</SelectItem>
                          <SelectItem value="true">Public</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter the article content..."
                        className="min-h-[200px]"
                        data-testid="input-article-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createKnowledgeBaseMutation.isPending}
                  data-testid="button-submit-article"
                >
                  {createKnowledgeBaseMutation.isPending ? "Creating..." : "Create Article"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  data-testid="button-cancel-article"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Article Viewer Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{selectedArticle?.title}</DialogTitle>
              <div className="flex items-center gap-2">
                {selectedArticle?.isPublic ? (
                  <Badge variant="default" className="gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                )}
                {selectedArticle?.category && (
                  <Badge variant="outline" className="capitalize">
                    {selectedArticle.category}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {selectedArticle?.tags && Array.isArray(selectedArticle.tags) && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedArticle.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedArticle?.content}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t">
                <span>Created: {selectedArticle && new Date(selectedArticle.createdAt).toLocaleString()}</span>
                <span>Updated: {selectedArticle && new Date(selectedArticle.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
