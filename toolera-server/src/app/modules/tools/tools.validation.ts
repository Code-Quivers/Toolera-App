import { z } from "zod";

const createTool = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    type: z.enum(["SOFTWARE", "SERVICE", "PHYSICAL", "SUBSCRIPTION"]).optional(),
    category: z.string().optional(),
    basePrice: z.number().min(0, "Price must be non-negative"),
    currency: z.string().optional(),
    images: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    metadata: z.any().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
    sortOrder: z.number().optional(),
  }),
});

const updateTool = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    type: z.enum(["SOFTWARE", "SERVICE", "PHYSICAL", "SUBSCRIPTION"]).optional(),
    category: z.string().optional(),
    basePrice: z.number().min(0).optional(),
    currency: z.string().optional(),
    images: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    metadata: z.any().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
    sortOrder: z.number().optional(),
  }),
});

const createVariant = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    price: z.number().min(0, "Price must be non-negative"),
    billingCycle: z.string().optional(),
    features: z.array(z.string()).optional(),
    metadata: z.any().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sortOrder: z.number().optional(),
  }),
});

const updateVariant = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    billingCycle: z.string().optional(),
    features: z.array(z.string()).optional(),
    metadata: z.any().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sortOrder: z.number().optional(),
  }),
});

export const ToolsValidation = {
  createTool,
  updateTool,
  createVariant,
  updateVariant,
};
