import { useEffect, useState } from "react";
import { Delete02Icon, MoneyBag02Icon } from "hugeicons-react";
import { listExpenses, createExpense, deleteExpense } from "@/lib/expenses";

function formatCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);
}

export default function BudgetSection({ projectId, budget, canEdit, onBudgetChange }) {
  const [expenses, setExpenses] = useState(null);
  const [total, setTotal] = useState(0);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listExpenses(projectId).then((data) => {
      setExpenses(data.expenses);
      setTotal(data.total);
    });
  }, [projectId]);

  async function handleAdd(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || Number.isNaN(value)) return;
    setSaving(true);
    try {
      const expense = await createExpense(projectId, {
        description: description.trim(),
        amount: value,
        category: category.trim() || "General",
      });
      setExpenses((prev) => [expense, ...prev]);
      setTotal((prev) => prev + expense.amount);
      setDescription("");
      setAmount("");
      setCategory("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expense) {
    if (!window.confirm("Delete this expense?")) return;
    await deleteExpense(expense._id);
    setExpenses((prev) => prev.filter((e) => e._id !== expense._id));
    setTotal((prev) => prev - expense.amount);
  }

  const remaining = budget != null ? budget - total : null;
  const percentUsed = budget ? Math.min(100, Math.round((total / budget) * 100)) : 0;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <MoneyBag02Icon size={18} strokeWidth={1.8} />
        Budget
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-(--color-text-muted)">Total budget</span>
        <input
          type="number"
          value={budget ?? ""}
          disabled={!canEdit}
          placeholder="Not set"
          onChange={(e) => onBudgetChange(e.target.value ? Number(e.target.value) : null)}
          className="w-32 rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1.5 text-sm outline-none disabled:opacity-60"
        />
      </div>

      {budget != null && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs text-(--color-text-muted)">
            <span>
              Spent {formatCurrency(total)} of {formatCurrency(budget)}
            </span>
            <span className={remaining < 0 ? "font-medium text-red-500" : ""}>
              {remaining < 0 ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${percentUsed >= 100 ? "bg-red-500" : "bg-(--color-accent)"}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      )}

      {canEdit && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-center gap-2">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Expense description"
            className="min-w-0 flex-1 rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1.5 text-sm outline-none"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="w-28 rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1.5 text-sm outline-none"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-24 rounded-md border border-(--color-border) bg-(--color-canvas) px-2 py-1.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={saving || !amount}
            className="rounded-md bg-(--color-accent) px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      <div className="flex flex-col gap-1">
        {expenses === null && (
          <div className="py-4 text-center text-xs text-(--color-text-muted)">Loading…</div>
        )}
        {expenses?.length === 0 && (
          <div className="py-4 text-center text-xs text-(--color-text-muted)">No expenses logged yet.</div>
        )}
        {expenses?.map((e) => (
          <div
            key={e._id}
            className="group flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{e.description || e.category}</div>
              <div className="text-xs text-(--color-text-muted)">
                {e.category} · {new Date(e.date).toLocaleDateString()} · {e.createdBy?.name}
              </div>
            </div>
            <span className="shrink-0 tabular-nums">{formatCurrency(e.amount)}</span>
            {canEdit && (
              <button
                type="button"
                onClick={() => handleDelete(e)}
                className="shrink-0 rounded-md p-1 text-(--color-text-muted) opacity-0 hover:bg-black/5 group-hover:opacity-100 dark:hover:bg-white/10"
              >
                <Delete02Icon size={14} strokeWidth={1.8} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
