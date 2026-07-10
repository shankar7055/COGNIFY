import { Server, Socket } from "socket.io";
import { autonomousAgent } from "../services/ai/agents/autonomous.agent";
import { streamService } from "../services/ai/stream.service";
import { memoryService } from "../services/ai/memory.service";
import { usageService } from "../services/analytics/usage.service";
import { estimateTokens } from "../utils/cost";
import { logger } from "../config/logger";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

function getUserIdFromSocket(socket: Socket): string | null {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export const registerChatSocket = (io: Server, socket: Socket) => {
  const userId = getUserIdFromSocket(socket);

  logger.info(`Socket connected: ${socket.id} | user: ${userId ?? "anon"}`);

  // ── Join workspace room ──────────────────────────────────────────────────
  socket.on("join-workspace", (workspaceId: string) => {
    socket.join(workspaceId);
    logger.info(`Socket ${socket.id} joined workspace ${workspaceId}`);
    socket.emit("joined", { workspaceId });
  });

  // ── Send chat message (non-streaming, broadcasts to room) ────────────────
  socket.on(
    "send-message",
    (data: { workspaceId: string; message: string; user: string }) => {
      io.to(data.workspaceId).emit("receive-message", {
        message:    data.message,
        user:       data.user,
        created_at: new Date(),
      });
    }
  );

  // ── AI chat with streaming response ─────────────────────────────────────
  socket.on(
    "ai-message",
    async (data: { message: string; workspaceId?: string; agentType?: string }) => {
      if (!userId) {
        socket.emit("ai:error", { message: "Authentication required" });
        return;
      }

      const { message, workspaceId } = data;
      const start = Date.now();

      socket.emit("ai:start", { message });

      try {
        // Build context prompt with workspace memory
        let prompt = message;
        if (workspaceId) {
          const memories = await memoryService.getWorkspaceMemories(workspaceId);
          if (memories.length) {
            const ctx = memories
              .slice(0, 3)
              .map((m) => `- ${m.content}`)
              .join("\n");
            prompt = `Workspace context:\n${ctx}\n\nUser: ${message}`;
          }
        }

        // Stream response back to this socket
        const fullResponse = await streamService.streamToSocket(
          prompt,
          (event, data) => socket.emit(event, data)
        );

        const latency = Date.now() - start;

        // Log usage
        await usageService.logAIRequest({
          prompt:      message,
          response:    fullResponse,
          model:       "llama-3.3-70b-versatile",
          latency_ms:  latency,
          tokens_used: estimateTokens(message + fullResponse),
          user_id:     userId,
          workspace_id: workspaceId,
          agent_type:  "stream",
        });

        // Store user message in memory
        if (workspaceId) {
          await memoryService.storeMemory(workspaceId, message);
        }
      } catch (err: any) {
        logger.error("Socket AI error", { err });
        socket.emit("ai:error", { message: err.message });
      }
    }
  );

  // ── Agent run (non-streaming, full agent routing) ────────────────────────
  socket.on(
    "agent-message",
    async (data: { message: string; workspaceId?: string }) => {
      if (!userId) {
        socket.emit("agent:error", { message: "Authentication required" });
        return;
      }

      socket.emit("agent:thinking", { message: data.message });

      try {
        const result = await autonomousAgent.run(
          data.message,
          userId,
          data.workspaceId
        );

        socket.emit("agent:response", {
          response:   result.response,
          steps:      result.steps,
          agent_type: result.agentType,
        });
      } catch (err: any) {
        socket.emit("agent:error", { message: err.message });
      }
    }
  );

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
};