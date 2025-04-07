import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    const hashedPassword = await hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, first_name, email`,
      [firstName, lastName || null, email, hashedPassword]
    );

    return NextResponse.json(rows[0], { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}