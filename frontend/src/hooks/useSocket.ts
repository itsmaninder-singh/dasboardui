import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { initSocket, disconnectSocket } from "../lib/socket";

export function useSocketSetup() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      initSocket(accessToken);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken]);
}
