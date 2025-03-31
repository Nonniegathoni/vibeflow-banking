// Define error types for better categorization
export enum ErrorType {
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  NETWORK = "NETWORK",
  UNKNOWN = "UNKNOWN",
}

// Custom error class with additional properties
export class AppError extends Error {
  type: ErrorType
  statusCode?: number
  details?: any

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, statusCode?: number, details?: any) {
    super(message)
    this.name = "AppError"
    this.type = type
    this.statusCode = statusCode
    this.details = details

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Helper functions to create specific error types
export const createValidationError = (message: string, details?: any) => {
  return new AppError(message, ErrorType.VALIDATION, 400, details)
}

export const createAuthenticationError = (message = "Authentication required") => {
  return new AppError(message, ErrorType.AUTHENTICATION, 401)
}

export const createAuthorizationError = (message = "You do not have permission to perform this action") => {
  return new AppError(message, ErrorType.AUTHORIZATION, 403)
}

export const createNotFoundError = (resource: string) => {
  return new AppError(`${resource} not found`, ErrorType.NOT_FOUND, 404)
}

export const createServerError = (message = "Internal server error", details?: any) => {
  return new AppError(message, ErrorType.SERVER, 500, details)
}

// Function to handle client-side errors with toast notifications
export const handleClientError = (error: unknown, toast: any) => {
  console.error("Client Error:", error)

  let title = "Error"
  let description = "An unexpected error occurred"

  if (error instanceof AppError) {
    switch (error.type) {
      case ErrorType.VALIDATION:
        title = "Validation Error"
        break
      case ErrorType.AUTHENTICATION:
        title = "Authentication Error"
        break
      case ErrorType.AUTHORIZATION:
        title = "Authorization Error"
        break
      case ErrorType.NOT_FOUND:
        title = "Not Found"
        break
      case ErrorType.NETWORK:
        title = "Network Error"
        break
      default:
        title = "Error"
    }
    description = error.message
  } else if (error instanceof Error) {
    description = error.message
  }

  toast({
    title,
    description,
    variant: "destructive",
    duration: 5000,
  })

  return { title, description }
}

// Function to parse API response errors
export const parseApiError = async (response: Response) => {
  try {
    const data = await response.json()
    return new AppError(
      data.message || "API request failed",
      data.type || ErrorType.UNKNOWN,
      response.status,
      data.details,
    )
  } catch (e) {
    return new AppError("Failed to parse API error response", ErrorType.UNKNOWN, response.status)
  }
}

