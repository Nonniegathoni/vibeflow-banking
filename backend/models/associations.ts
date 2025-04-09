// models/associations.ts
import User from './User';
import Transaction from './Transaction';

// Set up associations between models
export const setupAssociations = () => {
  // User associations
  User.hasMany(Transaction, { foreignKey: 'sender_id', as: 'sentTransactions' });
  User.hasMany(Transaction, { foreignKey: 'recipient_id', as: 'receivedTransactions' });

  // Transaction associations
  Transaction.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
  Transaction.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });
};