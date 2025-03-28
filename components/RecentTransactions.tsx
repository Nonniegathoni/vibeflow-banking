import React from 'react';

interface Transaction {
  _id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: string;
  isSuspicious: boolean;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p>No recent transactions.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.slice(0, 5).map(transaction => (
            <li key={transaction._id} className={`flex justify-between ${transaction.isSuspicious ? 'text-red-600' : ''}`}>
              <span>{new Date(transaction.date).toLocaleDateString()} - {transaction.description}</span>
              <span className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                Kshs {Math.abs(transaction.amount).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentTransactions;

