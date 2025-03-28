import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()

        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" })
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            accountNumber,
            balance: Math.floor(Math.random() * 100000),
            hasAlerts: false,
        })

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        // Return user data without sensitive information
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            accountNumber: user.accountNumber,
            hasAlerts: user.hasAlerts,
            balance: user.balance,
            phone: user.phone,
        }

        res.status(201).json({
            token,
            user: userData,
        })
    } catch (error) {
        res.status(400).json({ message: "Error registering user", error: error.message })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        user.lastLogin = new Date()
        await user.save()

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        // Return user data without sensitive information
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            accountNumber: user.accountNumber,
            hasAlerts: user.hasAlerts,
            balance: user.balance,
            phone: user.phone,
        }

        res.json({
            token,
            user: userData,
        })
    } catch (error) {
        res.status(400).json({ message: "Error logging in", error: error.message })
    }
})

export default router

