import { Users, Wallet, Clock } from "lucide-react"
import { formatKES } from "@/utils/format"
import type React from "react" // Added import for React

interface MetricCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    change: number
    isCurrency?: boolean
}

function MetricCard({ title, value, icon: Icon, change, isCurrency }: MetricCardProps) {
    const formattedValue = isCurrency ? formatKES(Number(value)) : value
    const isPositive = change > 0

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-semibold">{formattedValue}</p>
                        <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? "+" : ""}
                            {change}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DashboardMetrics() {
    const metrics = [
        {
            title: "Current Balance",
            value: 15750.5,
            icon: Wallet,
            change: 5,
            isCurrency: true,
        },
        {
            title: "Total Users",
            value: "1,254",
            icon: Users,
            change: 12,
        },
        {
            title: "Pending Transactions",
            value: "2",
            icon: Clock,
            change: -2,
        },
    ]

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
            ))}
        </div>
    )
}

