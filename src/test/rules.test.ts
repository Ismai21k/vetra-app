import { describe, expect, it } from "vitest";
import { daysUntil, reminderState, sumTransactions } from "@/lib/data";

describe("reminders", () => {
  it("a pending reminder dated before today is overdue", () => {
    expect(reminderState({ status: "pending", due_date: "2026-01-09" }, "2026-01-10")).toBe("overdue");
  });
  it("a pending reminder dated today is upcoming", () => {
    expect(reminderState({ status: "pending", due_date: "2026-01-10" }, "2026-01-10")).toBe("upcoming");
  });
  it("counts days until due", () => {
    expect(daysUntil("2026-03-03", "2026-02-27")).toBe(4);
  });
});

describe("finance", () => {
  it("net balance is income minus expenses", () => {
    expect(sumTransactions([{ kind: "income", amount: "70000" }, { kind: "expense", amount: 35000 }, { kind: "expense", amount: 8500 }]))
      .toEqual({ income: 70000, expense: 43500, net: 26500 });
  });
});
