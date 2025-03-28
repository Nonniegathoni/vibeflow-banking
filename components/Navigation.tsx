import React from 'react';
import Link from 'next/link';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Vibeflow
        </Link>
        <div className="space-x-4">
          <Link href="/dashboard" className="hover:text-blue-200">
            Dashboard
          </Link>
          <Link href="/transactions" className="hover:text-blue-200">
            Transactions
          </Link>
          <Link href="/settings" className="hover:text-blue-200">
            Settings
          </Link>
          <Link href="/logout" className="hover:text-blue-200">
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

