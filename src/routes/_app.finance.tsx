import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Chips, FieldLabel, FormDialog, PageHeader, SelectInput, TextInput } from "@/components/vetra";
import { formatDate, formatMoney, sumTransactions, todayISO, useDelete, useInsert, useList, useProfile } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/finance")({
  head: () => ({ meta: [{ title: "Financial Records — Vetra" }, { name: "description", content: "Track farm income and expenses in naira." }] }),
  component: Finance,
});

const categories = {
  expense: ["Feed", "Veterinary services", "Medicines", "Vaccinations", "Equipment", "Transportation", "Labour", "Other"],
  income: ["Livestock sale", "Eggs", "Milk", "Fish sale", "Other"],
};

function Finance() {
  const { t } = useT();
  const tx = useList("transactions");
  const profile = useProfile();
  const ins = useInsert("transactions");
  const del = useDelete("transactions");
  const cur = profile.data?.currency ?? "NGN";
  const [period, setPeriod] = useState<"month" | "year" | "all">("month");
  const [kind, setKind] = useState<"expense" | "income" | null>(null);
  const [f, setF] = useState({ category: "", amount: "", tx_date: todayISO(), description: "" });

  const today = todayISO();
  const rows = (tx.data ?? []).filter((r) => period === "all" || r.tx_date.slice(0, period === "month" ? 7 : 4) === today.slice(0, period === "month" ? 7 : 4));
  const s = sumTransactions(rows);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(f.amount);
    if (!(amount > 0)) { toast.error("Enter an amount greater than 0"); return; }
    await ins.mutateAsync({ kind: kind!, category: f.category || categories[kind!][0]!, amount, tx_date: f.tx_date, description: f.description || null });
    toast.success(t("saved"));
    setKind(null);
    setF({ category: "", amount: "", tx_date: todayISO(), description: "" });
  };

  return (
    <>
      <PageHeader back title={t("finance")} />
      <div className="space-y-4 px-4 pt-4">
        <Chips value={period} onChange={setPeriod} options={[{ value: "month", label: "This month" }, { value: "year", label: "This year" }, { value: "all", label: "All time" }]} />
        <div className="card-soft bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Balance (calculated)</p>
          <p className="text-3xl font-bold">{formatMoney(s.net, cur)}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <p>Income: <b className="text-success">{formatMoney(s.income, cur)}</b></p>
            <p>Expenses: <b className="text-destructive">{formatMoney(s.expense, cur)}</b></p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setKind("expense")}><Plus />Expense</Button>
          <Button variant="secondary" onClick={() => setKind("income")}><Plus />Income</Button>
        </div>
        <h2 className="font-semibold">Saved transactions</h2>
        {rows.length === 0 && <p className="card-soft p-4 text-sm text-muted-foreground">No transactions in this period.</p>}
        {rows.map((r) => (
          <div key={r.id} className="card-soft flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{r.category}</p>
              <p className="truncate text-sm text-muted-foreground">{formatDate(r.tx_date)}{r.description ? ` · ${r.description}` : ""}</p>
            </div>
            <p className={r.kind === "income" ? "font-bold text-success" : "font-bold text-destructive"}>{r.kind === "income" ? "+" : "−"}{formatMoney(Number(r.amount), cur)}</p>
            <button aria-label="Delete" className="grid h-11 w-9 place-items-center text-muted-foreground" onClick={() => { if (confirm("Delete this transaction?")) del.mutate(r.id); }}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <FormDialog open={!!kind} onOpenChange={(o) => !o && setKind(null)} title={kind === "income" ? "Add income" : "Add expense"}>
        {kind && (
          <form onSubmit={submit} className="space-y-4">
            <FieldLabel label="Category"><SelectInput value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} options={categories[kind].map((c) => ({ value: c, label: c }))} /></FieldLabel>
            <FieldLabel label={`Amount (${cur})`}><TextInput required type="number" inputMode="decimal" min={1} step="any" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></FieldLabel>
            <FieldLabel label="Date"><TextInput type="date" value={f.tx_date} onChange={(e) => setF({ ...f, tx_date: e.target.value })} /></FieldLabel>
            <FieldLabel label="Description (optional)"><TextInput value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></FieldLabel>
            <Button type="submit" className="w-full" disabled={ins.isPending}>{t("save")}</Button>
          </form>
        )}
      </FormDialog>
    </>
  );
}
