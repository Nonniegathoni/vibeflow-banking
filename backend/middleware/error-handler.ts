import { Request, Response, NextFunction } from 'express';

// Error types
export enum ERROR_TYPES {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER_ERROR",
  NETWORK = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export interface CustomError extends Error {
  statusCode?: number;
  type?: string;
  details?: any;
}

// Create custom error
export const createError = (
  message: string, 
  statusCode: number = 500, 
  type: ERROR_TYPES = ERROR_TYPES.UNKNOWN, 
  details: any = null
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.type = type;
  error.details = details;
  return error;
}

// Helper functions to create specific error types
export const createValidationError = (message: string, details?: any): CustomError => {
  return createError(message, 400, ERROR_TYPES.VALIDATION, details);
}

export const createAuthenticationError = (message: string = "Authentication required"): CustomError => {
  return createError(message, 401, ERROR_TYPES.AUTHENTICATION);
}

export const createAuthorizationError = (message: string = "You do not have permission to perform this action"): CustomError => {
  return createError(message, 403, ERROR_TYPES.AUTHORIZATION);
}

export const createNotFoundError = (resource: string): CustomError => {
  return createError(`${resource} not found`, 404, ERROR_TYPES.NOT_FOUND);
}

export const createServerError = (message: string = "Internal server error", details?: any): CustomError => {
  return createError(message, 500, ERROR_TYPES.SERVER, details);
}

// Error handling middleware
export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.error("Error:", err);

  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const type = err.type || ERROR_TYPES.UNKNOWN;
  const details = err.details || null;

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    type,
    details,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}