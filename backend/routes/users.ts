import { type Request, type Response, type NextFunction, Router } from "express"
import { auth } from "../middleware/auth"
import { pool } from "../config/database" // Updated import path

const router = Router()

// Get user profile
router.get("/profile", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Now TypeScript knows that req.user exists because of our type declaration
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const result = await pool.query(
      "SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1",
      [userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

// Get all users (admin only)
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const result = await pool.query(
      "SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC",
    )

    res.json({ users: result.rows })
  } catch (error) {
    next(error)
  }
})

export default router

