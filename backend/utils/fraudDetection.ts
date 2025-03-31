import db from "../config/database"

interface RiskFactors {
  amount: number
  frequency: number
  location: number
  pattern: number
  userHistory: number
}

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  status: string
}

interface User {
  id: string
  created_at: Date
}

// Calculate risk score for a transaction
export async function calculateRiskScore(transaction: Transaction, user: User): Promise<number> {
  // Initialize risk factors
  const riskFactors: RiskFactors = {
    amount: 0,
    frequency: 0,
    location: 0,
    pattern: 0,
    userHistory: 0,
  }

  // 1. Amount factor - higher amounts have higher risk
  if (transaction.amount > 50000) {
    riskFactors.amount = 30
  } else if (transaction.amount > 10000) {
    riskFactors.amount = 15
  } else if (transaction.amount > 5000) {
    riskFactors.amount = 5
  }

  // 2. Frequency factor - check for multiple transactions in short time
  const recentTransactionsResult = await db.query(
    `SELECT COUNT(*) FROM transactions 
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
    [user.id],
  )

  const recentTransactionsCount = Number.parseInt(recentTransactionsResult.rows[0].count)

  if (recentTransactionsCount > 10) {
    riskFactors.frequency = 25
  } else if (recentTransactionsCount > 5) {
    riskFactors.frequency = 10
  }

  // 3. Pattern factor - unusual transaction patterns
  const userAvgAmount = await calculateUserAverageAmount(user.id)
  if (transaction.amount > userAvgAmount * 3) {
    riskFactors.pattern = 20
  } else if (transaction.amount > userAvgAmount * 2) {
    riskFactors.pattern = 10
  }

  // 4. User history factor - new accounts are higher risk
  const userAge = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24) // in days
  if (userAge < 7) {
    riskFactors.userHistory = 15
  } else if (userAge < 30) {
    riskFactors.userHistory = 5
  }

  // Calculate total risk score (max 100)
  const totalRiskScore = Math.min(
    100,
    riskFactors.amount + riskFactors.frequency + riskFactors.location + riskFactors.pattern + riskFactors.userHistory,
  )

  return Math.round(totalRiskScore)
}

// Helper function to calculate user's average transaction amount
async function calculateUserAverageAmount(userId: string): Promise<number> {
  const result = await db.query("SELECT AVG(amount) as avg_amount FROM transactions WHERE user_id = $1", [userId])

  return Number.parseFloat(result.rows[0].avg_amount) || 0
}

// Determine if a transaction should be flagged based on risk score
export function shouldFlagTransaction(riskScore: number): boolean {
  return riskScore >= 75
}

