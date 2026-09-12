import { create } from "zustand";
import { ActivityLog } from "../types/activity";

interface SocketState {
  isConnected: boolean;
  onlineCount: number;
  unreadCount: number;
  recentActivities: ActivityLog[];
  setIsConnected: (connected: boolean) => void;
  setOnlineCount: (count: number) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  addActivity: (activity: ActivityLog) => void;
  setRecentActivities: (activities: ActivityLog[]) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  onlineCount: 1,
  unreadCount: 0,
  recentActivities: [],
  setIsConnected: (isConnected) => set({ isConnected }),
  setOnlineCount: (onlineCount) => set({ onlineCount }),
  setUnreadCount: (unreadCount) => set({ unreadCount: Math.max(0, unreadCount) }),
  incrementUnreadCount: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnreadCount: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  addActivity: (activity) =>
    set((s) => {
      
      const filtered = s.recentActivities.filter((a) => a.id !== activity.id);
      return { recentActivities: [activity, ...filtered].slice(0, 30) };
    }),
  setRecentActivities: (recentActivities) => set({ recentActivities }),
}));
