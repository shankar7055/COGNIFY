import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { logger } from "../config/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}: ${err.message}`, {
    stack: err.stack,
  });

  // Capture exception in Sentry
  Sentry.captureException(err);

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: (err as any).errors,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // Prisma unique constraint
  if ((err as any).code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
    });
  }

  // Prisma not found
  if ((err as any).code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
