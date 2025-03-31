import express, { Request, Response, NextFunction } from "express";
import { adminMiddleware } from "../middleware/auth";
import db from "../config/database";
import { createNotFoundError } from "../middleware/error-handler";

const router = express.Router();

// All routes in this file require admin privileges
router.use(adminMiddleware);

// Get dashboard statistics
router.get("/dashboard", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total users
    const usersResult = await db.query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(usersResult.rows[0].count);
    
    // Get active users (logged in within the last 7 days)
    const activeUsersResult = await db.query(
      "SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL '7 days'"
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);
    
    // Get total transactions
    const txResult = await db.query("SELECT COUNT(*) FROM transactions");
    const totalTransactions = parseInt(txResult.rows[0].count);
    
    // Get flagged transactions
    const flaggedTxResult = await db.query(
      "SELECT COUNT(*) FROM transactions WHERE status = 'flagged' OR reported = true"
    );
    const fraudulentTransactions = parseInt(flaggedTxResult.rows[0].count);
    
    // Get average risk score
    const riskScoreResult = await db.query(
      "SELECT AVG(risk_score) FROM transactions WHERE risk_score IS NOT NULL"
    );
    const averageRiskScore = Math.round(parseFloat(riskScoreResult.rows[0].avg) || 0);
    
    // Get transaction volume
    const volumeResult = await db.query("SELECT SUM(amount) FROM transactions");
    const transactionVolume = parseFloat(volumeResult.rows[0].sum) || 0;

    const stats = {
      totalUsers,
      activeUsers,
      totalTransactions,
      fraudulentTransactions,
      averageRiskScore,
      transactionVolume
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      throw createNotFoundError("User");
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = result.rows[0];
    
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
});

// Get all users with pagination
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await db.query("SELECT COUNT(*) FROM users");
    const total = parseInt(countResult.rows[0].count);
    
    // Get users with pagination
    const result = await db.query(
      "SELECT id, name, email, role, account_number, balance, phone_number, created_at, last_login FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Admin login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, pin } = req.body;
    
    // In a real app, you would validate admin credentials
    // For demo purposes, let's use a mock admin
    if (email !== "admin@vibeflow.com" || password !== "Admin123!" || pin !== "1234") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        id: "admin-123",
        name: "Admin User",
        email: "admin@vibeflow.com",
        role: "admin"
      },
      token: "mock-admin-jwt-token"
    });
  } catch (error) {
    next(error);
  }
});

export default router;