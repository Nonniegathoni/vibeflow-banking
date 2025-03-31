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

// Mock data for alerts
const mockAlerts = [
  {
    id: "ALT001",
    transactionId: "TX123457",
    userId: "USR002",
    userName: "Otieno Odhiambo",
    description: "Suspicious transfer of KSH 75,000",
    status: "new",
    riskScore: 85,
    date: "2023-05-15T11:45:00Z",
  },
  {
    id: "ALT002",
    transactionId: "TX123460",
    userId: "USR005",
    userName: "Akinyi Onyango",
    description: "Unusual M-PESA withdrawal of KSH 35,000",
    status: "reviewing",
    riskScore: 78,
    date: "2023-05-15T14:45:00Z",
  },
  {
    id: "ALT003",
    transactionId: "TX123461",
    userId: "USR006",
    userName: "Muthoni Kariuki",
    description: "Large transfer of KSH 250,000 to unrecognized account",
    status: "new",
    riskScore: 92,
    date: "2023-05-15T15:00:00Z",
  },
  {
    id: "ALT004",
    transactionId: "TX123464",
    userId: "USR009",
    userName: "Kimani Nganga",
    description: "Multiple failed login attempts before transaction",
    status: "resolved",
    riskScore: 88,
    date: "2023-05-15T09:15:00Z",
  },
  {
    id: "ALT005",
    transactionId: "TX123465",
    userId: "USR010",
    userName: "Auma Obama",
    description: "Transaction from unusual location",
    status: "dismissed",
    riskScore: 76,
    date: "2023-05-15T08:30:00Z",
  },
  {
    id: "ALT006",
    transactionId: "TX123466",
    userId: "USR011",
    userName: "Jomo Kenyatta",
    description: "Unusual transaction pattern detected",
    status: "new",
    riskScore: 81,
    date: "2023-05-15T07:45:00Z",
  },
]

export function RecentAlertsTable() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)

  const totalPages = Math.ceil(mockAlerts.length / pageSize)
  const paginatedAlerts = mockAlerts.slice((page - 1) * pageSize, page * pageSize)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            New
          </Badge>
        )
      case "reviewing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Eye className="mr-1 h-3 w-3" />
            Reviewing
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        )
      case "dismissed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <XCircle className="mr-1 h-3 w-3" />
            Dismissed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    }
  }

  const getRiskBadge = (score: number) => {
    if (score >= 90) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
          Critical ({score})
        </Badge>
      )
    } else if (score >= 75) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
          High ({score})
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          Medium ({score})
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
              <TableHead>Alert ID</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.id}</TableCell>
                <TableCell>{alert.transactionId}</TableCell>
                <TableCell>{alert.userName}</TableCell>
                <TableCell>{alert.description}</TableCell>
                <TableCell>{getStatusBadge(alert.status)}</TableCell>
                <TableCell>{getRiskBadge(alert.riskScore)}</TableCell>
                <TableCell>{formatDate(alert.date)}</TableCell>
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
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, mockAlerts.length)} of {mockAlerts.length}{" "}
          alerts
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

