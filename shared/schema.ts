import { z } from "zod";

// Developer schema
export const developerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  company: z.string().optional(),
  password: z.string().min(6),
  createdAt: z.date(),
  isVerified: z.boolean().default(false),
});

export const insertDeveloperSchema = developerSchema.omit({
  id: true,
  createdAt: true,
  isVerified: true,
});

export const loginDeveloperSchema = developerSchema.pick({
  email: true,
  password: true,
});

// App schema
export const appSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  description: z.string().min(10),
  category: z.enum(["Medical Education", "Health Monitoring", "Pharmacy", "Anatomy", "Other"]),
  logoUrl: z.string().url(),
  downloadUrl: z.string().url(),
  screenshots: z.array(z.string().url()).min(4).max(4),
  developerId: z.string(),
  developerName: z.string(),
  status: z.enum(["pending", "published", "rejected"]).default("pending"),
  rating: z.number().min(0).max(5).default(0),
  downloads: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  paymentId: z.string().optional(),
  paymentStatus: z.enum(["pending", "completed", "failed"]).default("pending"),
});

export const insertAppSchema = appSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  rating: true,
  downloads: true,
  paymentId: true,
  paymentStatus: true,
});

export const updateAppSchema = appSchema.partial().omit({
  id: true,
  createdAt: true,
  developerId: true,
});

// Payment schema
export const paymentSchema = z.object({
  id: z.string(),
  appId: z.string(),
  developerId: z.string(),
  amount: z.number().default(1000), // KES 1,000
  currency: z.string().default("KES"),
  reference: z.string(),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  paystackReference: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPaymentSchema = paymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Developer = z.infer<typeof developerSchema>;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;
export type LoginDeveloper = z.infer<typeof loginDeveloperSchema>;

export type App = z.infer<typeof appSchema>;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type UpdateApp = z.infer<typeof updateAppSchema>;

export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
