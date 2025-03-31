import express, { type Request, type Response, type NextFunction } from "express"
import { authMiddleware, adminMiddleware } from "../middleware/auth"
import { createNotFoundError } from "../middleware/error-handler"
import { isValidKenyanPhone } from "../utils/validation"
import db from "../config/database"

const router = express.Router()

// Protect all routes in this router
router.use(authMiddleware)

// Get current user profile
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User is already attached to req by authMiddleware
    res.status(200).json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    next(error)
  }
})

// Update user profile
router.put("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phoneNumber } = req.body
    const updates: Record<string, any> = {}

    if (name) updates.name = name

    if (phoneNumber) {
      if (!isValidKenyanPhone(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        })
      }
      updates.phone_number = phoneNumber
    }

    // Build the query dynamically
    const keys = Object.keys(updates)
    if (keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates provided",
      })
    }

    // Create SET clause and values array
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
    const values = Object.values(updates)
    values.push(req.user.id)

    const result = await db.query(`UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`, values)

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
})

// Get user by ID (admin only)
router.get("/:id", adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const result = await db.query("SELECT * FROM users WHERE id = $1", [id])

    if (result.rows.length === 0) {
      throw createNotFoundError("User")
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = result.rows[0]

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
})

export default router
