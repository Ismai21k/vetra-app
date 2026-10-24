import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthRecordForm, recordTypes } from "@/components/forms";
import { Chips, EmptyState, PageHeader, SpeciesAvatar, TextInput } from "@/components/vetra";
import { formatDate, useList } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/records")({
  head: () => ({ meta: [{ title: "Health Records — Vetra" }, { name: "description", content: "All vaccinations, treatments, illnesses and vet visits on your farm." }] }),
  component: Records,
});

function Records() {
  const { t } = useT();
  const records = useList("health_records");
  const animals = useList("animals");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [add, setAdd] = useState(false);
  const list = (records.data ?? []).filter((r) => (type === "all" || r.type === type) && (!q || `${r.title} ${r.details ?? ""}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageHeader back title={t("healthRecords")} action={<Button variant="gold" size="sm" onClick={() => setAdd(true)}><Plus />{t("addRecord")}</Button>} />
      <div className="space-y-3 px-4 pt-4">
        <TextInput type="search" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <Chips value={type} onChange={setType} options={[{ value: "all", label: t("all") }, ...recordTypes]} />
        {records.isSuccess && list.length === 0 && <EmptyState icon="📋" title={t("noRecords")} />}
        {list.map((r) => {
          const a = animals.data?.find((x) => x.id === r.animal_id);
          return (
            <Link key={r.id} to="/animals/$id" params={{ id: r.animal_id }} className="card-soft flex gap-3 p-3">
              <SpeciesAvatar species={a?.species ?? "other"} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{recordTypes.find((x) => x.value === r.type)?.label} · {formatDate(r.record_date)}</p>
                <p className="truncate font-semibold">{r.title}</p>
                <p className="truncate text-sm text-muted-foreground">{a?.name}</p>
              </div>
            </Link>
          );
        })}
      </div>
      <HealthRecordForm open={add} onOpenChange={setAdd} />
    </>
  );
}
