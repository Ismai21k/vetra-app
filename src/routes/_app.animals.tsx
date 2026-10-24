import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalForm } from "@/components/forms";
import { Chips, EmptyState, ListLink, PageHeader, Pill, SpeciesAvatar, TextInput } from "@/components/vetra";
import { reminderState, useList } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_app/animals")({
  head: () => ({ meta: [{ title: "My Animals — Vetra" }, { name: "description", content: "Register and manage your cattle, goats, sheep, poultry and fish." }] }),
  component: AnimalsPage,
});

type Filter = "all" | "cattle" | "goat" | "sheep" | "poultry" | "fish" | "archived";

function AnimalsPage() {
  const { t } = useT();
  const animals = useList("animals");
  const reminders = useList("reminders");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [add, setAdd] = useState(false);

  const list = useMemo(() => (animals.data ?? []).filter((a) => {
    if (filter === "archived") { if (a.status === "active") return false; }
    else if (a.status !== "active") return false;
    else if (filter !== "all" && a.species !== filter) return false;
    return !q || `${a.name} ${a.breed ?? ""}`.toLowerCase().includes(q.toLowerCase());
  }), [animals.data, q, filter]);

  const dueFor = (id: string) => (reminders.data ?? []).filter((r) => r.animal_id === id && r.status === "pending");

  return (
    <>
      <PageHeader title={t("myAnimals")} action={<Button variant="gold" size="sm" onClick={() => setAdd(true)}><Plus />{t("addAnimal")}</Button>} />
      <div className="space-y-3 px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput type="search" placeholder={t("search")} className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Chips value={filter} onChange={setFilter} options={[
          { value: "all", label: t("all") }, { value: "cattle", label: t("cattle") }, { value: "goat", label: t("goat") },
          { value: "sheep", label: t("sheep") }, { value: "poultry", label: t("poultry") }, { value: "fish", label: t("fish") },
          { value: "archived", label: "Archived" },
        ]} />
        {animals.isLoading && <p className="text-muted-foreground">{t("loading")}</p>}
        {animals.isError && <p className="text-destructive">{t("somethingWrong")}</p>}
        {animals.isSuccess && list.length === 0 && (
          <EmptyState icon="🐾" title={animals.data.length === 0 ? t("noAnimals") : "No matches"} body={animals.data.length === 0 ? t("noAnimalsCta") : undefined}
            action={animals.data.length === 0 ? <Button onClick={() => setAdd(true)}><Plus />{t("addAnimal")}</Button> : undefined} />
        )}
        <div className="space-y-2">
          {list.map((a) => {
            const due = dueFor(a.id);
            const late = due.some((r) => reminderState(r) === "overdue");
            return (
              <ListLink key={a.id} to="/animals/$id" params={{ id: a.id }} icon={<SpeciesAvatar species={a.species} />} title={a.name}
                sub={<>
                  <span>{t(a.species as "cattle")}{a.kind === "group" ? ` · ${a.quantity} animals` : a.sex ? ` · ${a.sex}` : ""}</span>
                  <span className="ml-2">
                    {a.status !== "active" ? <Pill>{a.status}</Pill> : late ? <Pill tone="danger">{t("overdue")}</Pill> : due.length ? <Pill tone="warning">{t("dueSoon")}</Pill> : null}
                  </span>
                </>}
                right={<ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />} />
            );
          })}
        </div>
      </div>
      <AnimalForm open={add} onOpenChange={setAdd} />
    </>
  );
}
