// lib/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db'; // Import query directly

// Define the JWT payload type
interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    // Cast the decoded token to our custom JwtPayload type
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    
    // Fetch user from database
    const user = await query(
      'SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (user.rows.length === 0) {
      return null;
    }
    
    return {
      user: user.rows[0]
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function signOut() {
  'use server';
  
  cookies().delete('token');
  redirect('/login');
}