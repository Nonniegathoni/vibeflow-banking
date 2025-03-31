import bcrypt from "bcrypt";
import db from "../config/database";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create admin user
const createAdmin = async (): Promise<void> => {
  try {
    console.log("Checking if admin user exists...");
    
    // Check if admin already exists
    const adminExists = await db.query("SELECT * FROM users WHERE email = $1", ["admin@vibeflow.com"]);

    if (adminExists.rows.length > 0) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin123!", salt);

    const result = await db.query(
      `INSERT INTO users 
       (name, email, password, phone_number, role, account_number, balance, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
       RETURNING id, name, email, role`,
      ["Admin User", "admin@vibeflow.com", hashedPassword, "+254712345678", "admin", "9999999999", 1000000]
    );

    console.log("Admin user created:", result.rows[0]);
    
    // Close the database connection
    await db.pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

// Run the function
createAdmin();