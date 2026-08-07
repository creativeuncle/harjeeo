const socketCountByUser = new Map();

export function addConnection(userId) {
  const key = String(userId);
  const count = socketCountByUser.get(key) ?? 0;
  socketCountByUser.set(key, count + 1);
  return count === 0; // true if this is the user's first open socket
}

export function removeConnection(userId) {
  const key = String(userId);
  const count = socketCountByUser.get(key) ?? 0;
  if (count <= 1) {
    socketCountByUser.delete(key);
    return true; // true if this was the user's last open socket
  }
  socketCountByUser.set(key, count - 1);
  return false;
}

export function isOnline(userId) {
  return socketCountByUser.has(String(userId));
}

export function getOnlineUserIds() {
  return Array.from(socketCountByUser.keys());
}
