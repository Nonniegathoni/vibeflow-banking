import express from "express"
import jwt from "jsonwebtoken"
import Admin from "../models/Admin.js"

const router = express.Router()

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body
        const admin = await Admin.findOne({ where: { username } })

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid username or password" })
        }

        const token = jwt.sign({ adminId: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.json({
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        })
    } catch (error) {
        res.status(400).json({ message: "Error logging in", error: error.message })
    }
})

export default router

