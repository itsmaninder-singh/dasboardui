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
