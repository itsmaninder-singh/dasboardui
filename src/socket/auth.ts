import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
    email: string;
  };
}

/**
 * Socket.io middleware: authenticates the connection using the same short-lived
 * access token used for REST calls, passed via the `auth` handshake payload
 * (`io(url, { auth: { token } })`). Connections without a valid token are rejected.
 */
export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers.authorization?.toString().replace("Bearer ", "") as
        | string
        | undefined);

    if (!token) {
      return next(new Error("AUTH_REQUIRED"));
    }

    const payload = verifyAccessToken(token);
    socket.data.userId = payload.sub;
    socket.data.role = payload.role;
    socket.data.email = payload.email;
    return next();
  } catch {
    return next(new Error("INVALID_TOKEN"));
  }
}
