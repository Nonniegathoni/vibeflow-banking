import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"
import sessionStore from "@/lib/session-store"

export async function POST(request: Request) {
  try {
    const { sessionToken, verificationCode } = await request.json()

    // Validate input
    if (!sessionToken || !verificationCode) {
      return NextResponse.json({ message: "Session token and verification code are required" }, { status: 400 })
    }

    // Check if session exists and is valid
    const session = sessionStore[sessionToken]
    if (!session) {
      return NextResponse.json({ message: "Invalid or expired session" }, { status: 401 })
    }

    // Check if session has expired
    if (session.expires < Date.now()) {
      delete sessionStore[sessionToken]
      return NextResponse.json({ message: "Session has expired" }, { status: 401 })
    }

    // Check if verification code matches
    if (session.verificationCode !== verificationCode) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 401 })
    }

    // Get user data
    const result = await query("SELECT id, email, first_name, last_name, role FROM users WHERE id = $1", [
      session.userId,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const user = result.rows[0]

    // Create JWT token with two-factor verification flag
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        twoFactorVerified: true, // Add this flag to indicate 2FA is complete
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "4h" }, // Shorter session for admin users
    )

    // Clean up the session
    delete sessionStore[sessionToken]

    // Return the token and user data
    return NextResponse.json({
      message: "Verification successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ message: "An error occurred during verification" }, { status: 500 })
  }
}
