import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FraudAlertAttributes {
  id: string;
  userId: string;
  transactionId: string;
  description: string;
  status: 'new' | 'reviewing' | 'resolved' | 'dismissed';
  timestamp: Date;
  riskScore: number;
  resolution?: string;
}

interface FraudAlertCreationAttributes extends Optional<FraudAlertAttributes, 'id' | 'timestamp' | 'status'> {}

class FraudAlert extends Model<FraudAlertAttributes, FraudAlertCreationAttributes> implements FraudAlertAttributes {
  public id!: string;
  public userId!: string;
  public transactionId!: string;
  public description!: string;
  public status!: 'new' | 'reviewing' | 'resolved' | 'dismissed';
  public timestamp!: Date;
  public riskScore!: number;
  public resolution?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FraudAlert.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Transactions',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'reviewing', 'resolved', 'dismissed'),
      defaultValue: 'new',
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    riskScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    resolution: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'FraudAlert',
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['riskScore'] },
    ],
  }
);

export default FraudAlert;