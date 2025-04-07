"use client";

import { useState, useEffect } from "react"; // Added useEffect for real data fetching later
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye,
    AlertTriangle, CheckCircle, XCircle,
} from "lucide-react";
import { formatKES } from "@/utils/format";
// Import function to fetch admin transactions from api.ts if created
// import { getAdminTransactions } from "@/services/api";

const mockTransactions = [
    { id: "TX123456", userId: "USR001", userName: "Wanjiku Kamau", type: "withdrawal", amount: 25000, status: "completed", riskScore: 35, date: "2023-05-15T10:30:00Z", description: "ATM Withdrawal" },
    { id: "TX123457", userId: "USR002", userName: "Otieno Odhiambo", type: "transfer", amount: 75000, status: "flagged", riskScore: 85, date: "2023-05-15T11:45:00Z", description: "Account Transfer" },
    // Add more mock data if needed
];

interface AdminTransaction {
    id: string;
    userId: string;
    userName: string;
    type: string;
    amount: number;
    status: string;
    riskScore: number;
    date: string;
    description: string;
}


export function RecentTransactionsTable() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    // Replace mockTransactions with state fetched from API
    // const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
    // const [loading, setLoading] = useState(true);
    // useEffect(() => { /* fetch admin transactions */ setLoading(false); }, []);
    const transactions = mockTransactions; // Using mock for now

    const totalPages = Math.ceil(transactions.length / pageSize);
    const paginatedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed": return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
            case "flagged": return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300"><AlertTriangle className="mr-1 h-3 w-3" />Flagged</Badge>;
            case "failed": return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>;
            default: return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
        }
    };

    const getRiskBadge = (score: number) => {
        if (score >= 75) return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">High ({score})</Badge>;
        if (score >= 50) return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Medium ({score})</Badge>;
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Low ({score})</Badge>;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-semibold">Recent System Transactions</h2>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Risk</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransactions.length > 0 ? (
                            paginatedTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-medium text-xs">{transaction.id}</TableCell>
                                    <TableCell>{transaction.userName}</TableCell>
                                    <TableCell className="capitalize">{transaction.type.replace("_", " ")}</TableCell>
                                    <TableCell className="text-right">{formatKES(transaction.amount)}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(transaction.status)}</TableCell>
                                    <TableCell className="text-center">{getRiskBadge(transaction.riskScore)}</TableCell>
                                    <TableCell className="text-xs whitespace-nowrap">{formatDate(transaction.date)}</TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View details</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No recent transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <div className="flex items-center space-x-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(1)} disabled={page === 1}>
                        <ChevronsLeft className="h-4 w-4" /> <span className="sr-only">First</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        <ChevronLeft className="h-4 w-4" /> <span className="sr-only">Prev</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                        <ChevronRight className="h-4 w-4" /> <span className="sr-only">Next</span>
                     </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                        <ChevronsRight className="h-4 w-4" /> <span className="sr-only">Last</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}