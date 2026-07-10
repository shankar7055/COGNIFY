import { logger } from "../config/logger";
import { Request } from "express";

export function logRequest(req: Request, extra?: Record<string, unknown>) {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userId: (req as any).userId,
    ...extra,
  });
}

export function logError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const stack   = err instanceof Error ? err.stack : undefined;
  logger.error(`[${context}] ${message}`, { stack });
}
