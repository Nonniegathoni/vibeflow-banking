import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Transaction extends Model {
  public id!: number;
  public sender_id!: number;
  public recipient_id!: number;
  public amount!: number;
  public type!: string;
  public status!: string;
  public description?: string;
  public reference?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('transfer', 'deposit', 'withdrawal'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
  }
);

// Define associations
Transaction.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Transaction.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

export default Transaction;