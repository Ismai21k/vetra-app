import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bug, CalendarDays, Check, Pencil, Pill as Pill2, Pin, Plus, Stethoscope, Syringe, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HealthRecordForm, ReminderForm, reminderTypes } from "@/components/forms";
import { Chips, EmptyState, IconBadge, PageHeader, Pill } from "@/components/vetra";
import { daysUntil, formatDate, reminderState, useList, useUpdate, type Row } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/reminders")({
  head: () => ({ meta: [{ title: "Reminders — Vetra" }, { name: "description", content: "Vaccination, deworming and treatment reminders for your animals." }] }),
  component: Reminders,
});

const icon: Record<string, { i: typeof Syringe; tone: "red" | "orange" | "purple" | "blue" | "green" }> = {
  vaccination: { i: Syringe, tone: "red" }, deworming: { i: Bug, tone: "orange" }, treatment: { i: Pill2, tone: "purple" },
  checkup: { i: Stethoscope, tone: "blue" }, vet_appointment: { i: CalendarDays, tone: "green" }, other: { i: Pin, tone: "green" },
};

function Reminders() {
  const { t } = useT();
  const reminders = useList("reminders");
  const animals = useList("animals");
  const upd = useUpdate("reminders");
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState<Row<"reminders"> | undefined>();
  const [record, setRecord] = useState<Row<"reminders"> | null>(null);

  const all = reminders.data ?? [];
  const list = tab === "upcoming" ? all.filter((r) => r.status === "pending") : [...all.filter((r) => r.status !== "pending")].reverse();
  const nameOf = (id: string | null) => animals.data?.find((a) => a.id === id)?.name ?? "Whole farm";

  const complete = async (r: Row<"reminders">) => {
    await upd.mutateAsync({ id: r.id, status: "done" });
    if (["vaccination", "treatment", "deworming"].includes(r.type) && r.animal_id) {
      toast.success("Marked done", { action: { label: "Add health record", onClick: () => setRecord(r) } });
    } else toast.success("Marked done");
  };

  return (
    <>
      <PageHeader title={t("reminders")} action={<Button variant="gold" size="sm" onClick={() => { setEdit(undefined); setAdd(true); }}><Plus />{t("addReminder")}</Button>} />
      <div className="space-y-3 px-4 pt-4">
        <Chips value={tab} onChange={setTab} options={[{ value: "upcoming", label: t("upcoming") }, { value: "history", label: t("history") }]} />
        {reminders.isLoading && <p className="text-muted-foreground">{t("loading")}</p>}
        {reminders.isSuccess && list.length === 0 && <EmptyState icon="🔔" title={t("noReminders")} />}
        {list.map((r) => {
          const st = reminderState(r);
          const d = daysUntil(r.due_date);
          return (
            <div key={r.id} className="card-soft p-3">
              <div className="flex items-start gap-3">
                <IconBadge icon={(icon[r.type] ?? icon["other"]!).i} tone={(icon[r.type] ?? icon["other"]!).tone} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{nameOf(r.animal_id)} · {formatDate(r.due_date)}{r.due_time ? ` ${r.due_time.slice(0, 5)}` : ""}</p>
                  <div className="mt-1">
                    {st === "overdue" ? <Pill tone="danger">{-d} days late</Pill>
                      : st === "upcoming" ? <Pill tone={d <= 2 ? "warning" : "muted"}>{d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`}</Pill>
                      : <Pill tone={st === "done" ? "success" : "muted"}>{st}</Pill>}
                    <span className="ml-2 text-xs text-muted-foreground">{reminderTypes.find((x) => x.value === r.type)?.label}</span>
                  </div>
                </div>
              </div>
              {r.status === "pending" && (
                <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
                  <Button size="sm" onClick={() => complete(r)}><Check />{t("markDone")}</Button>
                  <Button size="sm" variant="outline" aria-label="Edit or reschedule" onClick={() => { setEdit(r); setAdd(true); }}><Pencil /></Button>
                  <Button size="sm" variant="outline" aria-label="Mark missed or cancel" onClick={() => upd.mutate({ id: r.id, status: st === "overdue" ? "missed" : "cancelled" })}><X />{st === "overdue" ? "Missed" : "Cancel"}</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ReminderForm open={add} onOpenChange={setAdd} reminder={edit} />
      <HealthRecordForm open={!!record} onOpenChange={(o) => !o && setRecord(null)} animalId={record?.animal_id ?? undefined}
        defaults={{ type: record?.type === "vaccination" ? "vaccination" : "treatment", title: record?.title }} />
    </>
  );
}
