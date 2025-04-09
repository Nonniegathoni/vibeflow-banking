# Vibeflow Banking System

A secure banking system with advanced fraud detection for Kenyan users.

## Features

- User authentication and authorization
- Account management
- Transaction processing (deposits, withdrawals, transfers)
- Fraud detection and reporting
- Admin dashboard with analytics
- Responsive design

## Tech Stack

### Frontend
- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization

### Backend
- Node.js
- Express.js
- Postgre SQL
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Postgre SQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vibeflow-banking.git
cd vibeflow-banking  

2.Install dependencies
npm install

3.Create .env file in the root
DATABASE_URL=postgres://username:password@localhost:5432/vibeflow
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

4.🧾 Database Setup
 Create the database in PostgreSQL
CREATE DATABASE vibeflow;

5. Run schema setup script
Use the script at /scripts/setupDatabase.ts to automatically create all required tables:
ts-node scripts/setupDatabase.ts

Tables created:
users
transactions
fraud_alerts

6.🚀 Running the App
Start frontend and backend
npm run dev
The frontend will be available at: http://localhost:3000

📬 API Endpoints
Endpoint	Method	Description
/api/auth/register	POST	Register a new user
/api/auth/login	POST	Login and receive JWT token
/api/users/me	GET	Get current user info
/api/transactions	GET	View transaction history
/api/transactions/transfer	POST	Transfer funds to another user
/api/fraud-alerts	GET	Admin view of fraud cases

🔒 Authentication
All protected routes require a JWT token in the header:
Authorization: Bearer <token>

🧰 Project Structure
vibeflow-banking/
├── app/                   # Frontend pages (Next.js)
├── backend/
│   ├── controllers/
│   ├── models/            # Sequelize models
│   ├── routes/
│   ├── middleware/
│   └── config/            # DB connection (Sequelize)
├── components/            # Reusable frontend components
├── scripts/               # Setup and seed scripts
├── public/
├── .env
└── README.md
7.✅ Testing
Use Postman to test the APIs:
Pre-request scripts for login
Tests for response structure and token validation
You can also use:
npm run lint
To check for code issues.

8.📦 Build & Deploy
Build frontend:
npm run build

9.Start in production:
npm start
Deploy with:
Vercel – for the frontend
Railway, Render, or Heroku – for backend + PostgreSQL

📝 Author
Nonnie Gathoni
