import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLabel, TextInput } from "@/components/vetra";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/onboarding")({
  head: () => ({ meta: [{ title: "Set up your farm — Vetra" }, { name: "description", content: "Choose your language and tell us about your farm." }] }),
  component: Onboarding,
});

const types = ["cattle", "goat", "sheep", "poultry", "fish"] as const;

function Onboarding() {
  const { t, lang, setLang } = useT();
  const { session } = useAuth();
  const profile = useProfile();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ full_name: "", phone: "", location: "", farm_name: "", farm_size: "", livestock_types: [] as string[] });

  useEffect(() => {
    if (profile.data) setF((p) => ({ ...p, full_name: profile.data!.full_name ?? "", phone: profile.data!.phone ?? "" }));
  }, [profile.data]);

  const finish = async () => {
    const { error } = await supabase.from("profiles").update({ ...f, language: lang, onboarded: true }).eq("id", session!.user.id);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries({ queryKey: ["profile"] });
    nav({ to: "/home" });
  };

  return (
    <main className="mx-auto max-w-md px-6 pb-10 pt-10">
      {step === 0 ? (
        <>
          <h1 className="text-2xl font-bold">{t("chooseLang")}</h1>
          <p className="mb-6 text-muted-foreground">{t("chooseLangSub")}</p>
          <div className="space-y-3">
            {([["en", "English", "Continue in English"], ["ha", "Hausa", "Ci gaba da Hausa"]] as [Lang, string, string][]).map(([v, l, s]) => (
              <button key={v} onClick={() => setLang(v)} className={cn("card-soft flex w-full items-center gap-4 p-4 text-left", lang === v && "border-2 border-primary")}>
                <div className="flex-1"><p className="font-semibold">{l}</p><p className="text-sm text-muted-foreground">{s}</p></div>
                {lang === v && <Check className="h-6 w-6 text-primary" />}
              </button>
            ))}
          </div>
          <Button size="lg" className="mt-8 w-full" onClick={() => setStep(1)}>{t("continue")}</Button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Tell us about your farm</h1>
          <p className="mb-6 text-muted-foreground">Only your name is required. You can fill the rest later.</p>
          <div className="space-y-4">
            <FieldLabel label={t("fullName")}><TextInput value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></FieldLabel>
            <FieldLabel label={t("phone")}><TextInput type="tel" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></FieldLabel>
            <FieldLabel label="Location (town, state)"><TextInput placeholder="e.g. Zaria, Kaduna" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></FieldLabel>
            <FieldLabel label="Farm name (optional)"><TextInput value={f.farm_name} onChange={(e) => setF({ ...f, farm_name: e.target.value })} /></FieldLabel>
            <div>
              <p className="mb-2 text-sm font-medium">What do you keep?</p>
              <div className="flex flex-wrap gap-2">
                {types.map((ty) => {
                  const on = f.livestock_types.includes(ty);
                  return (
                    <button key={ty} type="button" onClick={() => setF({ ...f, livestock_types: on ? f.livestock_types.filter((x) => x !== ty) : [...f.livestock_types, ty] })}
                      className={cn("h-11 rounded-full border px-4 font-medium", on ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>
                      {t(ty)}
                    </button>
                  );
                })}
              </div>
            </div>
            <FieldLabel label="Approximate farm size (optional)"><TextInput placeholder="e.g. 20 cattle, 500 birds" value={f.farm_size} onChange={(e) => setF({ ...f, farm_size: e.target.value })} /></FieldLabel>
          </div>
          <Button size="lg" className="mt-8 w-full" disabled={!f.full_name.trim()} onClick={finish}>{t("continue")}</Button>
        </>
      )}
    </main>
  );
}
