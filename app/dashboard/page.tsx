"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import DashboardMetrics from "@/components/DashboardMetrics"

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 bg-gray-50">
                {/* Header */}
                <header className="flex items-center justify-between border-b bg-white px-6 py-4">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button className="rounded-full bg-gray-100 p-2">
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    3
                                </span>
                                <span className="sr-only">Notifications</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="p-6">
                    <h1 className="mb-6 text-2xl font-bold">Dashboard Overview</h1>
                    <DashboardMetrics />
                </div>
            </main>
        </div>
    )
}

