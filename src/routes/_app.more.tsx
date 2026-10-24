import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, LogOut, MessagesSquare, Sprout, Stethoscope, User, Wallet } from "lucide-react";
import { IconBadge, ListLink, PageHeader } from "@/components/vetra";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/_app/more")({
  head: () => ({ meta: [{ title: "More — Vetra" }, { name: "description", content: "Vets, health records, farm activities, finances, community and settings." }] }),
  component: More,
});

const items: { to: string; key: TKey; icon: typeof User }[] = [
  { to: "/vets", key: "vetServices", icon: Stethoscope },
  { to: "/records", key: "healthRecords", icon: ClipboardList },
  { to: "/activities", key: "activities", icon: Sprout },
  { to: "/finance", key: "finance", icon: Wallet },
  { to: "/community", key: "community", icon: MessagesSquare },
  { to: "/profile", key: "profile", icon: User },
];

function More() {
  const { t } = useT();
  const nav = useNavigate();
  return (
    <>
      <PageHeader title={t("more")} />
      <div className="space-y-2 px-4 pt-4">
        {items.map((i) => (
          <ListLink key={i.to} to={i.to} icon={<IconBadge icon={i.icon} />} title={t(i.key)} right={<ChevronRight className="h-5 w-5 text-muted-foreground" />} />
        ))}
        <Button variant="outline" size="lg" className="mt-4 w-full" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}>
          <LogOut />{t("logout")}
        </Button>
      </div>
    </>
  );
}
