import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Single shared Prisma instance across the app (repositories import this).
export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
