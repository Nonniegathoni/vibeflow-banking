// lib/db.ts
import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Export the query method directly
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Also export the pool for direct access if needed
export { pool };

// Export a default object for backward compatibility
const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};

export default db;