import { z } from "zod";

const statusEnum = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "OVERDUE"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  projectId: z.string().uuid(),
  assignedDeveloperId: z.string().uuid().optional(),
  priority: priorityEnum.optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  assignedDeveloperId: z.string().uuid().nullable().optional(),
  priority: priorityEnum.optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: statusEnum,
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const taskFilterQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDateFrom: z.coerce.date().optional(),
  dueDateTo: z.coerce.date().optional(),
  projectId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
