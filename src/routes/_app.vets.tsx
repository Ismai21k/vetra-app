import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLabel, FormDialog, PageHeader, Pill, SelectInput, TextArea, TextInput } from "@/components/vetra";
import { formatDate, useInsert, useList, useUpdate } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/vets")({
  head: () => ({ meta: [{ title: "Veterinary Services — Vetra" }, { name: "description", content: "Find veterinary help and send consultation requests." }] }),
  component: Vets,
});

// Demonstration listings only — not real professionals, not verified.
const demoVets = [
  { name: "Demo Vet Clinic A", role: "Veterinary clinic", location: "Kaduna", services: "Cattle, goats, sheep" },
  { name: "Demo Poultry Vet B", role: "Veterinary doctor", location: "Kano", services: "Poultry" },
  { name: "Demo Aquaculture Vet C", role: "Fish health specialist", location: "Abuja", services: "Fish" },
];

function Vets() {
  const { t } = useT();
  const requests = useList("consultation_requests");
  const animals = useList("animals");
  const ins = useInsert("consultation_requests");
  const upd = useUpdate("consultation_requests");
  const [q, setQ] = useState("");
  const [vet, setVet] = useState<string | null>(null);
  const [f, setF] = useState({ animal_id: "", concern: "", symptoms: "", preferred_time: "", contact_method: "phone" });
  const list = demoVets.filter((v) => !q || `${v.name} ${v.location} ${v.services}`.toLowerCase().includes(q.toLowerCase()));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ins.mutateAsync({ ...f, animal_id: f.animal_id || null, vet_name: vet! });
    toast.success("Request saved");
    setVet(null);
    setF({ animal_id: "", concern: "", symptoms: "", preferred_time: "", contact_method: "phone" });
  };

  return (
    <>
      <PageHeader back title={t("vetServices")} />
      <div className="space-y-3 px-4 pt-4">
        <p className="rounded-lg bg-warning-soft p-3 text-sm text-warning">These are demonstration listings. Real, verified veterinarians will appear here once they join Vetra.</p>
        <TextInput type="search" placeholder="Search by name, place or animal…" value={q} onChange={(e) => setQ(e.target.value)} />
        {list.map((v) => (
          <div key={v.name} className="card-soft flex items-center gap-3 p-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-primary"><Stethoscope className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{v.name}</p>
              <p className="truncate text-sm text-muted-foreground">{v.role} · {v.services}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{v.location} · <Pill>Not verified</Pill></p>
            </div>
            <Button size="sm" onClick={() => setVet(v.name)}>Request</Button>
          </div>
        ))}

        <h2 className="pt-4 font-semibold">My requests</h2>
        {(requests.data ?? []).length === 0 && <p className="card-soft p-4 text-sm text-muted-foreground">No requests yet.</p>}
        {requests.data?.map((r) => (
          <div key={r.id} className="card-soft p-3">
            <div className="flex items-center justify-between gap-2"><p className="truncate font-semibold">{r.vet_name}</p><Pill tone={r.status === "pending" ? "warning" : r.status === "completed" ? "success" : "muted"}>{r.status}</Pill></div>
            <p className="text-sm">{r.concern}</p>
            <p className="text-xs text-muted-foreground">Sent {formatDate(r.created_at.slice(0, 10))}</p>
            {r.status === "pending" && <Button size="sm" variant="outline" className="mt-2" onClick={() => upd.mutate({ id: r.id, status: "cancelled" })}>Cancel request</Button>}
          </div>
        ))}
      </div>
      <FormDialog open={!!vet} onOpenChange={(o) => !o && setVet(null)} title={`Request consultation`}>
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted-foreground">To: {vet}</p>
          <FieldLabel label="Animal or group"><SelectInput value={f.animal_id} onChange={(e) => setF({ ...f, animal_id: e.target.value })}
            options={[{ value: "", label: "— Not specific —" }, ...(animals.data ?? []).filter((a) => a.status === "active").map((a) => ({ value: a.id, label: a.name }))]} /></FieldLabel>
          <FieldLabel label="What is the problem?"><TextArea required value={f.concern} onChange={(e) => setF({ ...f, concern: e.target.value })} /></FieldLabel>
          <FieldLabel label="Signs you have seen"><TextInput placeholder="e.g. not eating, coughing" value={f.symptoms} onChange={(e) => setF({ ...f, symptoms: e.target.value })} /></FieldLabel>
          <FieldLabel label="Preferred time"><TextInput placeholder="e.g. Tomorrow morning" value={f.preferred_time} onChange={(e) => setF({ ...f, preferred_time: e.target.value })} /></FieldLabel>
          <FieldLabel label="How should they contact you?"><SelectInput value={f.contact_method} onChange={(e) => setF({ ...f, contact_method: e.target.value })} options={[{ value: "phone", label: "Phone call" }, { value: "whatsapp", label: "WhatsApp" }, { value: "sms", label: "SMS" }]} /></FieldLabel>
          <Button type="submit" className="w-full" disabled={ins.isPending}>Send request</Button>
        </form>
      </FormDialog>
    </>
  );
}
