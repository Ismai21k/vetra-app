import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLabel, PageHeader, SelectInput, TextInput } from "@/components/vetra";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile & Settings — Vetra" }, { name: "description", content: "Manage your details, farm and language." }] }),
  component: Profile,
});

function Profile() {
  const { t, setLang } = useT();
  const { session } = useAuth();
  const profile = useProfile();
  const qc = useQueryClient();
  const [f, setF] = useState({ full_name: "", phone: "", location: "", farm_name: "", farm_size: "", language: "en", currency: "NGN" });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile.data) setF({
      full_name: profile.data.full_name ?? "", phone: profile.data.phone ?? "", location: profile.data.location ?? "",
      farm_name: profile.data.farm_name ?? "", farm_size: profile.data.farm_size ?? "", language: profile.data.language, currency: profile.data.currency,
    });
  }, [profile.data]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF({ ...f, [k]: e.target.value }); setDirty(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update(f).eq("id", session!.user.id);
    if (error) { toast.error(error.message); return; }
    setLang(f.language as Lang);
    setDirty(false);
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success(t("saved"));
  };

  return (
    <>
      <PageHeader back title={t("profile")} />
      <form onSubmit={save} className="space-y-4 px-4 pt-4">
        <p className="text-sm text-muted-foreground">{session?.user.email}</p>
        <FieldLabel label={t("fullName")}><TextInput value={f.full_name} onChange={set("full_name")} /></FieldLabel>
        <FieldLabel label={t("phone")}><TextInput type="tel" value={f.phone} onChange={set("phone")} /></FieldLabel>
        <FieldLabel label="Location"><TextInput value={f.location} onChange={set("location")} /></FieldLabel>
        <FieldLabel label="Farm name"><TextInput value={f.farm_name} onChange={set("farm_name")} /></FieldLabel>
        <FieldLabel label="Farm size"><TextInput value={f.farm_size} onChange={set("farm_size")} /></FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label={t("language")}><SelectInput value={f.language} onChange={set("language")} options={[{ value: "en", label: "English" }, { value: "ha", label: "Hausa" }]} /></FieldLabel>
          <FieldLabel label="Currency"><SelectInput value={f.currency} onChange={set("currency")} options={[{ value: "NGN", label: "Naira (₦)" }, { value: "USD", label: "US Dollar" }, { value: "XOF", label: "CFA Franc" }]} /></FieldLabel>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={!dirty}>{t("save")}</Button>
        <div className="card-soft p-4 text-sm">
          <p className="font-semibold">Plans</p>
          <p className="text-muted-foreground">You are on the Free plan. Pro and Premium plans are coming soon.</p>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={async () => {
          const { error } = await supabase.auth.resetPasswordForEmail(session!.user.email!, { redirectTo: `${window.location.origin}/reset-password` });
          if (error) toast.error(error.message); else toast.success("We sent you an email to change your password.");
        }}>Change password</Button>
      </form>
    </>
  );
}
