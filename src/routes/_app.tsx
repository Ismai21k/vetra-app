import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Bell, Home, MoreHorizontal, PawPrint, WifiOff } from "lucide-react";
import { logoUrl } from "@/components/vetra";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/data";
import { useT, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const tabs: { to: string; key: TKey; icon: typeof Home; match: string[] }[] = [
  { to: "/home", key: "home", icon: Home, match: ["/home"] },
  { to: "/animals", key: "animals", icon: PawPrint, match: ["/animals", "/records"] },
  { to: "/reminders", key: "reminders", icon: Bell, match: ["/reminders"] },
  { to: "/learn", key: "learn", icon: BookOpen, match: ["/learn"] },
  { to: "/more", key: "more", icon: MoreHorizontal, match: ["/more", "/vets", "/activities", "/finance", "/community", "/profile"] },
];

function AppLayout() {
  const { session, ready } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t, setLang, lang } = useT();
  const profile = useProfile();
  const [online, setOnline] = useState(true);


  useEffect(() => {
    if (profile.data && !profile.data.onboarded && path !== "/onboarding") nav({ to: "/onboarding" });
    if (profile.data && (profile.data.language === "en" || profile.data.language === "ha") && profile.data.language !== lang) setLang(profile.data.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data, path]);

  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    up();
    window.addEventListener("online", up);
    window.addEventListener("offline", up);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", up); };
  }, []);

  if (!ready) {
    return <div className="grid min-h-dvh place-items-center text-muted-foreground">{t("loading")}</div>;
  }

  const active = (m: string[]) => m.some((p) => path === p || path.startsWith(p + "/"));
  const showNav = path !== "/onboarding";

  return (
    <div className="flex min-h-dvh w-full">
      {showNav && (
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground lg:flex">
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-background p-2">
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover mix-blend-multiply" />
            <span className="font-display text-xl font-bold text-primary">Vetra</span>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <Link key={tab.to} to={tab.to as never}
                className={cn("flex h-12 items-center gap-3 rounded-lg px-3 font-medium", active(tab.match) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60")}>
                <tab.icon className="h-5 w-5" />{t(tab.key)}
              </Link>
            ))}
          </nav>
        </aside>
      )}
      <div className="min-w-0 flex-1">
        {!session && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-secondary px-4 py-2 text-sm text-secondary-foreground">
            <span>You are exploring as a guest. Sign up to save your farm records.</span>
            <Link to="/auth" search={{ mode: "signup" }} className="font-semibold text-primary underline">Sign up / Log in</Link>
          </div>
        )}
        {!online && (
          <div className="flex items-center gap-2 bg-warning-soft px-4 py-2 text-sm text-warning"><WifiOff className="h-4 w-4" />{t("offline")}</div>
        )}
        <div className={cn("mx-auto max-w-3xl", showNav && "pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8")}>
          <Outlet />
        </div>
      </div>
      {showNav && (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-card lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            {tabs.map((tab) => (
              <Link key={tab.to} to={tab.to as never}
                className={cn("flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active(tab.match) ? "text-primary" : "text-muted-foreground")}>
                <tab.icon className={cn("h-6 w-6", active(tab.match) && "stroke-[2.5]")} />
                <span className="truncate">{t(tab.key)}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
