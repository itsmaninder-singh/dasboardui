export const rooms = {
  adminGlobal: () => "admin:global",
  project: (projectId: string) => `project:${projectId}`,
  user: (userId: string) => `user:${userId}`,
};
