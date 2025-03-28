import React from 'react';

interface Transaction {
  _id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: string;
  isSuspicious: boolean;
}

interface FraudAlertsProps {
  transactions: Transaction[];
}

const FraudAlerts: React.FC<FraudAlertsProps> = ({ transactions }) => {
  const suspiciousTransactions = transactions.filter(t => t.isSuspicious);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Fraud Alerts</h2>
      {suspiciousTransactions.length === 0 ? (
        <p>No current fraud alerts.</p>
      ) : (
        <ul className="space-y-2">
          {suspiciousTransactions.map(transaction => (
            <li key={transaction._id} className="text-red-600">
              <p>Suspicious {transaction.type} of Kshs {transaction.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FraudAlerts;

