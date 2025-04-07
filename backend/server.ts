import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import { errorHandler } from "./middleware/error-handler"

// Import routes
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import transactionRoutes from "./routes/transactions"
import fraudRoutes from "./routes/fraud"
import adminRoutes from "./routes/admin"

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Apply security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Logging
app.use(morgan("dev"))

// Parse JSON bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/fraud", fraudRoutes)
app.use("/api/admin", adminRoutes)

// Error handling middleware
app.use(errorHandler)

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
    console.log(`Health check available at: http://localhost:${PORT}/api/health`)
  })
}

export default app

