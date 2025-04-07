"use client";

import React, { useState, useEffect } from 'react';
import { getTransactions } from '@/services/api';
import { formatKES } from '@/utils/format';
import Link from 'next/link';

interface Transaction {
    id: string | number;
    amount: number;
    type: string;
    description: string;
    created_at: string;
    is_suspicious?: boolean;
}

export default function RecentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentTransactions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const recentTxs = await getTransactions(5);
                setTransactions(recentTxs || []);
            } catch (err: any) {
                console.error("Error fetching recent transactions:", err);
                 if (!err.message?.includes('Unauthorized')) {
                    setError(err.message || "Could not load recent activity.");
                 }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentTransactions();
    }, []);

    if (isLoading) {
        return <div className="text-center p-4 text-gray-500">Loading activity...</div>;
    }

    if (transactions.length === 0) {
        return <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">No recent transactions found.</div>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
             <ul className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                    <li key={tx.id} className="py-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(tx.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`text-sm font-medium whitespace-nowrap ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatKES(tx.amount)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            { transactions.length > 0 && (
                <div className="mt-4 text-center">
                    <Link href="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        View all transactions
                    </Link>
                </div>
             )}
        </div>
    );
}