import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLabel, FormDialog, SelectInput, TextArea, TextInput } from "@/components/vetra";
import { todayISO, useInsert, useList, useUpdate, type Row } from "@/lib/data";
import { useT } from "@/lib/i18n";

const speciesOpts = (t: ReturnType<typeof useT>["t"]) =>
  (["cattle", "goat", "sheep", "poultry", "fish", "other"] as const).map((s) => ({ value: s, label: t(s) }));

function useAnimalOptions(withNone = false) {
  const animals = useList("animals");
  const opts = (animals.data ?? []).filter((a) => a.status === "active").map((a) => ({ value: a.id, label: a.name }));
  return withNone ? [{ value: "", label: "— None / whole farm —" }, ...opts] : opts;
}

export function AnimalForm({ open, onOpenChange, animal }: { open: boolean; onOpenChange: (o: boolean) => void; animal?: Row<"animals"> | undefined }) {
  const { t } = useT();
  const ins = useInsert("animals");
  const upd = useUpdate("animals");
  const blank = { kind: "individual", name: "", species: "cattle", breed: "", sex: "", birth_date: "", quantity: 1, acquired_date: "", location: "", notes: "" };
  const [f, setF] = useState<typeof blank>(blank);
  useEffect(() => {
    if (open) setF(animal ? { ...blank, ...Object.fromEntries(Object.entries(animal).map(([k, v]) => [k, v ?? ""])) } as typeof blank : blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, animal]);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const isGroup = f.kind === "group";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const row = {
      kind: f.kind, name: f.name.trim(), species: f.species, breed: f.breed || null, sex: isGroup ? null : f.sex || null,
      birth_date: f.birth_date || null, quantity: isGroup ? Math.max(0, Number(f.quantity) || 0) : 1,
      acquired_date: f.acquired_date || null, location: f.location || null, notes: f.notes || null,
    };
    if (animal) await upd.mutateAsync({ id: animal.id, ...row });
    else await ins.mutateAsync(row);
    toast.success(t("saved"));
    onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={animal ? "Edit animal" : t("addAnimal")}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {([["individual", "One animal"], ["group", "Flock / pond / herd"]] as const).map(([v, l]) => (
            <button type="button" key={v} onClick={() => setF({ ...f, kind: v })}
              className={`h-11 rounded-lg border text-sm font-medium ${f.kind === v ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{l}</button>
          ))}
        </div>
        <FieldLabel label={isGroup ? "Group name" : "Name or tag number"}><TextInput required placeholder={isGroup ? "e.g. Layer Coop 1" : "e.g. Cow #1"} value={f.name} onChange={set("name")} /></FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label="Type"><SelectInput value={f.species} onChange={set("species")} options={speciesOpts(t)} /></FieldLabel>
          <FieldLabel label="Breed"><TextInput placeholder="e.g. White Fulani" value={f.breed} onChange={set("breed")} /></FieldLabel>
        </div>
        {isGroup ? (
          <FieldLabel label="Number of animals"><TextInput type="number" inputMode="numeric" min={0} value={f.quantity} onChange={set("quantity")} /></FieldLabel>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Sex"><SelectInput value={f.sex} onChange={set("sex")} options={[{ value: "", label: "—" }, { value: "female", label: "Female" }, { value: "male", label: "Male" }]} /></FieldLabel>
            <FieldLabel label="Date of birth"><TextInput type="date" value={f.birth_date} onChange={set("birth_date")} /></FieldLabel>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label={isGroup ? "Stocking date" : "Date acquired"}><TextInput type="date" value={f.acquired_date} onChange={set("acquired_date")} /></FieldLabel>
          <FieldLabel label="Location on farm"><TextInput value={f.location} onChange={set("location")} /></FieldLabel>
        </div>
        <FieldLabel label="Notes"><TextArea value={f.notes} onChange={set("notes")} /></FieldLabel>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button type="submit" className="flex-1" disabled={ins.isPending || upd.isPending}>{t("save")}</Button>
        </div>
      </form>
    </FormDialog>
  );
}

export const recordTypes = [
  { value: "vaccination", label: "Vaccination" },
  { value: "treatment", label: "Treatment / medicine" },
  { value: "illness", label: "Illness" },
  { value: "vet_visit", label: "Vet visit" },
];

export function HealthRecordForm({ open, onOpenChange, animalId, defaults }: { open: boolean; onOpenChange: (o: boolean) => void; animalId?: string | undefined; defaults?: { type?: string | undefined; title?: string | undefined } | undefined }) {
  const { t } = useT();
  const ins = useInsert("health_records");
  const insRem = useInsert("reminders");
  const animalOpts = useAnimalOptions();
  const blank = { animal_id: animalId ?? "", type: "vaccination", title: "", record_date: todayISO(), next_date: "", given_by: "", details: "", outcome: "" };
  const [f, setF] = useState(blank);
  useEffect(() => {
    if (open) setF({ ...blank, animal_id: animalId ?? animalOpts[0]?.value ?? "", type: defaults?.type ?? "vaccination", title: defaults?.title ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const titleLabel = ({ vaccination: "Vaccine name", treatment: "Medicine / treatment", illness: "Symptoms seen", vet_visit: "Vet or clinic, reason" } as Record<string, string>)[f.type] ?? "Title";
  const nextLabel = f.type === "vaccination" ? "Next vaccination (optional)" : "Follow-up date (optional)";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.animal_id) { toast.error("Add an animal first."); return; }
    await ins.mutateAsync({ ...f, next_date: f.next_date || null, given_by: f.given_by || null, details: f.details || null, outcome: f.outcome || null });
    if (f.next_date) {
      await insRem.mutateAsync({
        animal_id: f.animal_id, due_date: f.next_date,
        type: f.type === "vaccination" ? "vaccination" : f.type === "vet_visit" ? "vet_appointment" : "treatment",
        title: f.type === "vaccination" ? `${f.title} (next dose)` : `Follow-up: ${f.title}`,
      });
      toast.success("Record saved and reminder added");
    } else toast.success(t("saved"));
    onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={t("addRecord")}>
      <form onSubmit={submit} className="space-y-4">
        {!animalId && <FieldLabel label="Animal or group"><SelectInput required value={f.animal_id} onChange={set("animal_id")} options={animalOpts} /></FieldLabel>}
        <FieldLabel label="Record type"><SelectInput value={f.type} onChange={set("type")} options={recordTypes} /></FieldLabel>
        <FieldLabel label={titleLabel}><TextInput required value={f.title} onChange={set("title")} /></FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label="Date"><TextInput type="date" required value={f.record_date} onChange={set("record_date")} /></FieldLabel>
          <FieldLabel label={nextLabel}><TextInput type="date" value={f.next_date} onChange={set("next_date")} /></FieldLabel>
        </div>
        <FieldLabel label={f.type === "illness" ? "Vet assessment (if any)" : "Given by (optional)"}><TextInput value={f.given_by} onChange={set("given_by")} /></FieldLabel>
        <FieldLabel label={f.type === "treatment" ? "Dosage / instructions from the vet" : "Notes"}><TextArea value={f.details} onChange={set("details")} /></FieldLabel>
        {(f.type === "treatment" || f.type === "illness") && <FieldLabel label="Outcome"><TextInput placeholder="e.g. Recovered" value={f.outcome} onChange={set("outcome")} /></FieldLabel>}
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button type="submit" className="flex-1" disabled={ins.isPending}>{t("save")}</Button>
        </div>
      </form>
    </FormDialog>
  );
}

export const reminderTypes = [
  { value: "vaccination", label: "Vaccination" },
  { value: "deworming", label: "Deworming" },
  { value: "treatment", label: "Treatment" },
  { value: "checkup", label: "Check-up" },
  { value: "vet_appointment", label: "Vet appointment" },
  { value: "other", label: "Other" },
];

export function ReminderForm({ open, onOpenChange, animalId, reminder }: { open: boolean; onOpenChange: (o: boolean) => void; animalId?: string | undefined; reminder?: Row<"reminders"> | undefined }) {
  const { t } = useT();
  const ins = useInsert("reminders");
  const upd = useUpdate("reminders");
  const animalOpts = useAnimalOptions(true);
  const blank = { animal_id: animalId ?? "", type: "vaccination", title: "", due_date: todayISO(), due_time: "", notes: "" };
  const [f, setF] = useState(blank);
  useEffect(() => {
    if (open) setF(reminder ? { animal_id: reminder.animal_id ?? "", type: reminder.type, title: reminder.title, due_date: reminder.due_date, due_time: reminder.due_time?.slice(0, 5) ?? "", notes: reminder.notes ?? "" } : blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const row = { ...f, animal_id: f.animal_id || null, due_time: f.due_time || null, notes: f.notes || null };
    if (reminder) await upd.mutateAsync({ id: reminder.id, ...row, status: "pending" });
    else await ins.mutateAsync(row);
    toast.success(t("saved"));
    onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={reminder ? "Edit reminder" : t("addReminder")}>
      <form onSubmit={submit} className="space-y-4">
        <FieldLabel label="What"><SelectInput value={f.type} onChange={set("type")} options={reminderTypes} /></FieldLabel>
        <FieldLabel label="Title"><TextInput required placeholder="e.g. FMD vaccine" value={f.title} onChange={set("title")} /></FieldLabel>
        {!animalId && <FieldLabel label="Animal or group"><SelectInput value={f.animal_id} onChange={set("animal_id")} options={animalOpts} /></FieldLabel>}
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label="Date"><TextInput type="date" required value={f.due_date} onChange={set("due_date")} /></FieldLabel>
          <FieldLabel label="Time (optional)"><TextInput type="time" value={f.due_time} onChange={set("due_time")} /></FieldLabel>
        </div>
        <FieldLabel label="Notes"><TextArea value={f.notes} onChange={set("notes")} /></FieldLabel>
        <p className="text-xs text-muted-foreground">Reminders show in the app on the due date. Phone notifications are not set up yet.</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button type="submit" className="flex-1" disabled={ins.isPending || upd.isPending}>{t("save")}</Button>
        </div>
      </form>
    </FormDialog>
  );
}
