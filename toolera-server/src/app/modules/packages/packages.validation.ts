import { z } from "zod";

const createPackage = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    platformNameId: z.string().uuid("Invalid platform ID"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be non-negative"),
    currency: z.string().optional(),
    billingCycle: z.string().optional(),
    features: z.array(z.string()).optional(),
    trialDays: z.number().min(0).optional(),
    isHighlighted: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    metadata: z.any().optional(),
  }),
});

const updatePackage = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    platformNameId: z.string().uuid().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    currency: z.string().optional(),
    billingCycle: z.string().optional(),
    features: z.array(z.string()).optional(),
    trialDays: z.number().min(0).optional(),
    isHighlighted: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    metadata: z.any().optional(),
  }),
});

const createPlatform = z.object({
  body: z.object({
    platformName: z.string().min(1, "Platform name is required"),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updatePlatform = z.object({
  body: z.object({
    platformName: z.string().min(1).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const PackagesValidation = {
  createPackage,
  updatePackage,
  createPlatform,
  updatePlatform,
};
