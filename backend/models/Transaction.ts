import db from "../config/database"

interface Transaction {
  id: string
  user_id: string
  recipient_id?: string
  type: string
  amount: number
  description: string
  reference?: string
  status: string
  reported: boolean
  risk_score?: number
  created_at: Date
}

class TransactionModel {
  // Find transaction by ID
  static async findById(id: string): Promise<Transaction | null> {
    try {
      const result = await db.query("SELECT * FROM transactions WHERE id = $1", [id])
      return result.rows[0] || null
    } catch (error) {
      console.error("Error finding transaction by ID:", error)
      throw error
    }
  }

  // Create a new transaction
  static async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      // Generate reference number if not provided
      const reference =
        transactionData.reference ||
        `VF${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`

      const result = await db.query(
        `INSERT INTO transactions 
         (user_id, recipient_id, type, amount, description, reference, status, risk_score) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
          transactionData.user_id,
          transactionData.recipient_id || null,
          transactionData.type,
          transactionData.amount,
          transactionData.description,
          reference,
          transactionData.status || "pending",
          transactionData.risk_score || null,
        ],
      )

      return result.rows[0]
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw error
    }
  }

  // Update transaction
  static async update(id: string, updateData: Partial<Transaction>): Promise<Transaction> {
    try {
      const keys = Object.keys(updateData)
      const values = Object.values(updateData)

      // Build the SET part of the query
      const setClause = keys
        .map((key, i) => {
          // Convert camelCase to snake_case for database columns
          const column = key.replace(/([A-Z])/g, "_$1").toLowerCase()
          return `${column} = $${i + 1}`
        })
        .join(", ")

      // Add the ID as the last parameter
      values.push(id)

      const query = `UPDATE transactions SET ${setClause} WHERE id = $${values.length} RETURNING *`

      const result = await db.query(query, values)
      return result.rows[0]
    } catch (error) {
      console.error("Error updating transaction:", error)
      throw error
    }
  }

  // Get user transactions
  static async getUserTransactions(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ transactions: Transaction[]; total: number; page: number; pages: number }> {
    try {
      const offset = (page - 1) * limit

      const countResult = await db.query("SELECT COUNT(*) FROM transactions WHERE user_id = $1", [userId])
      const total = Number.parseInt(countResult.rows[0].count)

      const result = await db.query(
        "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [userId, limit, offset],
      )

      return {
        transactions: result.rows,
        total,
        page,
        pages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error getting user transactions:", error)
      throw error
    }
  }

  // Report transaction as fraudulent
  static async reportAsFraud(id: string): Promise<Transaction> {
    try {
      const result = await db.query("UPDATE transactions SET reported = true WHERE id = $1 RETURNING *", [id])
      return result.rows[0]
    } catch (error) {
      console.error("Error reporting transaction as fraud:", error)
      throw error
    }
  }
}

export default TransactionModel

