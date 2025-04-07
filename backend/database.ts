import { Pool } from "pg"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Create a new pool instance with connection details from environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Test the database connection
pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL database")
    client.release()
  })
  .catch((err) => {
    console.error("❌ Error connecting to PostgreSQL database:", err.message)
  })

// Helper function for executing queries
export const query = async (text: string, params: any[] = []) => {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start

    if (process.env.NODE_ENV !== "production") {
      console.log("Executed query", { text, duration, rows: res.rowCount })
    }

    return res
  } catch (error) {
    console.error("Query error:", error)
    throw error
  }
}

export { pool }

// Add default export
export default { pool, query }

