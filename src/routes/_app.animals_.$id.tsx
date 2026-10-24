import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Archive, Bell, Pencil, Pill as Pill2, Plus, Stethoscope, Syringe, Thermometer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimalForm, HealthRecordForm, ReminderForm, recordTypes } from "@/components/forms";
import { FormDialog, IconBadge, PageHeader, Pill, SelectInput, SpeciesAvatar, TextInput, FieldLabel } from "@/components/vetra";
import { formatDate, reminderState, useInsert, useList, useUpdate } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/animals_/$id")({
  head: () => ({ meta: [{ title: "Animal profile — Vetra" }, { name: "description", content: "Health history, reminders and details for this animal." }] }),
  component: AnimalProfile,
});

const typeLabel = Object.fromEntries(recordTypes.map((r) => [r.value, r.label]));
const typeIcon: Record<string, { i: typeof Syringe; tone: "red" | "purple" | "orange" | "blue" }> = { vaccination: { i: Syringe, tone: "red" }, treatment: { i: Pill2, tone: "purple" }, illness: { i: Thermometer, tone: "orange" }, vet_visit: { i: Stethoscope, tone: "blue" } };

function AnimalProfile() {
  const { id } = Route.useParams();
  const { t } = useT();
  const animals = useList("animals");
  const records = useList("health_records");
  const reminders = useList("reminders");
  const upd = useUpdate("animals");
  const [edit, setEdit] = useState(false);
  const [rec, setRec] = useState<string | null>(null);
  const [rem, setRem] = useState(false);
  const [qty, setQty] = useState(false);

  const a = animals.data?.find((x) => x.id === id);
  if (animals.isLoading) return <p className="p-6 text-muted-foreground">{t("loading")}</p>;
  if (!a) return <><PageHeader back title="Not found" /><p className="p-6">This animal could not be found.</p></>;

  const hist = (records.data ?? []).filter((r) => r.animal_id === id);
  const rems = (reminders.data ?? []).filter((r) => r.animal_id === id && r.status === "pending");
  const lastVax = hist.find((r) => r.type === "vaccination");
  const lastTx = hist.find((r) => r.type === "treatment");
  const late = rems.some((r) => reminderState(r) === "overdue");

  return (
    <>
      <PageHeader back title={a.name} action={<Button variant="onDark" size="icon" aria-label="Edit" onClick={() => setEdit(true)}><Pencil /></Button>} />
      <div className="space-y-4 px-4 pt-4">
        <div className="card-soft flex items-center gap-4 p-4">
          <SpeciesAvatar species={a.species} size="lg" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold">{a.name}</h2>
              {a.status !== "active" ? <Pill>{a.status}</Pill> : late ? <Pill tone="danger">{t("overdue")}</Pill> : rems.length ? <Pill tone="warning">{t("dueSoon")}</Pill> : null}
            </div>
            <p className="text-sm text-muted-foreground">{t(a.species as "cattle")}{a.breed ? ` · ${a.breed}` : ""}</p>
            {a.kind === "group" && (
              <button onClick={() => setQty(true)} className="text-sm font-semibold text-primary underline">{a.quantity} animals · update count</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" className="h-auto flex-col py-3" onClick={() => setRec("vaccination")}><Plus />Health record</Button>
          <Button variant="secondary" className="h-auto flex-col py-3" onClick={() => setRem(true)}><Bell />Reminder</Button>
          <Button asChild variant="secondary" className="h-auto flex-col py-3"><Link to="/vets"><Stethoscope />Ask a vet</Link></Button>
        </div>

        <Tabs defaultValue="health">
          <TabsList className="grid h-11 w-full grid-cols-2">
            <TabsTrigger value="health" className="h-9">{t("healthRecords")}</TabsTrigger>
            <TabsTrigger value="details" className="h-9">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="health" className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="card-soft p-3"><p className="text-xs text-muted-foreground">Last vaccination</p><p className="font-semibold">{lastVax ? formatDate(lastVax.record_date) : "—"}</p>{lastVax?.next_date && <p className="text-xs text-muted-foreground">Next: {formatDate(lastVax.next_date)}</p>}</div>
              <div className="card-soft p-3"><p className="text-xs text-muted-foreground">Last treatment</p><p className="font-semibold">{lastTx ? formatDate(lastTx.record_date) : "—"}</p>{lastTx?.next_date && <p className="text-xs text-muted-foreground">Follow-up: {formatDate(lastTx.next_date)}</p>}</div>
            </div>
            {rems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{t("reminders")}</h3>
                {rems.map((r) => (
                  <div key={r.id} className="card-soft flex items-center justify-between gap-2 p-3 text-sm">
                    <span className="truncate font-medium">{r.title}</span>
                    <Pill tone={reminderState(r) === "overdue" ? "danger" : "muted"}>{formatDate(r.due_date)}</Pill>
                  </div>
                ))}
              </div>
            )}
            <h3 className="text-sm font-semibold">{t("history")}</h3>
            {hist.length === 0 ? <p className="card-soft p-4 text-sm text-muted-foreground">{t("noRecords")}</p> : hist.map((r) => (
              <div key={r.id} className="card-soft flex gap-3 p-3">
                <IconBadge icon={typeIcon[r.type]!.i} tone={typeIcon[r.type]!.tone} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{typeLabel[r.type]} · {formatDate(r.record_date)}</p>
                  <p className="font-semibold">{r.title}</p>
                  {r.given_by && <p className="text-sm">{r.type === "illness" ? "Vet assessment" : "By"}: {r.given_by}</p>}
                  {r.details && <p className="text-sm text-muted-foreground">{r.details}</p>}
                  {r.outcome && <p className="text-sm">Outcome: {r.outcome}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">Entered by you</p>
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="details" className="pt-2">
            <dl className="card-soft divide-y text-sm">
              {[["Sex", a.sex], ["Date of birth", a.birth_date && formatDate(a.birth_date)], [a.kind === "group" ? "Stocking date" : "Acquired", a.acquired_date && formatDate(a.acquired_date)], ["Location", a.location], ["Notes", a.notes]].map(([k, v]) => (
                <div key={k as string} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2 p-3"><dt className="text-muted-foreground">{k}</dt><dd className="break-words">{v || "—"}</dd></div>
              ))}
            </dl>
            {a.status === "active" ? (
              <Button variant="outline" className="mt-4 w-full" onClick={async () => { await upd.mutateAsync({ id: a.id, status: "archived" }); toast.success("Archived. Health history is kept."); }}>
                <Archive />Archive (sold / died / left farm)
              </Button>
            ) : (
              <Button variant="outline" className="mt-4 w-full" onClick={() => upd.mutate({ id: a.id, status: "active" })}>Restore to active</Button>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <AnimalForm open={edit} onOpenChange={setEdit} animal={a} />
      <HealthRecordForm open={!!rec} onOpenChange={(o) => !o && setRec(null)} animalId={a.id} defaults={{ type: rec ?? undefined }} />
      <ReminderForm open={rem} onOpenChange={setRem} animalId={a.id} />
      <QuantityDialog open={qty} onOpenChange={setQty} animalId={a.id} current={a.quantity} />
    </>
  );
}

function QuantityDialog({ open, onOpenChange, animalId, current }: { open: boolean; onOpenChange: (o: boolean) => void; animalId: string; current: number }) {
  const upd = useUpdate("animals");
  const act = useInsert("activities");
  const [reason, setReason] = useState("added");
  const [n, setN] = useState("1");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const delta = Math.max(0, Number(n) || 0) * (reason === "added" ? 1 : -1);
    const next = Math.max(0, current + delta);
    await upd.mutateAsync({ id: animalId, quantity: next });
    await act.mutateAsync({ animal_id: animalId, type: "stocking", notes: `${Math.abs(delta)} ${reason}. New count: ${next}` });
    toast.success(`Count updated to ${next}`);
    onOpenChange(false);
  };
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Update count">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted-foreground">Current count: {current}</p>
        <FieldLabel label="What happened?"><SelectInput value={reason} onChange={(e) => setReason(e.target.value)} options={[{ value: "added", label: "Added" }, { value: "sold", label: "Sold" }, { value: "died", label: "Died" }, { value: "transferred", label: "Transferred" }]} /></FieldLabel>
        <FieldLabel label="How many?"><TextInput type="number" inputMode="numeric" min={1} value={n} onChange={(e) => setN(e.target.value)} /></FieldLabel>
        <Button type="submit" className="w-full">Save</Button>
      </form>
    </FormDialog>
  );
}
