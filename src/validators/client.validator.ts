import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().optional(),
  company: z.string().max(150).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
