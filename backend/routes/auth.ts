import { type Request, type Response, type NextFunction, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Import the Sequelize User model

const router = Router();

// Register a new user
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone_number } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    
    // Check if user already exists using Sequelize
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }
    
    // Create user using Sequelize Model
    const newUser = await User.create({
      name,
      email,
      password, // Password will be hashed via User model hooks
      phone_number
    });
    
    // User data to return (exclude password)
    const userData = newUser.get({ plain: true });
    // Instead of using delete operator, create a new object without the password
    const { password: _, ...userWithoutPassword } = userData;
    
    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );
    
    // Send response
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e: any) => e.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    
    console.error("Registration Error:", error.message);
    next(error);
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Verify user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login timestamp
    user.last_login = new Date();
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Return user data without password
    const userData = user.get({ plain: true });
    // Use destructuring to omit the password field
    const { password: _, ...userWithoutPassword } = userData;
    
    // Set token in cookie and response
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 1000
    });
    
    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;