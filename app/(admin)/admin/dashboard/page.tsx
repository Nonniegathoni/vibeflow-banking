"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Users, CreditCard, AlertTriangle, TrendingUp, Activity, DollarSign } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { RecentTransactionsTable } from "@/components/admin/RecentTransactionsTable"
import { RecentAlertsTable } from "@/components/admin/RecentAlertsTable"

// Mock data for dashboard
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const transactionData = [
  { name: "Mon", transactions: 120, flagged: 7 },
  { name: "Tue", transactions: 132, flagged: 12 },
  { name: "Wed", transactions: 101, flagged: 5 },
  { name: "Thu", transactions: 134, flagged: 9 },
  { name: "Fri", transactions: 190, flagged: 15 },
  { name: "Sat", transactions: 230, flagged: 11 },
  { name: "Sun", transactions: 170, flagged: 8 },
]

const riskScoreData = [
  { name: "Week 1", average: 23, highest: 82 },
  { name: "Week 2", average: 25, highest: 76 },
  { name: "Week 3", average: 18, highest: 67 },
  { name: "Week 4", average: 27, highest: 90 },
]

const fraudTypeData = [
  { name: "Account Takeover", value: 35 },
  { name: "Identity Theft", value: 20 },
  { name: "Transaction Fraud", value: 25 },
  { name: "Card Fraud", value: 15 },
  { name: "Other", value: 5 },
]

export default function AdminDashboardPage() {
  const { user } = useAdminAuth()
  const { toast } = useToast()
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [stats, setStats] = useState({
    totalUsers: 1245,
    activeUsers: 876,
    totalTransactions: 8432,
    flaggedTransactions: 127,
    resolvedAlerts: 98,
    pendingAlerts: 29,
    transactionVolume: 4325000,
    averageRiskScore: 24,
  })

  useEffect(() => {
    // In a real app, we would fetch this data from the API
    toast({
      title: "Dashboard Loaded",
      description: `Welcome back, ${user?.name || "Admin"}!`,
      duration: 3000,
    })
  }, [toast, user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "Admin"}. Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers.toLocaleString()} active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSH {stats.transactionVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.totalTransactions.toLocaleString()} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAlerts}</div>
            <p className="text-xs text-muted-foreground">{stats.resolvedAlerts} resolved this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRiskScore}</div>
            <p className="text-xs text-muted-foreground">Threshold for flagging: 75</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Daily transaction volume compared to flagged transactions</CardDescription>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={period === "daily" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod("daily")}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={period === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod("weekly")}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={period === "monthly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod("monthly")}
                  >
                    Monthly
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="transactions" fill="#3b82f6" name="Total Transactions" />
                    <Bar dataKey="flagged" fill="#ef4444" name="Flagged Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Fraud Type Distribution</CardTitle>
                <CardDescription>Breakdown of fraud types detected</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fraudTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fraudTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, "Cases"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Trends</CardTitle>
                <CardDescription>Weekly average and highest risk scores</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskScoreData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="average" stroke="#3b82f6" name="Average Score" />
                    <Line type="monotone" dataKey="highest" stroke="#ef4444" name="Highest Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Users className="h-5 w-5" />
                    <span>Manage Users</span>
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Review Alerts</span>
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Transactions</span>
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>A list of recent transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactionsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
              <CardDescription>Recent fraud alerts that require attention</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAlertsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

