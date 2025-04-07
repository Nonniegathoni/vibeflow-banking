import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as {
      id: number;
      email: string;
      role: string;
    };

    // Get user from token
    const result = await pool.query("SELECT id, email, first_name, last_name, role FROM users WHERE id = $1", [
      decoded.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = result.rows[0];

    // Add user to request
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
