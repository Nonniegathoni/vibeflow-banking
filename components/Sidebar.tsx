"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Settings, LogOut } from 'lucide-react'; // Example icons
import { useUser } from '@/contexts/UserContext'; // To use logout

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useUser(); // Get logout function

    const userLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
        { href: '/settings', label: 'Settings', icon: Settings },
        // Add other user links: Send Money, Bills, M-PESA etc.
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <aside className="w-64 bg-white border-r flex flex-col min-h-screen">
            <div className="p-4 border-b">
                 {/* Replace with your Logo Component/Image */}
                <h1 className="text-xl font-bold text-blue-600">Vibeflow</h1>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                {userLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive(link.href)
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t mt-auto">
                 {user && (
                     <div className='mb-4 p-2 border rounded text-center'>
                        <p className='text-sm font-medium'>{user.first_name || user.name || 'User'}</p>
                        <p className='text-xs text-gray-500'>{user.email}</p>
                     </div>
                 )}
                <button
                    onClick={logout} // Call logout from context
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}