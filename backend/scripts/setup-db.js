import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibeflow';

async function setupDatabase() {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db('vibeflow');

    // Create collections
    await db.createCollection('users');
    await db.createCollection('transactions');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ accountNumber: 1 }, { unique: true });

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    await db.collection('users').insertOne({
      name: 'Test User',
      email: '21051185@students.lkc.ac',
      password: hashedPassword,
      phone: '+254700000000',
      accountNumber: '1234567890',
      balance: 10000,
      emailAlerts: true,
      smsAlerts: false,
      twoFactorAuth: false,
      lastLogin: new Date()
    });

    console.log('Database setup completed successfully');
    await client.close();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();

