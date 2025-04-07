import { type Request, type Response, type NextFunction, Router } from "express"
import { auth } from "../middleware/auth";
import { pool } from "../config/database" // Updated import path

const router = Router()

// Get transactions for a user
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    // Get query parameters for filtering
    const { limit = 10, offset = 0, sort = "date", order = "desc" } = req.query

    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY ${sort} ${order}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )

    res.json({ transactions: result.rows })
  } catch (error) {
    next(error)
  }
})

export default router

