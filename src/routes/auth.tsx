import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldLabel, TextInput, logoUrl } from "@/components/vetra";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup", "forgot"]).catch("login") }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — Vetra" },
      { name: "description", content: "Log in to Vetra or create a free account to manage your farm animals." },
      { property: "og:title", content: "Log in to Vetra" },
      { property: "og:description", content: "Access your animals, reminders and health records." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const { t } = useT();
  const nav = useNavigate();
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "", password: "" });

  useEffect(() => {
    if (session) nav({ to: "/home" });
  }, [session, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Check your email for a link to reset your password.");
      } else if (mode === "signup") {
        if (f.password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email: f.email,
          password: f.password,
          options: { emailRedirectTo: `${window.location.origin}/home`, data: { full_name: f.name, phone: f.phone } },
        });
        if (error) throw error;
        if (!data.session) toast.success("Account created! Check your email to confirm, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  };

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <main className="mx-auto min-h-dvh max-w-md px-6 pb-10 pt-8">
      <Link to="/" className="mx-auto block w-fit"><img src={logoUrl} alt="Vetra" className="h-28 w-28 rounded-2xl object-cover mix-blend-multiply" /></Link>
      <h1 className="mt-4 text-center text-2xl font-bold">
        {mode === "signup" ? t("signup") : mode === "forgot" ? t("forgot") : t("welcomeBack")}
      </h1>
      <p className="mb-6 text-center text-muted-foreground">{mode === "signup" ? t("createSub") : mode === "login" ? t("loginSub") : ""}</p>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <>
            <FieldLabel label={t("fullName")}><TextInput required autoComplete="name" value={f.name} onChange={set("name")} /></FieldLabel>
            <FieldLabel label={t("phone")}><TextInput type="tel" inputMode="tel" autoComplete="tel" placeholder="080..." value={f.phone} onChange={set("phone")} /></FieldLabel>
          </>
        )}
        <FieldLabel label={t("email")}><TextInput required type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} /></FieldLabel>
        {mode !== "forgot" && (
          <FieldLabel label={t("password")} hint={mode === "signup" ? "At least 8 characters" : undefined}>
            <TextInput required type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={f.password} onChange={set("password")} />
          </FieldLabel>
        )}
        {mode === "login" && (
          <Link to="/auth" search={{ mode: "forgot" }} className="block text-right text-sm font-medium text-primary">{t("forgot")}</Link>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? t("loading") : mode === "signup" ? t("signup") : mode === "forgot" ? t("continue") : t("login")}
        </Button>
      </form>

      {mode !== "forgot" && (
        <>
          <div className="my-5 flex items-center gap-3 text-sm text-muted-foreground"><span className="h-px flex-1 bg-border" />{t("or")}<span className="h-px flex-1 bg-border" /></div>
          <Button variant="outline" size="lg" className="w-full" onClick={google}>{t("google")}</Button>
        </>
      )}

      <p className="mt-6 text-center text-sm">
        {mode === "signup" ? t("haveAccount") : t("noAccount")}{" "}
        <Link to="/auth" search={{ mode: mode === "signup" ? "login" : "signup" }} className="font-semibold text-primary">
          {mode === "signup" ? t("login") : t("signup")}
        </Link>
      </p>
    </main>
  );
}
