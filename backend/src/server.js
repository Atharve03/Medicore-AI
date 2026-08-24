const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

console.log("Using DNS:", dns.getServers());

const fs = require("fs");
const path = require("path");

const env = require("./config/env");
const logger = require("./config/logger");
const { connectDB, disconnectDB } = require("./config/db");
const redisClient = require("./config/redis");
const app = require("./app");

// Ensure runtime directories exist before anything tries to write to them.
for (const dir of ["logs", env.uploads.dir]) {
  const resolved = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
}

let server;

async function start() {
  try {
    await connectDB();
    logger.info("MongoDB connection established.");

    server = app.listen(env.port, () => {
      logger.info(
        `MediCore AI backend running in ${env.nodeEnv} mode on port ${env.port}`,
      );
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);

  const closeHttp = new Promise((resolve) => {
    if (!server) return resolve();
    server.close(resolve);
  });

  await closeHttp;
  await disconnectDB();
  await redisClient.quit().catch(() => {});

  logger.info("Shutdown complete.");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

start();
