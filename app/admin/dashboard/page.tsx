"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { getAdminUsers, getAdminTransactions, resolveAlert } from "@/services/api"
import { formatKES } from "@/utils/format"
import { AlertTriangle, Users, Activity } from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    hasAlerts: boolean
}

interface Transaction {
    id: string
    amount: number
    type: string
    description: string
    createdAt: string
    isSuspicious: boolean
    User: {
        name: string
        email: string
    }
}

export default function AdminDashboardPage() {
    const { user } = useUser()
    const [users, setUsers] = useState<User[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user || user.role !== "admin") {
                    router.push("/")
                    return
                }
                const [usersData, transactionsData] = await Promise.all([getAdminUsers(), getAdminTransactions()])
                setUsers(usersData || [])
                setTransactions(transactionsData || [])
            } catch (error: any) {
                setError(error.message || "Error fetching admin data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, router])

    const handleResolveAlert = async (userId: string) => {
        try {
            await resolveAlert(userId)
            setUsers(users.map((user) => (user.id === userId ? { ...user, hasAlerts: false } : user)))
        } catch (error: any) {
            setError(error.message || "Error resolving alert")
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        )
    }

    const flaggedTransactions = transactions.filter((t) => t.isSuspicious)
    const usersWithAlerts = users.filter((u) => u.hasAlerts)

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>}

            <div className="mb-6 grid gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-semibold">{users.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-50 p-3">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Users with Alerts</p>
                            <p className="text-2xl font-semibold">{usersWithAlerts.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-yellow-50 p-3">
                            <Activity className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Flagged Transactions</p>
                            <p className="text-2xl font-semibold">{flaggedTransactions.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Users with Alerts */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-lg font-semibold">Users with Alerts</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersWithAlerts.map((user) => (
                                    <tr key={user.id} className="border-b">
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3">{user.email}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleResolveAlert(user.id)}
                                                className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200"
                                            >
                                                Resolve Alert
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Flagged Transactions */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-lg font-semibold">Flagged Transactions</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-3">User</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flaggedTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b">
                                        <td className="p-3">{transaction.User.name}</td>
                                        <td className="p-3">{formatKES(transaction.amount)}</td>
                                        <td className="p-3">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

