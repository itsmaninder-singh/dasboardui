import cron from "node-cron";
import { taskRepository } from "../repositories/task.repository";
import { activityRepository } from "../repositories/activity.repository";
import { emitTaskActivity } from "../socket/events";
import { prisma } from "../config/db";
import { logger } from "../utils/logger";

/**
 * Runs every minute. Finds tasks whose dueDate has passed and are not already
 * DONE/OVERDUE, flips them to OVERDUE, and writes one ActivityLog per task —
 * with `system` as the actor being the SYSTEM_USER_ID sentinel below.
 *
 * Idempotency: the query itself (`status: { notIn: ["DONE", "OVERDUE"] }`) means
 * a task that was already marked OVERDUE on a previous run is never picked up
 * again, so re-running the job (or overlapping runs) never creates duplicate
 * ActivityLog rows or duplicate notifications for the same transition.
 */

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
        isActive: false, // cannot be used to log in
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
    // Re-check + update inside a transaction-guarded single update so two overlapping
    // sweeps can't both flip + double-log the same task.
    const result = await prisma.task.updateMany({
      where: { id: task.id, status: { notIn: ["DONE", "OVERDUE"] } },
      data: { status: "OVERDUE" },
    });
    if (result.count === 0) continue; // already handled by a concurrent run

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
      // Socket.io may not be initialized yet (e.g. during tests) — the DB write already succeeded.
    }

    updated++;
  }

  logger.info(`Overdue sweep: ${updated} task(s) marked OVERDUE`);
  return { updated };
}

export function scheduleOverdueJob() {
  // Every minute. Adjust cadence as needed (e.g. "*/5 * * * *" for every 5 minutes).
  cron.schedule("* * * * *", () => {
    runOverdueSweep().catch((err) => logger.error("Overdue sweep failed:", err));
  });
  logger.info("Overdue task cron job scheduled (every minute)");
}
