import type { Request, Response, NextFunction } from "express"

interface AppError extends Error {
  statusCode?: number
  type?: string
  details?: any
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err)

  // Default error values
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal Server Error"
  let type = err.type || "SERVER_ERROR"
  let details = err.details || null

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400
    type = "VALIDATION_ERROR"
    details = (err as any).errors ? Object.values((err as any).errors).map((val: any) => val.message) : null
  }

  // Handle Mongoose duplicate key errors
  if (err.name === "MongoError" && (err as any).code === 11000) {
    statusCode = 400
    type = "VALIDATION_ERROR"
    message = "Duplicate field value entered"
    details = (err as any).keyValue
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401
    type = "AUTHENTICATION_ERROR"
    message = "Invalid token"
  }

  // Handle JWT expiration
  if (err.name === "TokenExpiredError") {
    statusCode = 401
    type = "AUTHENTICATION_ERROR"
    message = "Token expired"
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    type,
    details,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}

