import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Info } from "lucide-react";
import { Chips, FormDialog, PageHeader, SpeciesAvatar, TextInput } from "@/components/vetra";
import { lessons, type Lesson } from "@/lib/learn-content";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/learn")({
  head: () => ({ meta: [{ title: "Vetra Learn — Animal health tips" }, { name: "description", content: "Simple, practical animal health lessons in English and Hausa." }] }),
  component: Learn,
});

function Learn() {
  const { t, lang, setLang } = useT();
  const [species, setSpecies] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Lesson | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setSaved(JSON.parse(localStorage.getItem("vetra-bookmarks") ?? "[]"));
    setRecent(JSON.parse(localStorage.getItem("vetra-recent") ?? "[]"));
  }, []);
  const toggle = (id: string) => {
    const n = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(n); localStorage.setItem("vetra-bookmarks", JSON.stringify(n));
  };
  const view = (l: Lesson) => {
    setOpen(l);
    const n = [l.id, ...recent.filter((x) => x !== l.id)].slice(0, 5);
    setRecent(n); localStorage.setItem("vetra-recent", JSON.stringify(n));
  };

  const list = lessons.filter((l) =>
    (species === "all" || (species === "saved" ? saved.includes(l.id) : l.species.includes(species as "cattle"))) &&
    (!q || l.title[lang].toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageHeader title={`Vetra ${t("learn")}`}>
        <div className="mx-4 mb-3 grid grid-cols-2 rounded-full bg-primary-foreground/15 p-1">
          {(["en", "ha"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={cn("h-9 rounded-full text-sm font-semibold", lang === l && "bg-primary-foreground text-primary")}>{l === "en" ? "English" : "Hausa"}</button>
          ))}
        </div>
      </PageHeader>
      <div className="space-y-3 px-4 pt-4">
        <TextInput type="search" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <Chips value={species} onChange={setSpecies} options={[
          { value: "all", label: t("all") }, { value: "saved", label: "★ Saved" }, { value: "cattle", label: t("cattle") },
          { value: "goat", label: t("goat") }, { value: "sheep", label: t("sheep") }, { value: "poultry", label: t("poultry") }, { value: "fish", label: t("fish") },
        ]} />
        {recent.length > 0 && species === "all" && !q && (
          <p className="text-xs text-muted-foreground">Recently viewed: {recent.map((id) => lessons.find((l) => l.id === id)?.title[lang]).filter(Boolean).join(" · ")}</p>
        )}
        {list.map((l) => (
          <div key={l.id} className="card-soft flex items-center gap-3 p-3">
            <button onClick={() => view(l)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <SpeciesAvatar species={l.species[0] ?? "other"} />
              <span className="min-w-0"><span className="block truncate font-semibold">{l.title[lang]}</span><span className="block text-xs capitalize text-muted-foreground">{l.topic}</span></span>
            </button>
            <button aria-label="Bookmark" onClick={() => toggle(l.id)} className="grid h-11 w-11 place-items-center text-primary">
              {saved.includes(l.id) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No lessons found.</p>}
      </div>
      <FormDialog open={!!open} onOpenChange={(o) => !o && setOpen(null)} title={open?.title[lang] ?? ""}>
        {open && (
          <div className="space-y-3">
            <ul className="list-disc space-y-2 pl-5">{open.body[lang].map((p, i) => <li key={i}>{p}</li>)}</ul>
            <p className="flex gap-2 rounded-lg bg-warning-soft p-3 text-xs text-warning"><Info className="h-4 w-4 shrink-0" />Draft lesson awaiting veterinary review. This does not replace a visit from a vet.</p>
          </div>
        )}
      </FormDialog>
    </>
  );
}
