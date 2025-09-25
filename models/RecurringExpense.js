// models/RecurringExpense.js
import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  interval: { type: String, enum: ["monthly", "weekly", "yearly"], default: "monthly" },
  nextDate: { type: Date, required: true }, // when the next instance should be created
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("RecurringExpense", recurringSchema);
