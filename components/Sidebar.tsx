"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, LayoutDashboard, Receipt, Settings, LogOut, ChevronLeft, AlertTriangle, Users } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"

const userNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Settings", href: "/settings", icon: Settings },
]

const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Fraud Alerts", href: "/admin/alerts", icon: AlertTriangle },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

interface SidebarProps {
    className?: string
}

export default function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const { user, setUser } = useUser()
    const router = useRouter()
    const isAdmin = user?.role === "admin"
    const navItems = isAdmin ? adminNavItems : userNavItems

    const handleLogout = () => {
        // Clear user data
        setUser(null)
        // Clear local storage
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // Redirect to login
        router.push("/")
    }

    return (
        <div
            className={cn(
                "flex flex-col bg-[#1a1f2e] text-white transition-all duration-300",
                collapsed ? "w-20" : "w-64",
                className,
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 p-6">
                <Shield className="h-8 w-8 text-blue-500" />
                {!collapsed && <span className="text-xl font-semibold">Vibeflow</span>}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-blue-600/10 hover:text-white",
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-700 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-700" />
                    {!collapsed && (
                        <div>
                            <p className="font-medium">{user?.name || "User"}</p>
                            <p className="text-sm text-gray-400">{isAdmin ? "Administrator" : "User"}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 border-t border-gray-700 px-6 py-4 text-gray-400 hover:text-white"
            >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span>Logout</span>}
            </button>

            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-2 border-t border-gray-700 p-4 text-gray-400 hover:text-white"
            >
                <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
                {!collapsed && <span>Collapse</span>}
            </button>
        </div>
    )
}

