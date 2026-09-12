import cron from "node-cron";
import { taskRepository } from "../repositories/task.repository";
import { activityRepository } from "../repositories/activity.repository";
import { emitTaskActivity } from "../socket/events";
import { prisma } from "../config/db";
import { logger } from "../utils/logger";

const SYSTEM_ACTOR_EMAIL = "system@internal.local";

async function getOrCreateSystemActor() {
  let system = await prisma.user.findUnique({ where: { email: SYSTEM_ACTOR_EMAIL } });
  if (!system) {
    system = await prisma.user.create({
      data: {
        name: "System",
        email: SYSTEM_ACTOR_EMAIL,
        passwordHash: "not-a-real-account",
        role: "ADMIN",
        isActive: false, 
      },
    });
  }
  return system;
}

export async function runOverdueSweep() {
  const candidates = await taskRepository.findOverdueCandidates();
  if (candidates.length === 0) return { updated: 0 };

  const systemActor = await getOrCreateSystemActor();
  let updated = 0;

  for (const task of candidates) {
    
    
    const result = await prisma.task.updateMany({
      where: { id: task.id, status: { notIn: ["DONE", "OVERDUE"] } },
      data: { status: "OVERDUE" },
    });
    if (result.count === 0) continue; 

    const activity = await activityRepository.create({
      taskId: task.id,
      projectId: task.projectId,
      userId: systemActor.id,
      previousStatus: task.status,
      newStatus: "OVERDUE",
    });

    try {
      emitTaskActivity(
        {
          id: activity.id,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          previousStatus: task.status,
          newStatus: "OVERDUE",
          changedBy: { id: systemActor.id, name: systemActor.name, role: systemActor.role },
          createdAt: activity.createdAt,
        },
        { assignedDeveloperId: task.assignedDeveloperId }
      );
    } catch {
      
    }

    updated++;
  }

  logger.info(`Overdue sweep: ${updated} task(s) marked OVERDUE`);
  return { updated };
}

export function scheduleOverdueJob() {
  
  cron.schedule("* * * * *", () => {
    runOverdueSweep().catch((err) => logger.error("Overdue sweep failed:", err));
  });
  logger.info("Overdue task cron job scheduled (every minute)");
}
