/**
 * In-memory presence tracking. This is NOT a source of truth for any persisted
 * data (activity/notifications always come from Postgres) — it only tracks
 * which users currently have live sockets open, correctly handling multiple
 * tabs/devices per user (a user is "online" while at least one socket is open).
 */
const userSockets = new Map<string, Set<string>>();

export const presence = {
  addSocket(userId: string, socketId: string) {
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId)!.add(socketId);
  },
  removeSocket(userId: string, socketId: string) {
    const set = userSockets.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) userSockets.delete(userId);
  },
  isOnline(userId: string) {
    return userSockets.has(userId);
  },
  onlineUserCount() {
    return userSockets.size;
  },
  onlineUserIds() {
    return Array.from(userSockets.keys());
  },
};
