import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendPaginated = (
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  limit: number
) => {
  res.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};
