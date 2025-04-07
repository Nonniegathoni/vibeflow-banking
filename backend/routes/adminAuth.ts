// backend/routes/adminAuth.ts

import { compare } from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Query the admin from database
    const { rows } = await pool.query(
      'SELECT * FROM administrators WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = rows[0];
    
    // Compare passwords
    const isMatch = await compare(password, admin.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};