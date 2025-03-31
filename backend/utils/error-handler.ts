// Error types
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER_ERROR",
  NETWORK = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

// Create custom error class
export class AppError extends Error {
  statusCode: number;
  type: ErrorType;
  details: any;

  constructor(message: string, statusCode = 500, type = ErrorType.UNKNOWN, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Helper functions to create specific error types
export const createError = (message: string, statusCode = 500, type = ErrorType.UNKNOWN, details = null): AppError => {
  return new AppError(message, statusCode, type, details);
};

export const createValidationError = (message: string, details?: any): AppError => {
  return new AppError(message, 400, ErrorType.VALIDATION, details);
};

export const createAuthenticationError = (message = "Authentication required"): AppError => {
  return new AppError(message, 401, ErrorType.AUTHENTICATION);
};

export const createAuthorizationError = (message = "You do not have permission to perform this action"): AppError => {
  return new AppError(message, 403, ErrorType.AUTHORIZATION);
};

export const createNotFoundError = (resource: string): AppError => {
  return new AppError(`${resource} not found`, 404, ErrorType.NOT_FOUND);
};

export const createServerError = (message = "Internal server error", details?: any): AppError => {
  return new AppError(message, 500, ErrorType.SERVER, details);
};

// Function to handle errors in API routes
export const handleApiError = (error: unknown) => {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      type: error.type,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  // Handle unexpected errors
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return {
    success: false,
    message,
    type: ErrorType.UNKNOWN,
    statusCode: 500,
  };
};