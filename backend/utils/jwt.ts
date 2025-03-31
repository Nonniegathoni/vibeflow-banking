import jwt from "jsonwebtoken"

interface User {
  id: string
  email: string
  role: string
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "your_jwt_secret_key_here",
    {
      expiresIn: "7d",
    },
  )
}

// Verify JWT token
export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here")
}

