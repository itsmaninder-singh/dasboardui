import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  // Only ADMIN should be able to create other ADMIN/PM accounts in practice;
  // this endpoint restricts self-registration to DEVELOPER by default (see auth.service.ts).
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
