import db from "../config/database";
import fs from "fs";
import path from "path";

// SQL to create users table
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  account_number VARCHAR(20) UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 5000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
`;

// SQL to create transactions table
const createTransactionsTable = `
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  recipient_id INTEGER REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  reference VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  reported BOOLEAN DEFAULT false,
  risk_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// SQL to create fraud_alerts table
const createFraudAlertsTable = `
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  transaction_id INTEGER REFERENCES transactions(id),
  description TEXT,
  status VARCHAR(20) DEFAULT 'new',
  risk_score INTEGER,
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Function to execute SQL queries
async function executeSql(sql: string, description: string): Promise<void> {
  try {
    await db.query(sql);
    console.log(`✅ ${description} successful`);
  } catch (err) {
    console.error(`❌ ${description} failed:`, (err as Error).message);
  }
}

// Main function to set up database
async function setupDatabase(): Promise<void> {
  console.log("🔄 Setting up database tables...");

  try {
    // Create tables
    await executeSql(createUsersTable, "Users table creation");
    await executeSql(createTransactionsTable, "Transactions table creation");
    await executeSql(createFraudAlertsTable, "Fraud alerts table creation");

    console.log("✅ Database setup completed successfully");
  } catch (err) {
    console.error("❌ Database setup failed:", err);
  } finally {
    // End the pool
    await db.pool.end();
  }
}

// Run the setup
setupDatabase();