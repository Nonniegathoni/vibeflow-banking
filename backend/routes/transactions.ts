import express, { type Request, type Response, type NextFunction } from "express"
import { authMiddleware } from "../middleware/auth"
import { createNotFoundError, createValidationError } from "../utils/error-handler"
import { isValidTransactionAmount } from "../utils/validation"
import db from "../config/database"

const router = express.Router()

// Protect all routes in this router
router.use(authMiddleware)

// Get all transactions for current user
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await db.query("SELECT COUNT(*) FROM transactions WHERE user_id = $1", [req.user.id])
    const total = Number.parseInt(countResult.rows[0].count)

    // Get transactions with pagination
    const result = await db.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset],
    )

    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      transactions: result.rows,
    })
  } catch (error) {
    next(error)
  }
})

// Get transaction by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const result = await db.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [id, req.user.id])

    if (result.rows.length === 0) {
      throw createNotFoundError("Transaction")
    }

    res.status(200).json({
      success: true,
      transaction: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
})

// Create a new transaction
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, amount, description, recipientId } = req.body

    // Validate input
    if (!type || !amount || !description) {
      throw createValidationError("Transaction type, amount, and description are required")
    }

    if (!isValidTransactionAmount(Number(amount))) {
      throw createValidationError("Amount must be between 1 and 1,000,000")
    }

    // Check if user has sufficient balance for withdrawals/transfers
    if (type === "withdrawal" || type === "transfer" || type === "payment" || type === "mpesa_withdrawal") {
      const userResult = await db.query("SELECT balance FROM users WHERE id = $1", [req.user.id])
      const userBalance = userResult.rows[0].balance

      if (userBalance < amount) {
        throw createValidationError("Insufficient balance")
      }
    }

    // Generate reference
    const reference = `VF${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Create transaction
    const result = await db.query(
      `INSERT INTO transactions 
       (user_id, recipient_id, type, amount, description, reference, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [req.user.id, recipientId || null, type, amount, description, reference, "completed"],
    )

    // Update user balance
    if (type === "deposit" || type === "mpesa_deposit") {
      await db.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [amount, req.user.id])
    } else if (type === "withdrawal" || type === "payment" || type === "mpesa_withdrawal") {
      await db.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, req.user.id])
    } else if (type === "transfer" && recipientId) {
      // Deduct from sender
      await db.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, req.user.id])

      // Add to recipient
      await db.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [amount, recipientId])
    }

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
})

// Report transaction as fraudulent
router.post("/:id/report", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      throw createValidationError("Reason for reporting is required")
    }

    // Check if transaction exists and belongs to user
    const txResult = await db.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [id, req.user.id])

    if (txResult.rows.length === 0) {
      throw createNotFoundError("Transaction")
    }

    // Mark transaction as reported
    await db.query("UPDATE transactions SET reported = true WHERE id = $1", [id])

    // Create fraud alert
    await db.query(
      `INSERT INTO fraud_alerts 
       (user_id, transaction_id, description, status, risk_score, created_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [req.user.id, id, reason, "new", 80],
    )

    res.status(200).json({
      success: true,
      message: "Transaction reported as fraudulent",
    })
  } catch (error) {
    next(error)
  }
})

export default router

