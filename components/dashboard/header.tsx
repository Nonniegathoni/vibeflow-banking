'use client';

import Link from 'next/link';
import { Bell, User, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';

export function Header({ user }: { user: any }) {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-indigo-700">Vibeflow Banking System</h1>
      
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/notifications" className="p-2 rounded-full hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </Link>
        
        <div className="relative group">
          <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {user?.first_name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium">{user?.first_name || 'User'}</span>
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
            <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Profile
            </Link>
            <Link href="/dashboard/security" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Security
            </Link>
            <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Settings
            </Link>
            <button 
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}