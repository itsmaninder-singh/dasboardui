import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  clientId: z.string().uuid(),
  
  managerId: z.string().uuid().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(2000).optional(),
  clientId: z.string().uuid().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
