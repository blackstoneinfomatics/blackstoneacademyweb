
// utils/socket.ts
import { environment } from "@/config/environment";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let subscribedUserId: string | null = null;

const SOCKET_URL = environment.baseURL;

export const getSocket = (userId: string): Socket => {
  if (!userId) {
    throw new Error("userId is required to initialize socket");
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);

      // Subscribe after every connection/reconnection.
      if (subscribedUserId) {
        socket?.emit("subscribe", subscribedUserId);
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }

  // Track the current user associated with this socket.
  if (subscribedUserId !== userId) {
    subscribedUserId = userId;

    if (socket.connected) {
      socket.emit("subscribe", userId);
    }
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    subscribedUserId = null;
  }
};
