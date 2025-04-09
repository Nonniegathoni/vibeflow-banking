import { type Request, type Response, type NextFunction, Router } from "express";
import { auth } from "../middleware/auth";
import User from "../models/User"; // Import the User model

const router = Router();

// Get user profile
router.get("/profile", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Now TypeScript knows that req.user exists because of our type declaration
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Use Sequelize model to find the user
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'phone_number', 'role', 'account_number', 'balance', 'createdAt']
      // Exclude password and other sensitive fields
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Get all users (admin only)
router.get("/", auth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Use Sequelize model to find all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'phone_number', 'role', 'account_number', 'balance', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

export default router;