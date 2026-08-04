import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { migrateWorkspaces } from "./utils/migrateWorkspaces.js";

async function start() {
  await connectDB();
  await migrateWorkspaces();
  app.listen(env.port, () => {
    console.log(`Harjeeo API running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
