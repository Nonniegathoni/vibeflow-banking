import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';
// Import Transaction model
import Transaction from './Transaction'; // This should come after defining Transaction to avoid circular dependencies

class User extends Model {
  // Define types for properties
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone_number?: string;
  public role!: string;
  public account_number?: string;
  public balance?: number;
  public last_login?: Date;

  // Instance method for password comparison
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        // Hash password before saving
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        
        // Generate account number if not provided
        if (!user.account_number) {
          // Generate a 10-digit account number
          user.account_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        }
      },
      beforeUpdate: async (user: User) => {
        // Hash password on update if changed
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);


export default User;

