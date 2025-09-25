import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import expensesRoutes from "./routes/expenses.js";

import budgetsRoutes from "./routes/budgets.js";
app.use("/api/budgets", budgetsRoutes);

import recurringRoutes from "./routes/recurring.js";
app.use("/api/recurring", recurringRoutes);


dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expensesRoutes);

// Test route
app.get("/test", (req, res) => {
  res.send("Backend is working!");
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


import { startRecurringJob } from "./scheduler/recurringJob.js";

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    startRecurringJob(); // start only after DB connected
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));
