import express, { type Request, type Response, type NextFunction } from "express";
import { auth } from "../middleware/auth";
import adminAuth from "../middleware/adminAuth";
import { createNotFoundError } from "../middleware/error-handler";
import db from "../config/database"; // Assuming 'db' is the exported Sequelize instance
import { QueryTypes } from 'sequelize'; // Import QueryTypes

const router = express.Router();

// Define expected types for results (replace 'any' with actual interfaces if available)
type FraudAlert = any;
type CountResult = { count: string | number };

// Get fraud alerts for current user
router.get("/alerts", auth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      // Should ideally be caught by 'auth' middleware, but good to double-check
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const results = await db.query<FraudAlert[]>(
      `SELECT fa.*, t.type as transaction_type, t.amount as transaction_amount
       FROM fraud_alerts fa
       JOIN transactions t ON fa.transaction_id = t.id
       WHERE fa.user_id = $1
       ORDER BY fa.created_at DESC`,
      {
        replacements: [req.user.id],
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json({
      success: true,
      count: results.length, // Use length of the result array
      alerts: results,        // Result is the array directly
    });
  } catch (error) {
    console.error("Error fetching user fraud alerts:", error);
    next(error);
  }
});

// Get fraud alert by ID
router.get("/alerts/:id", auth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const results = await db.query<FraudAlert[]>(
      `SELECT fa.*, t.type as transaction_type, t.amount as transaction_amount
       FROM fraud_alerts fa
       JOIN transactions t ON fa.transaction_id = t.id
       WHERE fa.id = $1 AND fa.user_id = $2`,
      {
        replacements: [id, req.user.id],
        type: QueryTypes.SELECT
      }
    );

    if (results.length === 0) {
      // Use return after sending response or calling next
      return next(createNotFoundError("Fraud alert"));
    }

    res.status(200).json({
      success: true,
      alert: results[0], // Get the first element from the result array
    });
  } catch (error) {
    console.error("Error fetching fraud alert by ID:", error);
    next(error);
  }
});

// Admin routes for fraud management
router.get("/admin/alerts", adminAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number.parseInt(req.query.page as string || '1', 10) || 1;
    const limit = Number.parseInt(req.query.limit as string || '10', 10) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    let baseQuery = `
      FROM fraud_alerts fa
      JOIN users u ON fa.user_id = u.id
      JOIN transactions t ON fa.transaction_id = t.id
    `;
    const replacements: any[] = [];
    let whereClause = "";

    if (status) {
      whereClause = " WHERE fa.status = $1";
      replacements.push(status);
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as count ${baseQuery} ${whereClause}`;
    const [countResult] = await db.query<CountResult>(countQuery, {
       replacements: replacements, // Use same replacements for count
       type: QueryTypes.SELECT
      });
    const total = Number.parseInt(String(countResult?.count ?? 0));

    // Build SELECT query
    let selectQuery = `
      SELECT fa.*,
             u.name as user_name, u.email as user_email,
             t.type as transaction_type, t.amount as transaction_amount
      ${baseQuery}
      ${whereClause}
      ORDER BY fa.created_at DESC
      LIMIT $${replacements.length + 1} OFFSET $${replacements.length + 2}
    `;
    const queryParams = [...replacements, limit, offset]; // Add limit and offset to params

    const results = await db.query<FraudAlert[]>(selectQuery, {
        replacements: queryParams,
        type: QueryTypes.SELECT
      });

    res.status(200).json({
      success: true,
      count: results.length, // Length of current page results
      total,                // Total count from count query
      page,
      pages: Math.ceil(total / limit),
      alerts: results,        // Paginated results array
    });
  } catch (error) {
    console.error("Error fetching admin fraud alerts:", error);
    next(error);
  }
});

// Update fraud alert status (admin only)
router.put("/admin/alerts/:id", adminAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    if (!req.user?.id) {
       
        res.status(401).json({ success: false, message: "Admin user not authenticated" });
        return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const results = await db.query<FraudAlert[]>(
      `UPDATE fraud_alerts
       SET status = $1, resolution = $2, resolved_by = $3, resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
       WHERE id = $4
       RETURNING *`,
      {
        replacements: [status, resolution || null, req.user.id, id],
        type: QueryTypes.SELECT // Using SELECT because RETURNING * returns rows
      }
    );

    if (results.length === 0) {
       return next(createNotFoundError("Fraud alert"));
    }

    res.status(200).json({
      success: true,
      message: "Fraud alert updated successfully",
      alert: results[0], // Get the first (and only expected) returned row
    });
  } catch (error) {
    console.error("Error updating fraud alert:", error);
    next(error);
  }
});

export default router;