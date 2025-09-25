// routes/recurring.js
import express from "express";
import RecurringExpense from "../models/RecurringExpense.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { title, amount, category, interval = "monthly", nextDate } = req.body;
    if (!title || !amount || !nextDate) return res.status(400).json({ error: "title, amount, nextDate required" });
    const r = new RecurringExpense({ user: req.user.id, title, amount, category, interval, nextDate });
    await r.save();
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  const items = await RecurringExpense.find({ user: req.user.id });
  res.json(items);
});

// Pause/resume
router.patch("/:id/toggle", auth, async (req, res) => {
  const r = await RecurringExpense.findById(req.params.id);
  if (!r || r.user.toString() !== req.user.id) return res.status(404).json({ error: "Not found" });
  r.active = !r.active;
  await r.save();
  res.json(r);
});

export default router;
