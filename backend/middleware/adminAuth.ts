import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

declare module 'express' {
  interface Request {
    admin?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      throw new Error();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    if (decoded.role !== "admin") {
      throw new Error();
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Admin authentication failed" });
  }
};

export default adminAuth;