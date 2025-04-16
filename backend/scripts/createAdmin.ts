import bcrypt from "bcrypt";
import db from "../config/database"; 
import dotenv from "dotenv";
import path from "path";
import { QueryTypes } from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface UserQueryResult {
  id: number; // Or appropriate type
}

interface CreatedAdminResult {
  id: number;
  name: string;
  email: string;
  role: string;
}

const createAdmin = async (): Promise<void> => {
  try {
    console.log("Checking if admin user exists...");
    const adminEmail = "admin@vibeflow.com";

    const existingAdmins = await db.query<UserQueryResult[]>(
        "SELECT id FROM users WHERE email = $1 LIMIT 1", {
        replacements: [adminEmail],
        type: QueryTypes.SELECT
    });

    if (existingAdmins.length > 0) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    console.log("Creating admin user...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin123!", salt);
    const adminName = "Admin User";
    const adminPhone = "+254712345678";
    const adminRole = "admin";
    const adminAccount = "9999999999";
    const adminBalance = 1000000.00;

    // Use QueryTypes.SELECT because RETURNING makes the query return rows
    const results = await db.query<CreatedAdminResult[]>(
      `INSERT INTO users
       (name, email, "password", phone_number, role, account_number, balance, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role`,
      {
        replacements: [adminName, adminEmail, hashedPassword, adminPhone, adminRole, adminAccount, adminBalance],
        type: QueryTypes.SELECT
      }
    );

    if (results && results.length > 0 && results[0]) {
         console.log("Admin user created:", results[0]);
    } else {
         console.warn("Admin user inserted, but no data was returned.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdmin();
