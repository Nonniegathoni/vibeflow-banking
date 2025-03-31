"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { formatCurrency } from "@/utils/format"

// Mock data for transactions
const mockTransactions = [
  {
    id: "TX123456",
    userId: "USR001",
    userName: "Wanjiku Kamau",
    type: "withdrawal",
    amount: 25000,
    status: "completed",
    riskScore: 35,
    date: "2023-05-15T10:30:00Z",
    description: "ATM Withdrawal",
  },
  {
    id: "TX123457",
    userId: "USR002",
    userName: "Otieno Odhiambo",
    type: "transfer",
    amount: 75000,
    status: "flagged",
    riskScore: 85,
    date: "2023-05-15T11:45:00Z",
    description: "Account Transfer",
  },
  {
    id: "TX123458",
    userId: "USR003",
    userName: "Njeri Mwangi",
    type: "deposit",
    amount: 150000,
    status: "completed",
    riskScore: 15,
    date: "2023-05-15T12:15:00Z",
    description: "Cash Deposit",
  },
  {
    id: "TX123459",
    userId: "USR004",
    userName: "Kipchoge Keino",
    type: "payment",
    amount: 45000,
    status: "failed",
    riskScore: 20,
    date: "2023-05-15T13:30:00Z",
    description: "Utility Payment",
  },
  {
    id: "TX123460",
    userId: "USR005",
    userName: "Akinyi Onyango",
    type: "mpesa_withdrawal",
    amount: 35000,
    status: "flagged",
    riskScore: 78,
    date: "2023-05-15T14:45:00Z",
    description: "M-PESA Withdrawal",
  },
  {
    id: "TX123461",
    userId: "USR006",
    userName: "Muthoni Kariuki",
    type: "transfer",
    amount: 250000,
    status: "flagged",
    riskScore: 92,
    date: "2023-05-15T15:00:00Z",
    description: "Account Transfer",
  },
  {
    id: "TX123462",
    userId: "USR007",
    userName: "Omondi Ochieng",
    type: "deposit",
    amount: 500000,
    status: "completed",
    riskScore: 65,
    date: "2023-05-15T16:15:00Z",
    description: "Cheque Deposit",
  },
  {
    id: "TX123463",
    userId: "USR008",
    userName: "Wangari Maathai",
    type: "payment",
    amount: 120000,
    status: "completed",
    riskScore: 25,
    date: "2023-05-15T17:30:00Z",
    description: "School Fees",
  },
]

export function RecentTransactionsTable() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)

  const totalPages = Math.ceil(mockTransactions.length / pageSize)
  const paginatedTransactions = mockTransactions.slice((page - 1) * pageSize, page * pageSize)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "flagged":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Flagged
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }
  }

  const getRiskBadge = (score: number) => {
    if (score >= 75) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
          High ({score})
        </Badge>
      )
    } else if (score >= 50) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
          Medium ({score})
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          Low ({score})
        </Badge>
      )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.userName}</TableCell>
                <TableCell className="capitalize">{transaction.type.replace("_", " ")}</TableCell>
                <TableCell>KSH {formatCurrency(transaction.amount)}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>{getRiskBadge(transaction.riskScore)}</TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, mockTransactions.length)} of{" "}
          {mockTransactions.length} transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page === 1}>
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPage(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

