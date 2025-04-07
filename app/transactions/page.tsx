"use client";
import { Transaction } from "@/types";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getTransactions, reportFraud } from "@/services/api";
import { formatKES } from "@/utils/format";
import { AlertTriangle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";


export default function TransactionsPage() {
    const { user, loading: userLoading } = useUser();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (!userLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            const fetchTransactions = async () => {
                setLoading(true);
                setError("");
                try {
                    const fetchedTransactions = await getTransactions();
                    setTransactions(fetchedTransactions as any || []);
                } catch (err: any) {
                    console.error("Transaction fetch error:", err);
                    if (err.message?.includes('Unauthorized')) {
                         setError("Authentication failed. Please log in again.");
                    } else {
                         setError(err.message || "Error fetching transactions");
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchTransactions();
        }
    }, [user, userLoading, router]);

    const handleReportFraud = async (transactionId: string | number) => {
        setError("");
        const idString = String(transactionId);
        try {
            await reportFraud(idString);
            alert("Fraud reported successfully.");

            setLoading(true);
            const refreshedTransactions = await getTransactions();
            setTransactions(refreshedTransactions as any || []);
        } catch (err: any) {
             console.error("Error reporting fraud:", err);
            setError(err.message || "Error reporting fraud");
        } finally {
             setLoading(false);
        }
    };

    if (userLoading || !user) {
       return <LoadingSpinner />;
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Transaction History</h1>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                    <span className="font-medium">Error:</span> {error}
                </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow">
                {transactions.length === 0 ? (
                     <p className="p-6 text-center text-gray-500">No transactions found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-gray-600">
                                    <th className="p-3 font-medium">Date</th>
                                    <th className="p-3 font-medium">Description</th>
                                    <th className="p-3 text-right font-medium">Amount</th>
                                    <th className="p-3 text-center font-medium">Status</th>
                                    <th className="p-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="p-3 whitespace-nowrap">{new Date(transaction.timestamp).toLocaleDateString()}</td>
                                        <td className="p-3">{transaction.description}</td>
                                        <td
                                            className={`p-3 text-right font-medium whitespace-nowrap ${
                                                transaction.amount < 0 ? "text-red-600" : "text-green-600"
                                            }`}
                                        >
                                            {formatKES(transaction.amount)}
                                        </td>
                                        <td className="p-3 text-center">
                                            {transaction.reported ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                                    <AlertTriangle className="h-3 w-3" /> Reported
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {transaction.reported && (
                                                <button
                                                    onClick={() => handleReportFraud(transaction.id)}
                                                    className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
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
    );
}