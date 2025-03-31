import type { QueryResult } from "pg"

export interface User {
  id: number
  name: string
  email: string
  password: string
  phone_number?: string
  role: "user" | "admin" | "agent"
  account_number: string
  balance: number
  created_at: Date
  last_login?: Date
}

export interface Transaction {
  id: number
  user_id: number
  recipient_id?: number
  type: "deposit" | "withdrawal" | "transfer" | "payment" | "mpesa_deposit" | "mpesa_withdrawal"
  amount: number
  description: string
  reference?: string
  status: "pending" | "completed" | "failed" | "flagged"
  reported: boolean
  risk_score?: number
  created_at: Date
}

export interface FraudAlert {
  id: number
  user_id: number
  transaction_id: number
  description: string
  status: "new" | "reviewing" | "resolved" | "dismissed"
  risk_score: number
  resolution?: string
  created_at: Date
}

export interface DbQueryResult<T> extends QueryResult {
  rows: T[]
}

