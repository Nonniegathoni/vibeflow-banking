'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, AlertTriangle, Settings, HelpCircle, Shield, Bell } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    { name: 'Fraud Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
    { name: 'Security', href: '/dashboard/security', icon: Shield },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Help & Support', href: '/dashboard/support', icon: HelpCircle },
  ];
  
  return (
    <aside className="w-64 bg-indigo-800 text-white hidden md:block">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Vibeflow</h2>
        <p className="text-indigo-200 text-sm">Banking System</p>
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
                      ? 'bg-indigo-900 text-white' 
                      : 'text-indigo-100 hover:bg-indigo-700'
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
    </aside>
  );
}