import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { insertTenantSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";

type TenantFormData = z.infer<typeof insertTenantSchema>;

interface TenantFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TenantForm({ onSuccess, onCancel }: TenantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TenantFormData>({
    resolver: zodResolver(insertTenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      industry: "",
      settings: {},
      isActive: true,
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: api.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Success",
        description: "Tenant created successfully",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TenantFormData) => {
    // Generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    createTenantMutation.mutate(data);
  };

  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    // Auto-generate slug from name
    const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    form.setValue("slug", slug);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="tenant-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter company name"
                  data-testid="input-tenant-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL identifier)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="auto-generated-from-name"
                  data-testid="input-tenant-slug"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Brief description of the company"
                  data-testid="input-tenant-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-tenant-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button 
            type="submit" 
            disabled={createTenantMutation.isPending}
            data-testid="button-submit-tenant"
          >
            {createTenantMutation.isPending ? "Creating..." : "Create Tenant"}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel-tenant"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
