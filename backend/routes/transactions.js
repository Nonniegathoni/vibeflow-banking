import express from "express"
import Transaction from "../models/Transaction.js"
import User from "../models/User.js"
import auth from "../middleware/auth.js"
import { detectFraud } from "../utils/fraudDetection.js"

const router = express.Router()

router.post("/", auth, async (req, res) => {
  try {
    const { amount, type, description } = req.body
    const user = await User.findByPk(req.user.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (type === "withdrawal" && user.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" })
    }

    const transaction = await Transaction.create({
      UserId: req.user.userId,
      amount,
      type,
      description,
    })

    const isSuspicious = detectFraud(transaction, user)
    transaction.isSuspicious = isSuspicious
    await transaction.save()

    if (type === "deposit") {
      user.balance += amount
    } else {
      user.balance -= amount
    }
    await user.save()

    res.status(201).json(transaction)
  } catch (error) {
    res.status(400).json({ message: "Error creating transaction", error: error.message })
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { UserId: req.user.userId },
      order: [["createdAt", "DESC"]],
    })
    res.json(transactions)
  } catch (error) {
    res.status(400).json({ message: "Error fetching transactions", error: error.message })
  }
})

export default router

