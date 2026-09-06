import { z } from 'zod';

// Zod schemas for runtime validation & static typing
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.string(),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  unit: z.string(),
  categoryId: z.string(),
  imageUrl: z.string(),
  rating: z.number().min(0).max(5),
  isAvailable: z.boolean(),
  origin: z.string().optional(),
});

export const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
});

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(OrderItemSchema),
  totalAmount: z.number(),
  status: z.enum(['pending', 'confirmed', 'delivering', 'delivered', 'cancelled']),
  deliveryAddress: z.string(),
  createdAt: z.string(),
});

// TypeScript Types derived from schemas
export type User = z.infer<typeof UserSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: string;
}
