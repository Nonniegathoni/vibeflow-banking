import { type Request, type Response, type NextFunction, Router } from "express";
import { auth } from "../middleware/auth";
import { authorize } from "../middleware/auth"; // Import the authorize middleware if used
import sequelize from "../config/database";
import { QueryTypes, Op } from "sequelize"; // Import Op separately
import User from "../models/User";
import Transaction from "../models/Transaction"; // Assuming you have this model

const router = Router();

// Dashboard statistics
router.get("/dashboard", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get total users using Sequelize count method
    const totalUsers = await User.count();

    // Get active users (logged in within the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await User.count({
      where: {
        last_login: {
          [Op.gte]: sevenDaysAgo // Use Op instead of sequelize.Op
        }
      }
    });

    // Get total transactions using raw query with Sequelize
    const [transactionsResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM transactions",
      { type: QueryTypes.SELECT }
    );
    
    // Use type assertion to help TypeScript understand the structure
    const totalTransactions = parseInt((transactionsResult as any).count);

    // Get total transaction volume
    const [volumeResult] = await sequelize.query(
      "SELECT SUM(amount) as total FROM transactions",
      { type: QueryTypes.SELECT }
    );
    
    const transactionVolume = parseFloat((volumeResult as any).total) || 0;

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'name', 'email'] 
        },
        { 
          model: User, 
          as: 'recipient',
          attributes: ['id', 'name', 'email'] 
        }
      ]
    });

    res.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      transactionVolume,
      recentTransactions
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    next(error);
  }
});

// Rest of your router code...

export default router;