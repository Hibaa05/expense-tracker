// at top of routes/expenses.js
import multer from "multer";
import { parse } from "csv-parse/sync"; // sync parser easier to handle from buffer

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// CSV Upload endpoint
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "CSV file required (form field 'file')" });

    const text = req.file.buffer.toString("utf8");
    // parse with header row -> returns array of objects keyed by header
    const records = parse(text, { columns: true, skip_empty_lines: true, trim: true });

    const toInsert = [];
    for (const row of records) {
      // Try common column names; adapt to your CSV format
      const title = row.title || row.description || row["Description"] || "Imported";
      let amountRaw = row.amount || row.Amount || row["Amount"] || row.value || row["Value"] || "0";
      // strip currency symbols and commas
      amountRaw = (amountRaw + "").replace(/[^0-9.\-]+/g, "");
      const amount = parseFloat(amountRaw) || 0;
      const category = row.category || row.Category || "Uncategorized";
      const date = row.date || row.Date ? new Date(row.date || row.Date) : new Date();

      toInsert.push({ title, amount, category, createdAt: date, user: req.user.id });
    }

    if (toInsert.length === 0) return res.status(400).json({ error: "No transactions found in CSV" });

    // bulk insert
    const inserted = await Expense.insertMany(toInsert);
    res.json({ inserted: inserted.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


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
