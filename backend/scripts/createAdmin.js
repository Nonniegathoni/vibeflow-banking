import dotenv from "dotenv"
import Admin from "../models/Admin.js"
import sequelize from "../config/database.js"

dotenv.config()

async function createAdminUser() {
    try {
        await sequelize.authenticate()
        console.log("Connected to the database.")

        const adminUser = await Admin.create({
            username: "admin",
            password: "adminpassword",
            email: "admin@example.com",
            role: "admin",
        })

        console.log("Admin user created successfully:", adminUser.toJSON())
    } catch (error) {
        console.error("Error creating admin user:", error)
    } finally {
        await sequelize.close()
    }
}

createAdminUser()

