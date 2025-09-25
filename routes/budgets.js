// routes/budgets.js
import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import auth from "../middleware/auth.js";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";

const router = express.Router();

// Create budget
router.post("/", auth, async (req, res) => {
  try {
    const { name, amount, period = "monthly", category, startDate } = req.body;
    if (!amount) return res.status(400).json({ error: "amount required" });
    const b = new Budget({ user: req.user.id, name, amount, period, category, startDate });
    await b.save();
    res.json(b);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List budgets
router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get budget progress (spent vs budget) for the *current* period
router.get("/:id/progress", auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget || budget.user.toString() !== req.user.id) return res.status(404).json({ error: "Not found" });

    const now = new Date();
    let start, end;
    if (budget.period === "monthly") {
      start = startOfMonth(now); end = endOfMonth(now);
    } else if (budget.period === "weekly") {
      start = startOfWeek(now); end = endOfWeek(now);
    } else {
      start = startOfYear(now); end = endOfYear(now);
    }

    const match = { user: req.user.id, createdAt: { $gte: start, $lte: end } };
    if (budget.category) match.category = budget.category;

    const expenses = await Expense.find(match);
    const spent = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    res.json({
      budget,
      spent,
      remaining: Math.max(0, budget.amount - spent),
      percentUsed: budget.amount ? Math.round((spent / budget.amount) * 10000) / 100 : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
