import { Pool } from "pg"

// Create a connection pool with optimized settings
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  // Add connection pool settings to improve performance
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
  // Add statement timeout to prevent long-running queries
  statement_timeout: 10000, // 10 seconds
})

// Create a query cache for frequently used queries
const queryCache = new Map()

// Export the query function with caching
export async function query(text: string, params?: any[], useCache = false) {
  try {
    const start = performance.now()

    // Check cache for identical queries
    const cacheKey = useCache ? `${text}:${JSON.stringify(params || [])}` : null

    if (cacheKey && queryCache.has(cacheKey)) {
      const cachedResult = queryCache.get(cacheKey)
      const duration = performance.now() - start

      if (duration > 100) {
        console.log("Cache hit for query:", { text, duration, rows: cachedResult.rowCount })
      }

      return cachedResult
    }

    // Execute the query
    const res = await pool.query(text, params)
    const duration = performance.now() - start

    // Log slow queries for optimization
    if (duration > 100) {
      console.log("Slow query:", { text, duration, rows: res.rowCount })
    }

    // Cache the result if caching is enabled
    if (cacheKey) {
      queryCache.set(cacheKey, res)

      // Set expiry for cache items (30 seconds)
      setTimeout(() => {
        queryCache.delete(cacheKey)
      }, 30000)
    }

    return res
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err)
  } else {
    console.log("Connected to PostgreSQL database")
  }
})

// Export the pool for direct use when needed
export { pool }
