import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { usePresenceStore } from "@/store/presenceStore";

export default function PresenceProvider({ children }) {
  const setOnlineIds = usePresenceStore((s) => s.setOnlineIds);
  const markOnline = usePresenceStore((s) => s.markOnline);
  const markOffline = usePresenceStore((s) => s.markOffline);
  const setStatus = usePresenceStore((s) => s.setStatus);

  useEffect(() => {
    const socket = getSocket();

    function handleList({ userIds }) {
      setOnlineIds(userIds);
    }
    function handleOnline({ userId }) {
      markOnline(userId);
    }
    function handleOffline({ userId }) {
      markOffline(userId);
    }
    function handleStatus({ userId, manualStatus, statusMessage }) {
      setStatus(userId, manualStatus, statusMessage);
    }

    socket.on("presence:list", handleList);
    socket.on("presence:online", handleOnline);
    socket.on("presence:offline", handleOffline);
    socket.on("presence:status", handleStatus);

    return () => {
      socket.off("presence:list", handleList);
      socket.off("presence:online", handleOnline);
      socket.off("presence:offline", handleOffline);
      socket.off("presence:status", handleStatus);
    };
  }, [setOnlineIds, markOnline, markOffline, setStatus]);

  return children;
}
