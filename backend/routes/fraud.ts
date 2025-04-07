import express, { type Request, type Response, type NextFunction } from "express"
import { auth } from "../middleware/auth"
import adminAuth from "../middleware/adminAuth"
import { createNotFoundError } from "../middleware/error-handler"
import db from "../config/database"

const router = express.Router()

// Get fraud alerts for current user
router.get("/alerts", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(
      `SELECT fa.*, t.type as transaction_type, t.amount as transaction_amount 
       FROM fraud_alerts fa
       JOIN transactions t ON fa.transaction_id = t.id
       WHERE fa.user_id = $1
       ORDER BY fa.created_at DESC`,
      [req.user!.id],
    )

    res.status(200).json({
      success: true,
      count: result.rows.length,
      alerts: result.rows,
    })
  } catch (error) {
    next(error)
  }
})

// Get fraud alert by ID
router.get("/alerts/:id", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const result = await db.query(
      `SELECT fa.*, t.type as transaction_type, t.amount as transaction_amount 
       FROM fraud_alerts fa
       JOIN transactions t ON fa.transaction_id = t.id
       WHERE fa.id = $1 AND fa.user_id = $2`,
      [id, req.user!.id],
    )

    if (result.rows.length === 0) {
      throw createNotFoundError("Fraud alert")
    }

    res.status(200).json({
      success: true,
      alert: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
})

// Admin routes for fraud management
router.get("/admin/alerts", adminAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const status = req.query.status as string

    let query = `
      SELECT fa.*, 
             u.name as user_name, u.email as user_email, 
             t.type as transaction_type, t.amount as transaction_amount
      FROM fraud_alerts fa
      JOIN users u ON fa.user_id = u.id
      JOIN transactions t ON fa.transaction_id = t.id
    `

    const queryParams: any[] = []

    if (status) {
      query += " WHERE fa.status = $1"
      queryParams.push(status)
    }

    // Count total
    const countQuery = `SELECT COUNT(*) FROM fraud_alerts${status ? " WHERE status = $1" : ""}`
    const countResult = await db.query(countQuery, status ? [status] : [])
    const total = Number.parseInt(countResult.rows[0].count)

    // Get paginated results
    query += " ORDER BY fa.created_at DESC LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2)
    queryParams.push(limit, offset)

    const result = await db.query(query, queryParams)

    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      alerts: result.rows,
    })
  } catch (error) {
    next(error)
  }
})

// Update fraud alert status (admin only)
router.put("/admin/alerts/:id", adminAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { status, resolution } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      })
    }

    const result = await db.query(
      `UPDATE fraud_alerts 
       SET status = $1, resolution = $2, resolved_by = $3, resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
       WHERE id = $4
       RETURNING *`,
      [status, resolution || null, req.user!.id, id],
    )

    if (result.rows.length === 0) {
      throw createNotFoundError("Fraud alert")
    }

    res.status(200).json({
      success: true,
      message: "Fraud alert updated successfully",
      alert: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
})

export default router
