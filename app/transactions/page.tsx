"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { getTransactions, reportFraud } from "@/services/api"
import { formatKES } from "@/utils/format"
import { AlertTriangle } from "lucide-react"

interface Transaction {
    id: string
    amount: number
    type: "deposit" | "withdrawal"
    description: string
    createdAt: string
    isSuspicious: boolean
}

export default function TransactionsPage() {
    const { user } = useUser()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                if (!user) {
                    router.push("/")
                    return
                }
                const response = await getTransactions()
                setTransactions(response?.data || [])
            } catch (error: any) {
                setError(error.message || "Error fetching transactions")
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [user, router])

    const handleReportFraud = async (transactionId: string) => {
        try {
            await reportFraud()
            // Refresh transactions after reporting
            const response = await getTransactions()
            setTransactions(response?.data || [])
        } catch (error: any) {
            setError(error.message || "Error reporting fraud")
        }
    }

    if (!user) return null

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-6 text-2xl font-bold">Transaction History</h1>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

            <div className="rounded-lg bg-white p-6 shadow-md">
                {!transactions || transactions.length === 0 ? (
                    <p className="text-center text-gray-500">No transactions found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b">
                                        <td className="p-3">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3">{transaction.description}</td>
                                        <td
                                            className={`p-3 text-right ${transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"
                                                }`}
                                        >
                                            {transaction.type === "withdrawal" ? "-" : "+"}
                                            {formatKES(transaction.amount)}
                                        </td>
                                        <td className="p-3 text-center">
                                            {transaction.isSuspicious ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Suspicious
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {transaction.isSuspicious && (
                                                <button
                                                    onClick={() => handleReportFraud(transaction.id)}
                                                    className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                                                >
                                                    Report Fraud
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

