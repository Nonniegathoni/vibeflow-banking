import React from 'react';

interface UserData {
  name: string;
  accountNumber: string;
  balance: number;
  lastLogin: string;
}

interface AccountSummaryProps {
  userData: UserData | null;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ userData }) => {
  if (!userData) return <div>Loading account data...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
      <div className="space-y-2">
        <p>Name: {userData.name}</p>
        <p>Balance: Kshs {userData.balance.toLocaleString()}</p>
        <p>Account Number: {userData.accountNumber}</p>
        <p>Last Login: {new Date(userData.lastLogin).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AccountSummary;

