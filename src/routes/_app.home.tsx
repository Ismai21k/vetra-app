import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, BookOpen, ClipboardList, MoreHorizontal, PawPrint, Plus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalForm } from "@/components/forms";
import { EmptyState, Pill, SpeciesAvatar } from "@/components/vetra";
import { daysUntil, formatDate, reminderState, useList, useProfile } from "@/lib/data";
import { useT, type TKey } from "@/lib/i18n";
import hero from "@/assets/farm-hero.jpg";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home — Vetra" }, { name: "description", content: "Your farm at a glance: animals, reminders and recent health records." }] }),
  component: HomePage,
});

const tiles: { to: string; key: TKey; icon: typeof PawPrint }[] = [
  { to: "/animals", key: "myAnimals", icon: PawPrint },
  { to: "/records", key: "healthRecords", icon: ClipboardList },
  { to: "/reminders", key: "reminders", icon: Bell },
  { to: "/vets", key: "vetServices", icon: Stethoscope },
  { to: "/learn", key: "learn", icon: BookOpen },
  { to: "/more", key: "more", icon: MoreHorizontal },
];

function HomePage() {
  const { t } = useT();
  const profile = useProfile();
  const animals = useList("animals");
  const reminders = useList("reminders");
  const records = useList("health_records");
  const [add, setAdd] = useState(false);

  const h = new Date().getHours();
  const greet = h < 12 ? t("goodMorning") : h < 17 ? t("goodAfternoon") : t("goodEvening");
  const active = (animals.data ?? []).filter((a) => a.status === "active");
  const headCount = active.reduce((s, a) => s + a.quantity, 0);
  const pending = (reminders.data ?? []).filter((r) => r.status === "pending");
  const overdue = pending.filter((r) => reminderState(r) === "overdue");
  const nameOf = (id: string | null) => active.find((a) => a.id === id)?.name ?? "";

  return (
    <>
      <header className="app-header px-4 pb-5 pt-[calc(1rem+env(safe-area-inset-top))] lg:rounded-b-2xl">
        <p className="text-sm opacity-80">{greet},</p>
        <h1 className="truncate text-2xl font-bold">{profile.data?.full_name?.split(" ")[0] ?? "Farmer"}</h1>
      </header>
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-secondary">
          <img src={hero} alt="" width={1280} height={720} className="absolute inset-y-0 right-0 h-full w-3/5 object-cover [mask-image:linear-gradient(to_right,transparent,black_40%)]" />
          <div className="relative p-4">
            <p className="font-display text-lg font-bold leading-tight text-primary">Healthy animals<br />Happy farms</p>
            <div className="mt-3 flex gap-5 text-secondary-foreground">
              <div><p className="text-2xl font-bold">{headCount}</p><p className="text-xs">animals</p></div>
              <div><p className="text-2xl font-bold">{pending.length}</p><p className="text-xs">reminders</p></div>
              {overdue.length > 0 && <div><p className="text-2xl font-bold text-destructive">{overdue.length}</p><p className="text-xs">{t("overdue").toLowerCase()}</p></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 pt-5">
        {animals.isSuccess && active.length === 0 && (
          <EmptyState icon="🐄" title={t("noAnimals")} body={t("noAnimalsCta")}
            action={<Button onClick={() => setAdd(true)}><Plus />{t("addAnimal")}</Button>} />
        )}

        <div className="grid grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <Link key={tile.key} to={tile.to as never} className="card-soft flex min-h-24 flex-col items-center justify-center gap-2 p-2 text-center active:bg-muted">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><tile.icon className="h-5 w-5" /></span>
              <span className="text-xs font-semibold leading-tight">{t(tile.key)}</span>
            </Link>
          ))}
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t("upcomingReminders")}</h2>
            <Link to="/reminders" className="text-sm font-medium text-primary">{t("viewAll")}</Link>
          </div>
          {pending.length === 0 ? (
            <p className="card-soft p-4 text-sm text-muted-foreground">{t("noReminders")}</p>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 4).map((r) => {
                const d = daysUntil(r.due_date);
                return (
                  <Link key={r.id} to="/reminders" className="card-soft flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{r.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{nameOf(r.animal_id) || "Farm"} · {formatDate(r.due_date)}</p>
                    </div>
                    <Pill tone={d < 0 ? "danger" : d <= 2 ? "warning" : "muted"}>
                      {d < 0 ? `${-d}d late` : d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`}
                    </Pill>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 font-semibold">Recent health records</h2>
          {(records.data ?? []).length === 0 ? (
            <p className="card-soft p-4 text-sm text-muted-foreground">{t("noRecords")}</p>
          ) : (
            <div className="space-y-2">
              {records.data!.slice(0, 3).map((r) => {
                const a = animals.data?.find((x) => x.id === r.animal_id);
                return (
                  <Link key={r.id} to="/animals/$id" params={{ id: r.animal_id }} className="card-soft flex items-center gap-3 p-3">
                    <SpeciesAvatar species={a?.species ?? "other"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{r.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{a?.name} · {formatDate(r.record_date)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <AnimalForm open={add} onOpenChange={setAdd} />
    </>
  );
}
