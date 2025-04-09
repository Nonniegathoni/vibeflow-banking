import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import sequelize from "../config/database"; // Import the Sequelize instance
import User from "../models/User"; // Import User model

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

// Authentication middleware
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from authorization header or cookie
    const token = 
      req.headers.authorization?.split(' ')[1] || // Bearer TOKEN format
      req.cookies?.sessionToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: number; email: string; role: string };

    // Find the user by id using Sequelize model
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach the user info to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};