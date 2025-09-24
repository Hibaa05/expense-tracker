import express from "express";
import Expense from "../models/Expense.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Add Expense
router.post("/", auth, async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    if (!title || !amount) return res.status(400).json({ error: "Title and amount required" });

    const expense = new Expense({ title, amount, category, user: req.user.id });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Expenses
router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
