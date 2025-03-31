import express, { type Request, type Response, type NextFunction } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { createError, createValidationError } from "../utils/error-handler"
import { isValidEmail, isValidPassword, isValidKenyanPhone } from "../utils/validation"
import db from "../config/database"

const router = express.Router()

// Register a new user
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phoneNumber } = req.body

    // Validate input
    if (!name || !email || !password) {
      throw createValidationError("Name, email and password are required")
    }

    if (!isValidEmail(email)) {
      throw createValidationError("Invalid email format")
    }

    if (!isValidPassword(password)) {
      throw createValidationError(
        "Password must be at least 8 characters with at least 1 uppercase, 1 lowercase, and 1 number",
      )
    }

    if (phoneNumber && !isValidKenyanPhone(phoneNumber)) {
      throw createValidationError("Invalid phone number format")
    }

    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      throw createValidationError("Email already in use")
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate account number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()

    // Create user in database
    const result = await db.query(
      `INSERT INTO users (name, email, password, phone_number, role, account_number, balance, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
       RETURNING id, name, email, role, account_number, balance`,
      [name, email, hashedPassword, phoneNumber, "user", accountNumber, 5000, "active"],
    )

    // Generate JWT token
    const token = jwt.sign(
      { id: result.rows[0].id, email, role: "user" },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "7d" },
    )

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: result.rows[0],
    })
  } catch (error) {
    next(error)
  }
})

// Login user
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      throw createValidationError("Email and password are required")
    }

    // Find user by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email])
    const user = result.rows[0]

    if (!user) {
      throw createError("Invalid email or password", 401)
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw createError("Invalid email or password", 401)
    }

    // Update last login
    await db.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id])

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "7d" },
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
})

// Logout - client-side only, just for completeness
router.post("/logout", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
})

export default router

