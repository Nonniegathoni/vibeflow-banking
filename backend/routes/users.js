import express from "express"
import User from "../models/User.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ["password"] },
        })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error: error.message })
    }
})

router.put("/profile", auth, async (req, res) => {
    try {
        const { name, email, phone, emailAlerts, smsAlerts, twoFactorAuth } = req.body
        const user = await User.findByPk(req.user.userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.name = name || user.name
        user.email = email || user.email
        user.phone = phone || user.phone
        user.emailAlerts = emailAlerts !== undefined ? emailAlerts : user.emailAlerts
        user.smsAlerts = smsAlerts !== undefined ? smsAlerts : user.smsAlerts
        user.twoFactorAuth = twoFactorAuth !== undefined ? twoFactorAuth : user.twoFactorAuth

        await user.save()

        res.json({ message: "Profile updated successfully", user: user.toJSON() })
    } catch (error) {
        res.status(400).json({ message: "Error updating user profile", error: error.message })
    }
})

router.post("/report-fraud", auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // In a real-world scenario, you'd create a fraud report and notify the relevant team
        // For this example, we'll just update the user's hasAlerts flag
        user.hasAlerts = true
        await user.save()

        res.json({ message: "Fraud report submitted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error submitting fraud report", error: error.message })
    }
})

export default router

