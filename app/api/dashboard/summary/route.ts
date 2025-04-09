import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"

// Add caching to improve performance
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use Promise.all to run queries in parallel
    const [balanceResult, transactionsResult, alertsResult] = await Promise.all([
      // Get account balance (sum of all transactions)
      query(
        `
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) as balance
        FROM transactions 
        WHERE user_id = $1
      `,
        [session.user.id],
      ),

      // Get recent transactions
      query(
        `
        SELECT id, amount, type, description, status, created_at
        FROM transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `,
        [session.user.id],
      ),

      // Get fraud alerts count
      query(
        `
        SELECT COUNT(*) as count
        FROM fraud_alerts
        WHERE user_id = $1 AND status = 'pending'
      `,
        [session.user.id],
      ),
    ])

    return NextResponse.json(
      {
        balance: Number.parseFloat(balanceResult.rows[0]?.balance || "0"),
        recentTransactions: transactionsResult.rows,
        alerts: Number.parseInt(alertsResult.rows[0]?.count || "0"),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 })
  }
}
