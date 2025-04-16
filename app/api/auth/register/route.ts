import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !email || !password) {
        return NextResponse.json({ message: 'Missing required fields (firstName, email, password)' }, { status: 400 });
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
      }),
      cache: 'no-store',
    });

    const bodyText = await backendResponse.text();

    if (!backendResponse.ok) {
      console.error(`Backend registration error: ${backendResponse.status}`, bodyText);
      let errorJson = { message: 'Registration failed on backend.' };
      try {
        errorJson = JSON.parse(bodyText);
      } catch (e) { /* Ignore parsing error */ }
      return NextResponse.json(errorJson, { status: backendResponse.status });
    }

    try {
        const registrationResult = JSON.parse(bodyText);
        return NextResponse.json(registrationResult, { status: backendResponse.status });
    } catch (e) {
        console.error("Error parsing backend JSON response for registration:", e, bodyText);
        return NextResponse.json({ message: 'Invalid response from backend.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error forwarding registration request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error processing registration.' },
      { status: 500 }
    );
  }
}