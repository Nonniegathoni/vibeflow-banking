import * as path from "path"
import * as dotenv from "dotenv"
import db from "../config/database"
import * as bcrypt from "bcrypt"

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database tables...")

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        account_number VARCHAR(20) UNIQUE,
        balance DECIMAL(15, 2) DEFAULT 5000.00,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `)
    console.log("✅ Users table created")

    // Create transactions table
    await db.query(`
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
        location VARCHAR(100),
        ip_address VARCHAR(45),
        device_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Transactions table created")

    // Create fraud_alerts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS fraud_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        transaction_id INTEGER REFERENCES transactions(id),
        description TEXT,
        status VARCHAR(20) DEFAULT 'new',
        risk_score INTEGER,
        resolution TEXT,
        resolved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `)
    console.log("✅ Fraud alerts table created")

    // Create fraud_rules table
    await db.query(`
      CREATE TABLE IF NOT EXISTS fraud_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        rule_type VARCHAR(50) NOT NULL,
        threshold DECIMAL(15, 2),
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      )
    `)
    console.log("✅ Fraud rules table created")

    // Create audit_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Audit logs table created")

    // Create customer_support table
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_support (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `)
    console.log("✅ Customer support table created")

    // Create notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Notifications table created")

    // Check if admin user exists
    const adminExists = await db.query("SELECT * FROM users WHERE email = $1", ["admin@vibeflow.com"])

    if (adminExists.rows.length === 0) {
      // Create admin user
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("Admin123!", salt)

      await db.query(
        `INSERT INTO users (name, email, password, role, balance, account_number, phone_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ["Admin User", "admin@vibeflow.com", hashedPassword, "admin", 1000000, "9999999999", "+254712345678"],
      )
      console.log("✅ Admin user created")
    } else {
      console.log("✅ Admin user already exists")
    }

    console.log("✅ Database setup completed successfully")
  } catch (error) {
    console.error("❌ Database setup error:", error)
  } finally {
    // Close the pool
    db.pool.end()
  }
}

// Run the setup
setupDatabase()

