import bcrypt from "bcrypt"
import db from "../config/database"

interface User {
  id: string
  name: string
  email: string
  password: string
  phone_number?: string
  role: string
  account_number: string
  balance: number
  created_at: Date
  last_login?: Date
}

class UserModel {
  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    try {
      const result = await db.query("SELECT * FROM users WHERE id = $1", [id])
      return result.rows[0] || null
    } catch (error) {
      console.error("Error finding user by ID:", error)
      throw error
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email])
      return result.rows[0] || null
    } catch (error) {
      console.error("Error finding user by email:", error)
      throw error
    }
  }

  // Create a new user
  static async create(userData: Partial<User>): Promise<User> {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(userData.password!, salt)

      // Generate account number if not provided
      const accountNumber = userData.account_number || Math.floor(1000000000 + Math.random() * 9000000000).toString()

      const result = await db.query(
        `INSERT INTO users 
         (name, email, password, phone_number, role, account_number, balance) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          userData.name,
          userData.email,
          hashedPassword,
          userData.phone_number || null,
          userData.role || "user",
          accountNumber,
          userData.balance || 5000,
        ],
      )

      return result.rows[0]
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  // Update user
  static async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const keys = Object.keys(updateData)
      const values = Object.values(updateData)

      // Build the SET part of the query
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")

      // Add the ID as the last parameter
      values.push(id)

      const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`

      const result = await db.query(query, values)
      return result.rows[0]
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  // Update last login
  static async updateLastLogin(id: string): Promise<User> {
    try {
      const result = await db.query("UPDATE users SET last_login = NOW() WHERE id = $1 RETURNING *", [id])
      return result.rows[0]
    } catch (error) {
      console.error("Error updating last login:", error)
      throw error
    }
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}

export default UserModel

