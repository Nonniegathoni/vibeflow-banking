import { compare } from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// Interface reflecting the exact columns selected from the 'users' table
interface AdminUserQueryResult {
  id: number; // Or appropriate type
  email: string;
  password?: string | null; // Match SELECT list; make optional/nullable if DB allows null
  role: string;     // Match SELECT list
}

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    const results = await sequelize.query<AdminUserQueryResult[]>(
      // Ensure SELECT list ("password") matches interface property name
      'SELECT id, email, "password", role FROM users WHERE email = $1 LIMIT 1',
      {
        replacements: [email],
        type: QueryTypes.SELECT
      }
    );

    if (results.length === 0) {
       res.status(401).json({ message: 'Invalid credentials - user not found' });
       return;
    }

    // Explicit Type Assertion: Tell TS that results[0] is a single object
    const adminUser = results[0] as AdminUserQueryResult;

    // Now perform checks on the typed 'adminUser' object
    if (adminUser.role !== 'admin') {
        res.status(403).json({ message: 'Access denied: User is not an administrator' });
        return;
    }

    // Check if password hash exists (important if password column can be null)
    if (!adminUser.password) {
        console.error(`Admin user ${email} found but missing password hash in result object.`);
        // Status 500 suggests a server/data setup issue rather than bad user input
        res.status(500).json({ message: 'Authentication configuration error.' });
        return;
    }

    // Compare password with the hash from the object
    const isMatch = await compare(password, adminUser.password);

    if (!isMatch) {
       res.status(401).json({ message: 'Invalid credentials - password mismatch' });
       return;
    }

    res.status(200).json({ message: 'Admin credential check successful (implement token/session)' });

  } catch (error) {
    console.error('Admin login error:', error);
    next(error || new Error('Server error during admin authentication'));
  }
};