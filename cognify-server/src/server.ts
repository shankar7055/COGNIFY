import dotenv from "dotenv";

dotenv.config();

import * as Sentry from "@sentry/node";
import { env } from "./config/env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

import http from "http";
import { Server } from "socket.io";

import "./config/redis";
import "./queues/workers/ai.worker";
import "./queues/workers/workflow.worker";

import app from "./app";

import { logger } from "./config/logger";

import { registerChatSocket }
from "./sockets/chat.socket";

const PORT = env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {

  registerChatSocket(io, socket);

});

server.listen(PORT, () => {

  logger.info(
    `Server running on port ${PORT}`
  );

});