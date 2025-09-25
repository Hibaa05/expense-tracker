// scheduler/recurringJob.js
import cron from "node-cron";
import RecurringExpense from "../models/RecurringExpense.js";
import Expense from "../models/Expense.js";
import { addMonths, addWeeks, addYears, startOfDay } from "date-fns";

function advance(date, interval) {
  if (!date) return null;
  if (interval === "monthly") return addMonths(date, 1);
  if (interval === "weekly") return addWeeks(date, 1);
  if (interval === "yearly") return addYears(date, 1);
  return date;
}

export function startRecurringJob() {
  // run daily at 00:10 (server local time)
  cron.schedule("10 0 * * *", async () => {
    try {
      const today = startOfDay(new Date());
      // Find recurring items that are due (nextDate <= today)
      const due = await RecurringExpense.find({ active: true, nextDate: { $lte: today } });

      for (const r of due) {
        // create one or more missed occurrences (in case server was down)
        while (r.nextDate && r.nextDate <= today) {
          const expense = new Expense({
            title: r.title,
            amount: r.amount,
            category: r.category,
            user: r.user,
            createdAt: r.nextDate,
            updatedAt: r.nextDate,
          });
          await expense.save();

          r.nextDate = advance(r.nextDate, r.interval);
          // small safety: prevent infinite loop
          if (!r.nextDate) break;
        }
        await r.save();
      }
    } catch (err) {
      console.error("Recurring job error:", err);
    }
  }, { timezone: "Asia/Kolkata" }); // optional: set timezone to your users
}
