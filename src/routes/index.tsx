import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logoUrl } from "@/components/vetra";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import hero from "@/assets/farm-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vetra — Animal health records for Nigerian farmers" },
      { name: "description", content: "Track vaccinations, treatments, reminders and farm records for cattle, goats, sheep, poultry and fish." },
      { property: "og:title", content: "Vetra — Healthier Animals. Stronger Farms." },
      { property: "og:description", content: "Animal health and farm records for farmers in Nigeria, in English and Hausa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { ready } = useAuth();
  const { t, lang, setLang } = useT();
  const nav = useNavigate();
  useEffect(() => {
    if (ready) nav({ to: "/home", replace: true });
  }, [ready, nav]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <div className="flex flex-col items-center px-6 pt-10 text-center">
        <img src={logoUrl} alt="Vetra" className="h-44 w-44 rounded-3xl object-cover mix-blend-multiply" />
      </div>
      <div className="relative mt-6 min-h-56 flex-1 overflow-hidden">
        <img src={hero} alt="Cattle and goats grazing on a farm" width={1280} height={720} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
      </div>
      <div className="space-y-3 bg-background px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
        <Button asChild size="lg" className="w-full"><Link to="/auth" search={{ mode: "signup" }}>{t("getStarted")}</Link></Button>
        <Button asChild size="lg" variant="outline" className="w-full"><Link to="/auth" search={{ mode: "login" }}>{t("login")}</Link></Button>
        <div className="flex justify-center gap-4 pt-1 text-sm">
          {(["en", "ha"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={lang === l ? "font-bold text-primary underline" : "text-muted-foreground"}>
              {l === "en" ? "English" : "Hausa"}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
