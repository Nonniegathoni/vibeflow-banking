import { type Request, type Response, type NextFunction, Router } from "express";
import { auth } from "../middleware/auth";
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize'; 

const router = Router();

// Define allowed sort columns and map them to actual database columns if needed
const allowedSortColumns: { [key: string]: string } = {
  date: '"createdAt"', 
  amount: 'amount'
};

// Get transactions for a user
router.get("/", auth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Get query parameters and validate/sanitize them
    const queryLimit = parseInt(req.query.limit as string || '10', 10);
    const queryOffset = parseInt(req.query.offset as string || '0', 10);
    const sortInput = req.query.sort as string || 'date';
    const orderInput = req.query.order as string || 'desc';

    const limit = Math.max(1, queryLimit); // Ensure limit is at least 1
    const offset = Math.max(0, queryOffset); // Ensure offset is non-negative

    // Validate sort column
    const sortColumn = allowedSortColumns[sortInput.toLowerCase()] || allowedSortColumns.date; // Default to date if invalid

    // Validate order direction
    const order = orderInput.toLowerCase() === 'asc' ? 'ASC' : 'DESC'; // Default to DESC

    // Define the expected result type 
    type TransactionResult = any[];

    const result = await sequelize.query<TransactionResult>(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY ${sortColumn} ${order}
       LIMIT $2 OFFSET $3`,
      {
        replacements: [userId, limit, offset],
        type: QueryTypes.SELECT
      }
    );

    // The result is the array of transactions directly
    res.json({ transactions: result });

  } catch (error) {
    console.error("Error fetching transactions:", error); // Log the error for debugging
    next(error);
  }
});

export default router;