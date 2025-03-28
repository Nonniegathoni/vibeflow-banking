import express from "express"
import adminAuth from "../middleware/adminAuth.js"
import User from "../models/User.js"
import Transaction from "../models/Transaction.js"

const router = express.Router()

router.get("/users", adminAuth, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] },
        })
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message })
    }
})

router.get("/transactions", adminAuth, async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{ model: User, attributes: ["name", "email"] }],
        })
        res.json(transactions)
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions", error: error.message })
    }
})

router.put("/resolve-alert/:userId", adminAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        user.hasAlerts = false
        await user.save()
        res.json({ message: "Alert resolved successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error resolving alert", error: error.message })
    }
})

export default router

