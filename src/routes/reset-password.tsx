import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLabel, TextInput } from "@/components/vetra";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Vetra" },
      { name: "description", content: "Choose a new password for your Vetra account." },
      { property: "og:title", content: "Reset password — Vetra" },
      { property: "og:description", content: "Choose a new password for your Vetra account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    nav({ to: "/home" });
  };
  return (
    <main className="mx-auto max-w-md px-6 pt-16">
      <h1 className="mb-6 text-2xl font-bold">Set a new password</h1>
      <form onSubmit={submit} className="space-y-4">
        <FieldLabel label="New password"><TextInput type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></FieldLabel>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>Save password</Button>
      </form>
    </main>
  );
}
