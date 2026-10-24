import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Hash, Heart, Pin, Scale, Sparkles, SprayCan, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel, FormDialog, IconBadge, PageHeader, SelectInput, TextArea, TextInput } from "@/components/vetra";
import { formatDate, todayISO, useInsert, useList } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/activities")({
  head: () => ({ meta: [{ title: "Farm Activities — Vetra" }, { name: "description", content: "Record feeding, cleaning, weight checks and breeding." }] }),
  component: Activities,
});

const types = [
  { value: "feeding", label: "Feeding", icon: Wheat },
  { value: "cleaning", label: "Cleaning", icon: Sparkles },
  { value: "disinfection", label: "Disinfection", icon: SprayCan },
  { value: "weight_check", label: "Weight check", icon: Scale },
  { value: "breeding", label: "Breeding", icon: Heart },
  { value: "stocking", label: "Stocking / count", icon: Hash },
  { value: "other", label: "Other", icon: Pin },
];

function Activities() {
  const { t } = useT();
  const acts = useList("activities");
  const animals = useList("animals");
  const ins = useInsert("activities");
  const [type, setType] = useState<string | null>(null);
  const [f, setF] = useState({ animal_id: "", activity_date: todayISO(), notes: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ins.mutateAsync({ type: type!, animal_id: f.animal_id || null, activity_date: f.activity_date, notes: f.notes || null });
    toast.success(t("saved"));
    setType(null);
    setF({ animal_id: "", activity_date: todayISO(), notes: "" });
  };

  return (
    <>
      <PageHeader back title={t("activities")} />
      <div className="space-y-4 px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {types.slice(0, 6).map((ty) => (
            <button key={ty.value} onClick={() => setType(ty.value)} className="card-soft flex min-h-20 flex-col items-center justify-center gap-1 p-2 text-xs font-semibold">
              <IconBadge icon={ty.icon} />{ty.label}
            </button>
          ))}
        </div>
        <Button variant="outline" className="w-full" onClick={() => setType("other")}>+ Other activity</Button>
        <h2 className="font-semibold">Recent activities</h2>
        {(acts.data ?? []).length === 0 && <p className="card-soft p-4 text-sm text-muted-foreground">Nothing recorded yet. Tap an activity above.</p>}
        {acts.data?.map((a) => {
          const ty = types.find((x) => x.value === a.type);
          return (
            <div key={a.id} className="card-soft flex items-center gap-3 p-3">
              <IconBadge icon={ty?.icon ?? Pin} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{ty?.label}</p>
                <p className="truncate text-sm text-muted-foreground">{animals.data?.find((x) => x.id === a.animal_id)?.name ?? "Whole farm"} · {formatDate(a.activity_date)}</p>
                {a.notes && <p className="truncate text-sm">{a.notes}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <FormDialog open={!!type} onOpenChange={(o) => !o && setType(null)} title={types.find((x) => x.value === type)?.label ?? ""}>
        <form onSubmit={submit} className="space-y-4">
          <FieldLabel label="Animal or group"><SelectInput value={f.animal_id} onChange={(e) => setF({ ...f, animal_id: e.target.value })}
            options={[{ value: "", label: "— Whole farm —" }, ...(animals.data ?? []).filter((a) => a.status === "active").map((a) => ({ value: a.id, label: a.name }))]} /></FieldLabel>
          <FieldLabel label="Date"><TextInput type="date" value={f.activity_date} onChange={(e) => setF({ ...f, activity_date: e.target.value })} /></FieldLabel>
          <FieldLabel label={type === "weight_check" ? "Weight and notes" : "Notes"}><TextArea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></FieldLabel>
          <Button type="submit" className="w-full" disabled={ins.isPending}>{t("save")}</Button>
        </form>
      </FormDialog>
    </>
  );
}
