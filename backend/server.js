import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import sequelize from "./config/database.js"
import authRoutes from "./routes/auth.js"
import adminAuthRoutes from "./routes/adminAuth.js"
import transactionRoutes from "./routes/transactions.js"
import userRoutes from "./routes/users.js"
import adminRoutes from "./routes/admin.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
sequelize
    .authenticate()
    .then(() => console.log("Connected to PostgreSQL database"))
    .catch((err) => console.error("Unable to connect to the database:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin/auth", adminAuthRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "Test route working" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log("Routes initialized:")
    console.log("- /api/auth")
    console.log("- /api/admin/auth")
    console.log("- /api/transactions")
    console.log("- /api/users")
    console.log("- /api/admin")
    console.log("- /api/test")
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("Something broke!")
})

