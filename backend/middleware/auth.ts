import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { createError } from "../utils/error-handler"
import db from "../config/database"

interface DecodedToken {
  id: string
  email: string
  role: string
  [key: string]: any
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError("Authentication required", 401))
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return next(createError("Authentication required", 401))
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here") as DecodedToken

    // Find user in database
    const result = await db.query("SELECT id, name, email, role, account_number, balance FROM users WHERE id = $1", [
      decoded.id,
    ])

    if (result.rows.length === 0) {
      return next(createError("User not found", 401))
    }

    // Attach user to request
    req.user = result.rows[0]
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError("Invalid token", 401))
    }
    next(error)
  }
}

// Admin only middleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    next(createError("Admin access required", 403))
  }
}

