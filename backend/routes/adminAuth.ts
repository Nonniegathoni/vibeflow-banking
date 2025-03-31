import express, { type Request, type Response } from "express"
import jwt from "jsonwebtoken"
import Admin from "../models/Admin"

const router = express.Router()

interface LoginRequest {
  username: string
  password: string
}

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as LoginRequest

    const admin = await Admin.findOne({ where: { username } })

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    const token = jwt.sign({ adminId: admin.id, role: admin.role }, process.env.JWT_SECRET!, { expiresIn: "1h" })

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
    res.status(400).json({ message: "Error logging in", error: (error as Error).message })
  }
})

export default router

