import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies helper for App Router

// Base URL for your backend API
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  // Get token from HttpOnly cookie using next/headers helper
  const token = cookies().get('sessionToken')?.value; // Adjust cookie name if different

  // Fallback: Check Authorization header (less secure for browsers if token isn't HttpOnly)
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const finalToken = token || headerToken;

  if (!finalToken) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    // Forward the request to the actual backend /auth/me endpoint
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        // Forward the token to the backend in the Authorization header
        'Authorization': `Bearer ${finalToken}`,
        'Content-Type': 'application/json',
      },
      // Important for avoiding unexpected caching in API routes
      cache: 'no-store',
    });

    // Read the body once (as text first, then try JSON)
    const bodyText = await backendResponse.text();

    if (!backendResponse.ok) {
      console.error(`Backend auth/me error: ${backendResponse.status}`, bodyText);
      // Try parsing error JSON from backend, otherwise use generic message
      let errorJson = { message: 'Failed to authenticate with backend.' };
      try {
          errorJson = JSON.parse(bodyText);
      } catch (e) {
          // Ignore parsing error, use default message
      }
      return NextResponse.json(errorJson, { status: backendResponse.status });
    }

    // Parse successful response
    try {
        const userData = JSON.parse(bodyText);
        // Return the user data received from the backend
        return NextResponse.json(userData);
    } catch (e) {
        console.error("Error parsing backend JSON response:", e, bodyText);
        return NextResponse.json({ message: 'Invalid response from backend.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error forwarding request to backend /auth/me:', error);
    // Network error or other fetch issue
    return NextResponse.json({ message: 'Internal Server Error contacting auth service.' }, { status: 500 });
  }
}