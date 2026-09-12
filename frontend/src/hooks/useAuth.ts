import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { queryClient } from "../lib/queryClient";
import { disconnectSocket } from "../lib/socket";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { AuthSuccessResponse, LoginInput, RegisterInput } from "../types/auth";
import { useUiStore } from "../store/uiStore";

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);

  const login = async (credentials: LoginInput) => {
    try {
      const res = await api.post<ApiResponse<AuthSuccessResponse>>("/auth/login", credentials);
      const { user: authedUser, accessToken: token } = res.data.data;
      setAuth(authedUser, token);
      addToast({
        type: "success",
        title: "Welcome to Kinetic",
        description: `Logged in as ${authedUser.name} (${authedUser.role})`,
      });
      navigate("/");
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Invalid email or password";
      addToast({
        type: "error",
        title: "Authentication Failed",
        description: message,
      });
      return { success: false, error: message };
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const res = await api.post<ApiResponse<AuthSuccessResponse>>("/auth/register", data);
      const { user: newUser, accessToken: token } = res.data.data;
      setAuth(newUser, token);
      addToast({
        type: "success",
        title: "Account Created",
        description: `Welcome, ${newUser.name}!`,
      });
      navigate("/");
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Registration failed";
      addToast({
        type: "error",
        title: "Registration Failed",
        description: message,
      });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      
    } finally {
      disconnectSocket();
      clearAuth();
      queryClient.clear();
      addToast({
        type: "info",
        title: "Session Terminated",
        description: "You have been logged out securely.",
      });
      navigate("/login");
    }
  };

  const checkAuthSilent = async () => {
    try {
      setLoading(true);
      const res = await api.post<ApiResponse<AuthSuccessResponse>>("/auth/refresh");
      if (res.data?.data) {
        setAuth(res.data.data.user, res.data.data.accessToken);
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthSilent,
  };
}
