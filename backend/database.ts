// Import models and database connection
import sequelize from './config/database';
import './models/User';  // Import all models
import './models/Transaction';
import { setupAssociations } from './models/associations'

// Set up model associations
setupAssociations();

// Sync database (be careful with force in production)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Failed to synchronize database:', error);
  }
};

// Export or call the sync function as needed
export default syncDatabase;