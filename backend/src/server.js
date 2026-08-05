import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { verifyAccessToken } from "./utils/tokens.js";
import Channel from "./models/Channel.js";
import { setIO } from "./socket.js";
import { migrateWorkspaces, migrateLegacyProjectLeads } from "./utils/migrateWorkspaces.js";
import { scheduleDueDateReminders } from "./utils/dueDateReminders.js";

async function start() {
  await connectDB();
  await migrateWorkspaces();
  await migrateLegacyProjectLeads();
  scheduleDueDateReminders();

  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const payload = verifyAccessToken(socket.handshake.auth?.token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Not authorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join_channel", async (channelId) => {
      const channel = await Channel.findById(channelId).select("members");
      if (channel && channel.members.some((m) => String(m) === String(socket.userId))) {
        socket.join(String(channelId));
      }
    });

    socket.on("leave_channel", (channelId) => {
      socket.leave(String(channelId));
    });
  });

  setIO(io);

  server.listen(env.port, () => {
    console.log(`Harjeeo API running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
