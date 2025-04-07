"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext" // Ensure UserContext provides a User object or null
import { AlertTriangle } from "lucide-react"
import { getTransactions } from "@/services/api" // Ensure getTransactions is exported
import { formatKES } from "@/utils/format" // Ensure formatKES is exported and works
import { Transaction } from "@/types"

// Define the User type based on what useUser() actually provides
interface User {
    // Add properties that your UserContext actually provides, e.g.:
    id: string;
    name: string;
    email: string;
    // hasAlerts?: boolean; // Removed as per error diagnosis
}


export default function AlertsPage() {
    // Ensure useUser provides a User object or null, matching the interface above
    const { user } = useUser() as { user: User | null }; 
    const [suspiciousTransactions, setSuspiciousTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchAlerts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch transactions and filter for suspicious ones
                const transactions: Transaction[] = await getTransactions();
                // Assuming the backend returns transactions with a riskScore property
                const suspicious = transactions.filter((t: Transaction) => (t.riskScore || 0) > 0);
                setSuspiciousTransactions(suspicious);
                setSuspiciousTransactions(suspicious)
            } catch (err: any) {
                console.error("Error fetching alerts:", err)
                setError(err?.response?.data?.message || err.message || "Failed to load alerts.");
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchAlerts()
        } else {
             setLoading(false); // Not logged in, stop loading
        }
    }, [user]) // Dependency array includes user

    if (loading) {
        return <div className="container mx-auto px-4 py-8 text-center">Loading alerts...</div>
    }
    
    if (!user) {
        // Suggest login or handle appropriately
        return <div className="container mx-auto px-4 py-8 text-center">Please log in to view alerts.</div>
    }

    if (error) {
         return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {error}</div>
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Fraud Alerts</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Check suspiciousTransactions array length instead of user.hasAlerts */}
                {suspiciousTransactions.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="bg-green-100 text-green-800 p-4 rounded-lg inline-block">
                            No suspicious transactions detected requiring alerts.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {suspiciousTransactions.map((transaction) => (
                            <div key={transaction.id} className="border-l-4 border-red-500 bg-red-50 p-4">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-red-700">Suspicious {transaction.type} detected</p>
                                        <p className="text-red-600">Amount: {formatKES(transaction.amount)}</p>
                                        {/* Display timestamp as date string */}
                                        <p className="text-sm text-red-500">{new Date(transaction.timestamp).toLocaleString()}</p>
                                        {transaction.description && <p className="text-sm text-gray-600 mt-1">Description: {transaction.description}</p>}
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