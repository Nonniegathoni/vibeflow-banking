import { AlertTriangle, AlertCircle, Info } from "lucide-react"

interface Alert {
    id: string
    risk: "high" | "medium" | "low"
    message: string
    time: string
}

const alerts: Alert[] = [
    {
        id: "1",
        risk: "high",
        message: "Unusual transaction pattern detected",
        time: "2 minutes ago",
    },
    {
        id: "2",
        risk: "medium",
        message: "Login attempt from new device",
        time: "15 minutes ago",
    },
    {
        id: "3",
        risk: "low",
        message: "Large transfer initiated",
        time: "1 hour ago",
    },
]

const riskConfig = {
    high: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50" },
    medium: { icon: AlertCircle, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    low: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-50" },
}

export default function RecentAlerts() {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-4">
                {alerts.map((alert) => {
                    const { icon: Icon, color, bgColor } = riskConfig[alert.risk]
                    return (
                        <div key={alert.id} className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${bgColor}`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className={`font-medium ${color}`}>
                                    {alert.risk.charAt(0).toUpperCase() + alert.risk.slice(1)} Risk
                                </p>
                                <p className="text-gray-600">{alert.message}</p>
                                <p className="text-sm text-gray-400">{alert.time}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

