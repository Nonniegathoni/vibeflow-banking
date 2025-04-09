"use client"

import { useState, useEffect } from "react"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { fetchTransactions } from "@/lib/api-client"
import type { Transaction } from "@/types/index"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function RecentTransactions() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransactions() {
      try {
        const recentTxs = await fetchTransactions("5")
        // Use a function to update state to avoid type errors
        setTransactions((prevState) => recentTxs || prevState)
      } catch (err: any) {
        console.error("Error fetching recent transactions:", err)
        if (err.message?.includes("unauthorized")) {
          // Handle unauthorized error
        }
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.length > 0 ? (
        <>
          {transactions.slice(0, 3).map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center">
              <div className="flex items-center">
                {transaction.type === "credit" ? (
                  <ArrowDownLeft className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className="text-sm">{transaction.description}</span>
              </div>
              <span
                className={`text-sm font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "credit" ? "+" : "-"}${Number.parseFloat(transaction.amount).toFixed(2)}
              </span>
            </div>
          ))}
          <Button
            variant="link"
            className="p-0 h-auto text-indigo-600"
            onClick={() => router.push("/dashboard/transactions")}
          >
            View all transactions
          </Button>
        </>
      ) : (
        <p className="text-sm text-gray-500">No recent transactions</p>
      )}
    </div>
  )
}
