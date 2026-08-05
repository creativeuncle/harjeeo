import { io } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const token = useAuthStore.getState().accessToken;
  socket = io({ auth: { token }, autoConnect: true });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
