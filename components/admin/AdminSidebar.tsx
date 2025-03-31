"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  ShieldAlert,
  Bell,
  BarChart3,
  Settings,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface SidebarItem {
  title: string
  href?: string
  icon: React.ReactNode
  submenu?: { title: string; href: string }[]
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAdminAuth()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    users: true,
    fraud: true,
  })

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "User Management",
      icon: <Users className="h-5 w-5" />,
      submenu: [
        { title: "All Users", href: "/admin/users" },
        { title: "User Roles", href: "/admin/users/roles" },
        { title: "Password Reset", href: "/admin/users/password-reset" },
      ],
    },
    {
      title: "Fraud Management",
      icon: <ShieldAlert className="h-5 w-5" />,
      submenu: [
        { title: "Transactions", href: "/admin/fraud/transactions" },
        { title: "Flagged Transactions", href: "/admin/fraud/flagged" },
        { title: "Fraud Rules", href: "/admin/fraud/rules" },
      ],
    },
    {
      title: "Alerts & Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: "/admin/alerts",
    },
    {
      title: "Reports & Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      submenu: [
        { title: "Transaction Reports", href: "/admin/reports/transactions" },
        { title: "Fraud Trends", href: "/admin/reports/fraud-trends" },
        { title: "Audit Logs", href: "/admin/reports/audit-logs" },
      ],
    },
    {
      title: "System Settings",
      icon: <Settings className="h-5 w-5" />,
      submenu: [
        { title: "Security Settings", href: "/admin/settings/security" },
        { title: "API Management", href: "/admin/settings/api" },
        { title: "Backup & Restore", href: "/admin/settings/backup" },
      ],
    },
    {
      title: "Customer Support",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/admin/support",
    },
  ]

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title.toLowerCase()]: !prev[title.toLowerCase()],
    }))
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
      <div className="flex flex-col flex-grow border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-primary">Vibeflow Admin</h1>
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {sidebarItems.map((item) => (
              <div key={item.title} className="space-y-1">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md",
                      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    {openMenus[item.title.toLowerCase()] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                {item.submenu && openMenus[item.title.toLowerCase()] && (
                  <div className="ml-6 space-y-1 mt-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                          pathname === subItem.href
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                        )}
                      >
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

