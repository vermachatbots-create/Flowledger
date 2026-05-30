import { requireUserId } from "@/server/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  const userId = await requireUserId();
  const expenses = await db.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 50,
  });

  const monthlyTotal = expenses
    .filter((e) => {
      const now = new Date();
      return (
        e.date.getMonth() === now.getMonth() &&
        e.date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + parseFloat(e.amount.toString()), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This month: {formatCurrency(monthlyTotal)}
          </p>
        </div>
      </div>

      <ExpenseForm categories={EXPENSE_CATEGORIES} />

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground text-sm">No expenses recorded.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-medium text-sm">{expense.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {expense.category} · {expense.vendor ?? "—"} · {formatDate(expense.date)}
                      {expense.isRecurring && " · Recurring"}
                    </p>
                  </div>
                  <span className="font-semibold text-red-400">
                    -{formatCurrency(parseFloat(expense.amount.toString()))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
