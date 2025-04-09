import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../backend/models/User';

export async function GET(req: NextRequest) {
  try {
    // Get token from cookies or authorization header
    const token = req.cookies.get('sessionToken')?.value || 
                 req.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: number; email: string };
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'name', 'role', 'account_number', 'phone_number', 'balance', 'createdAt']
    });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth/me error:', error);
    return NextResponse.json({ message: 'Authentication error' }, { status: 401 });
  }
}