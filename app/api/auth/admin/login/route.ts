import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcrypt"
import crypto from "crypto"
import sessionStore from "@/lib/session-store"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Check if user exists and is an admin
    const result = await query("SELECT * FROM users WHERE email = $1 AND role = 'admin'", [email])

    if (result.rows.length === 0) {
      // Use a generic error message to prevent user enumeration
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const user = result.rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Generate a temporary session token
    const sessionToken = crypto.randomBytes(32).toString("hex")

    // Store the session token with a 10-minute expiry
    sessionStore[sessionToken] = {
      userId: user.id,
      email: user.email,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    }

    // In a real application, send an email with the verification code
    // For demo purposes, we'll just log it
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`Verification code for ${email}: ${verificationCode}`)

    // Store the verification code
    sessionStore[sessionToken].verificationCode = verificationCode

    return NextResponse.json({
      message: "Verification code sent",
      sessionToken,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
