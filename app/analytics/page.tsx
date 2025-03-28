"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { AlertTriangle } from "lucide-react"
import { getTransactions } from "@/services/api"
import { formatKES } from "@/utils/format"

interface Transaction {
    id: string
    amount: number
    type: "deposit" | "withdrawal"
    description: string
    createdAt: string
    isSuspicious: boolean
}

export default function AlertsPage() {
    const { user } = useUser()
    const [suspiciousTransactions, setSuspiciousTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await getTransactions()
                setSuspiciousTransactions(response.data.filter((t: Transaction) => t.isSuspicious))
            } catch (error) {
                console.error("Error fetching alerts:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchAlerts()
        }
    }, [user])

    if (!user) {
        return <div>Please log in to view alerts</div>
    }

    if (loading) {
        return <div>Loading alerts...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Fraud Alerts</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {!user.hasAlerts ? (
                    <div className="text-center py-8">
                        <div className="bg-green-100 text-green-800 p-4 rounded-lg inline-block">
                            No fraud alerts detected for your account
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {suspiciousTransactions.map((transaction) => (
                            <div key={transaction.id} className="border-l-4 border-red-500 bg-red-50 p-4">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                                    <div>
                                        <p className="font-semibold text-red-700">Suspicious {transaction.type} detected</p>
                                        <p className="text-red-600">Amount: {formatKES(transaction.amount)}</p>
                                        <p className="text-sm text-red-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

