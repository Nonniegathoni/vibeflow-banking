// Defining core data types for the application
export type UserRole = "user" | "admin" | "agent"

export type TransactionType = "deposit" | "withdrawal" | "transfer" | "payment" | "mpesa_deposit" | "mpesa_withdrawal"

export type TransactionStatus = "pending" | "completed" | "failed" | "flagged"

export interface User {
  id: string
  name: string
  email: string
  password?: string // Optional as we don't always want to include this
  role: UserRole
  balance: number
  accountNumber: string
  phoneNumber?: string
  createdAt: string
  lastLogin?: string
}

export interface Transaction {
  id: string
  userId: string
  recipientId?: string
  type: TransactionType
  amount: number
  description: string
  timestamp: number
  status: TransactionStatus
  reference?: string
  reported?: boolean
  riskScore?: number
}

export interface FraudAlert {
  id: string
  userId: string
  transactionId: string
  description: string
  status: "new" | "reviewing" | "resolved" | "dismissed"
  timestamp: number
  riskScore: number
  resolution?: string
}

export interface DashboardStats {
  totalTransactions: number
  fraudulentTransactions: number
  averageRiskScore: number
  transactionVolume: number
  activeUsers: number
}

