-- 1. View all users with essential information
SELECT id, email, first_name, last_name, phone, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Find specific user (use this to verify registration worked)
SELECT * FROM users 
WHERE email = 'nonniegathoni20@outlook.com';

-- 3. Count total users
SELECT COUNT(*) AS total_users FROM users;

-- 4. View user registration dates
SELECT DATE(created_at) AS registration_date, COUNT(*) AS users_registered
FROM users
GROUP BY DATE(created_at)
ORDER BY registration_date DESC;

-- 5. Check database schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 6. Check if there are any transactions
SELECT COUNT(*) FROM transactions;

-- 7. Check if there are any fraud reports
SELECT COUNT(*) FROM fraud_reports;

-- Add phone column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);