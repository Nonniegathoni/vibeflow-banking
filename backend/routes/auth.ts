import { type Request, type Response, type NextFunction, Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from "../config/database" // Assuming 'pool' is your intended 'db' object
// If 'db' is truly different, you'll need to import/configure it instead of pool here.

const router = Router()

// Register a new user (This part remains unchanged from your original code)
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const result = await pool.query(
      "INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role",
      [email, hashedPassword, firstName, lastName, "user"],
    )

    const user = result.rows[0]

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // Original JWT payload kept for register
      process.env.JWT_SECRET || "default_secret", // Original secret kept for register
      { expiresIn: "1d" }, // Original expiry kept for register
    )

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name, // Using original response field names for register
        lastName: user.last_name,
        role: user.role,
      },
    })
  } catch (error) {
    next(error) // Original error handling kept for register
  }
})

// Login user (This part is updated based on your second snippet)
router.post('/login', async (req: Request, res: Response) => { // Removed 'next' as it's not used in the new logic's catch block
  try {
    const { email, password } = req.body;

    // Verify user exists - Using 'pool' from the original code's import
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]); // Renamed 'user' to 'userResult' to avoid conflict

    if (userResult.rows.length === 0) {
      // Using error format from the second snippet
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0]; // Extracted user data

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Using error format from the second snippet
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token - Using payload, secret fallback, and expiry from the second snippet
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload from second snippet
      process.env.JWT_SECRET || 'your-secret-key', // Secret fallback from second snippet
      { expiresIn: '1h' } // Expiry from second snippet
    );

    // Return user data and token - Using structure from the second snippet
    // NOTE: Assumes your 'users' table has 'first_name', 'last_name', and 'phone' columns
    // The original SELECT * will fetch them if they exist.
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name, // snake_case from second snippet
        last_name: user.last_name,   // snake_case from second snippet
        phone: user.phone          // phone field from second snippet
      }
    });
  } catch (error) {
    console.error(error); // Error handling from the second snippet
    // Error response format from the second snippet
    return res.status(500).json({ error: 'Server error' });
  }
});


export default router // This part remains unchanged