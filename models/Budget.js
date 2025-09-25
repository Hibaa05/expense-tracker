// models/Budget.js
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "Budget" },
    category: { type: String }, // optional: limit to categories you use
    amount: { type: Number, required: true },
    period: { type: String, enum: ["monthly", "weekly", "yearly"], default: "monthly" },
    startDate: { type: Date, default: () => new Date() }, // optional
    endDate: { type: Date }, // optional
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
