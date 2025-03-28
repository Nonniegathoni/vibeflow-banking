import sequelize from "./config/database.js"
import "./models/User.js"
import "./models/Transaction.js"

async function syncDatabase() {
    try {
        await sequelize.sync({ force: true })
        console.log("Database synced successfully")
    } catch (error) {
        console.error("Error syncing database:", error)
        if (error.parent) {
            console.error("Detailed error:", error.parent)
        }
    } finally {
        await sequelize.close()
    }
}

syncDatabase()

