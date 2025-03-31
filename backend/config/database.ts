import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Database configuration with fallbacks
const dbConfig = {
  user: process.env.DB_USER || "vibeflow_user",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "vibeflow_banking",
  password: process.env.DB_PASSWORD || "Secure_Password_123!",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on("error", (err: Error, client: PoolClient) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Test the database connection
const testConnection = async (): Promise<void> => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connected successfully at:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection error:", err);
    console.error("Please check your database configuration and ensure PostgreSQL is running.");
    throw err;
  } finally {
    if (client) client.release();
  }
};

// Query function with error handling
const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (over 100ms) for performance monitoring
    if (duration > 100) {
      console.log("Slow query:", { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (err) {
    console.error("Query error:", err);
    throw err;
  }
};

// Transaction helper
const transaction = async (callback: (client: PoolClient) => Promise<any>): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Method to end the pool (useful for scripts)
const end = async (): Promise<void> => {
  await pool.end();
};

export default {
  query,
  pool,
  transaction,
  testConnection,
  end
};