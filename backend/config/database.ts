import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD as string;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432; // Default PostgreSQL port

// Basic validation (important!)
if (!dbName || !dbUser || !dbPassword || !dbHost) {
  console.error("❌ FATAL ERROR: Database configuration environment variables (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST) are missing!");
  // In a real app, you might want to throw an error or exit gracefully
  throw new Error("Missing essential database configuration in environment variables.");
}

// Initialize Sequelize instance
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres', // Explicitly state the dialect
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL in dev, silence in prod
  pool: {
    // Sequelize's internal pool settings, configure as needed
    max: 10, // Max number of connections in pool
    min: 0, // Min number of connections in pool
    acquire: 30000, // Max time (ms) to get connection before error
    idle: 10000 // Max time (ms) connection can be idle before release
  },
  dialectOptions: {
    // Add dialect-specific options if needed
    // Example for SSL in production (adjust based on your provider's requirements)
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  }
});

// Optional: Test the connection managed by Sequelize
sequelize.authenticate()
  .then(() => {
    console.log('✅ Sequelize connection has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database via Sequelize:', err);
  });

// Export ONLY the initialized Sequelize instance
export default sequelize;