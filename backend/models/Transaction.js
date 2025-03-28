import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"
import User from "./User.js"

const Transaction = sequelize.define("Transaction", {
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("deposit", "withdrawal"),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: "KES",
    },
    isSuspicious: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
})

Transaction.belongsTo(User)
User.hasMany(Transaction)

export default Transaction

