'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, AlertTriangle, FileText, Settings, MessageSquare, BarChart3 } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { name: 'Fraud Alerts', href: '/admin/alerts', icon: AlertTriangle },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Support Tickets', href: '/admin/tickets', icon: MessageSquare },
    { name: 'System Config', href: '/admin/config', icon: Settings },
  ];
  
  return (
    <aside className="w-64 bg-gray-900 text-white hidden md:block">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Vibeflow</h2>
        <p className="text-gray-400 text-sm">Admin Panel</p>
      </div>
      
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm ${
                    isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 bg-gray-800">
        <Link href="/dashboard" className="flex items-center text-sm text-gray-300 hover:text-white">
          <BarChart3 className="h-5 w-5 mr-2" />
          Switch to User View
        </Link>
      </div>
    </aside>
  );
}