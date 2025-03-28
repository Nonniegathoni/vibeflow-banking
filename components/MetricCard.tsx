interface MetricCardProps {
    title: string
    value: string | number
    change: number
}

export default function MetricCard({ title, value, change }: MetricCardProps) {
    const isPositive = change > 0
    const changeText = `${isPositive ? "+" : ""}${change}%`

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{value}</span>
                <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>{changeText}</span>
            </div>
        </div>
    )
}

