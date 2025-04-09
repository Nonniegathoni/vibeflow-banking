"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowUpRight, ArrowDownLeft, AlertTriangle, BarChart3, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  amount: string
  type: string
  description: string
  status: string
  created_at: string
}

interface AccountSummary {
  balance: number
  recentTransactions: Transaction[]
  alerts: number
}

export default function Dashboard() {
  const router = useRouter()
  const [summary, setSummary] = useState<AccountSummary>({
    balance: 0,
    recentTransactions: [],
    alerts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  // Function to fetch account summary with optimized caching
  const fetchAccountSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/summary", {
        cache: "no-cache", // Disable caching for fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch account summary")
      }

      const data = await response.json()
      // Ensure all properties exist with defaults
      setSummary({
        balance: typeof data.balance === "number" ? data.balance : 0,
        recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : [],
        alerts: typeof data.alerts === "number" ? data.alerts : 0,
      })
    } catch (error) {
      console.error("Error fetching account summary:", error)
      setError("Failed to load account data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me")

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchUserData()
    fetchAccountSummary()

    // Set up polling for real-time updates (every 60 seconds instead of 30 to reduce load)
    const intervalId = setInterval(() => {
      fetchAccountSummary()
    }, 60000)

    return () => clearInterval(intervalId)
  }, [])

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      console.error("Date formatting error:", e)
      return "Invalid date"
    }
  }

  // Handle manual refresh
  const handleRefresh = () => {
    fetchAccountSummary()
  }

  // Safely check if recentTransactions exists and has items
  const hasTransactions = Array.isArray(summary.recentTransactions) && summary.recentTransactions.length > 0

  // Get user's full name or role-based default
  const userDisplayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || (user.role === "admin" ? "Admin" : "User")
    : "User"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {userDisplayName}
          {user?.role === "admin" && <span className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded">Admin</span>}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Account Balance</h2>
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          {loading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
          ) : (
            <>
              <p className="text-3xl font-bold">{formatCurrency(summary.balance || 0)}</p>
              <p className="text-sm text-gray-500 mt-2">Available Balance</p>
              <div className="mt-4">
                <Button
                  size="sm"
                  className="mr-2"
                  onClick={() => router.push("/dashboard/transactions/new?type=deposit")}
                >
                  Deposit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/dashboard/transactions/new?type=withdraw")}
                >
                  Withdraw
                </Button>
              </div>
            </>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Recent Activity</h2>
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {hasTransactions ? (
                summary.recentTransactions.slice(0, 3).map((transaction) => (
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
                      className={`text-sm font-medium ${
                        transaction.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(Number.parseFloat(transaction.amount || "0"))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent transactions</p>
              )}

              {hasTransactions && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-indigo-600"
                  onClick={() => router.push("/dashboard/transactions")}
                >
                  View all transactions
                </Button>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Fraud Alerts</h2>
            <AlertTriangle className="h-5 w-5 text-indigo-600" />
          </div>
          {loading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
          ) : (
            <>
              {summary.alerts > 0 ? (
                <div>
                  <p className="text-3xl font-bold text-amber-500">{summary.alerts}</p>
                  <p className="text-sm text-gray-500 mt-2">Active alerts requiring your attention</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2 text-indigo-600"
                    onClick={() => router.push("/dashboard/alerts")}
                  >
                    View Alerts →
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-green-500">0</p>
                  <p className="text-sm text-gray-500 mt-2">No active fraud alerts</p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Transaction History</h2>
            <Button onClick={() => router.push("/dashboard/transactions/new")} size="sm">
              New Transaction
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-6 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hasTransactions ? (
                    summary.recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.description}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.type === "credit" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(Number.parseFloat(transaction.amount || "0"))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status
                              ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                              : "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {transaction.type === "credit" ? (
                              <ArrowDownLeft className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            {transaction.type === "credit" ? "Deposit" : "Withdrawal"}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-right">
            <Button variant="link" className="text-indigo-600" onClick={() => router.push("/dashboard/transactions")}>
              View All Transactions →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
