// app/admin/page.tsx
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Users, CreditCard, AlertTriangle, MessageSquare, TrendingUp } from 'lucide-react';

async function getAdminSummary() {
  // This would fetch from your database
  return {
    totalUsers: 124,
    totalTransactions: 1458,
    fraudAlerts: 17,
    supportTickets: 8,
    recentUsers: [
      { id: 1, name: 'John Doe', email: 'john@example.com', date: '2023-04-01' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2023-04-02' },
      { id: 3, name: 'Robert Johnson', email: 'robert@example.com', date: '2023-04-03' },
    ]
  };
}

export default async function AdminDashboard() {
  const session = await getSession();
  
  // Check if user is admin
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  const summary = await getAdminSummary();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Total Users</h2>
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold">{summary.totalUsers}</p>
          <p className="text-sm text-gray-500 mt-2">Registered accounts</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Transactions</h2>
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold">{summary.totalTransactions}</p>
          <p className="text-sm text-gray-500 mt-2">Total processed</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Fraud Alerts</h2>
            <AlertTriangle className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-amber-500">{summary.fraudAlerts}</p>
          <p className="text-sm text-gray-500 mt-2">Requiring review</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Support Tickets</h2>
            <MessageSquare className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold">{summary.supportTickets}</p>
          <p className="text-sm text-gray-500 mt-2">Open tickets</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">System Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">System operational</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Database connected</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">API services running</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm text-gray-600">Fraud detection system: High load</span>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">System Load</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>70%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Transaction Overview</h2>
          <TrendingUp className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Transaction chart will be displayed here</p>
        </div>
      </Card>
    </div>
  );
}