import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, amount, description, recipientEmail } = await request.json()

    // Validate input
    if (!type || !amount) {
      return NextResponse.json({ error: "Transaction type and amount are required" }, { status: 400 })
    }

    // For transfers, validate recipient
    if (type === "transfer" && !recipientEmail) {
      return NextResponse.json({ error: "Recipient email is required for transfers" }, { status: 400 })
    }

    // Get user's current balance
    const balanceResult = await query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) as balance
      FROM transactions 
      WHERE user_id = $1
    `,
      [session.user.id],
    )

    const currentBalance = Number.parseFloat(balanceResult.rows[0]?.balance || "0")

    // For withdrawals and transfers, check if user has sufficient balance
    if ((type === "withdraw" || type === "transfer") && amount > currentBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Process transaction based on type
    if (type === "deposit") {
      // Create a credit transaction
      await query(
        `
        INSERT INTO transactions (user_id, amount, type, description, status)
        VALUES ($1, $2, 'credit', $3, 'completed')
      `,
        [session.user.id, amount, description || "Deposit"],
      )
    } else if (type === "withdraw") {
      // Create a debit transaction
      await query(
        `
        INSERT INTO transactions (user_id, amount, type, description, status)
        VALUES ($1, $2, 'debit', $3, 'completed')
      `,
        [session.user.id, amount, description || "Withdrawal"],
      )
    } else if (type === "transfer") {
      // Find recipient user
      const recipientResult = await query(
        `
        SELECT id FROM users WHERE email = $1
      `,
        [recipientEmail],
      )

      if (recipientResult.rows.length === 0) {
        return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
      }

      const recipientId = recipientResult.rows[0].id

      // Create a debit transaction for sender
      await query(
        `
        INSERT INTO transactions (user_id, amount, type, description, status)
        VALUES ($1, $2, 'debit', $3, 'completed')
      `,
        [session.user.id, amount, description || `Transfer to ${recipientEmail}`],
      )

      // Create a credit transaction for recipient
      await query(
        `
        INSERT INTO transactions (user_id, amount, type, description, status)
        VALUES ($1, $2, 'credit', $3, 'completed')
      `,
        [recipientId, amount, `Transfer from ${session.user.email}`],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Transaction error:", error)
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get transactions
    const result = await query(
      `
      SELECT id, amount, type, description, status, created_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [session.user.id, limit, offset],
    )

    // Get total count
    const countResult = await query(
      `
      SELECT COUNT(*) as total
      FROM transactions
      WHERE user_id = $1
    `,
      [session.user.id],
    )

    return NextResponse.json({
      transactions: result.rows,
      total: Number.parseInt(countResult.rows[0].total),
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
