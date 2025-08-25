import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.status || 500;
  const isDev = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    message: err.message || "Server Error",
    ...(isDev && { stack: err.stack }), // Include stack only in dev
  });
};
