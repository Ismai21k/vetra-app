import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, PawPrint } from "lucide-react";
import cattleImg from "@/assets/sp-cattle.jpg";
import goatImg from "@/assets/sp-goat.jpg";
import sheepImg from "@/assets/sp-sheep.jpg";
import poultryImg from "@/assets/sp-poultry.jpg";
import fishImg from "@/assets/sp-fish.jpg";
import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import logo from "@/assets/vetra-logo.jpg.asset.json";

export const logoUrl = logo.url;

export function PageHeader({ title, back, action, children }: { title: ReactNode; back?: boolean | undefined; action?: ReactNode | undefined; children?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="app-header sticky top-0 z-20 pt-[env(safe-area-inset-top)] lg:rounded-b-2xl">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3">
        {back ? (
          <button aria-label="Back" onClick={() => router.history.back()} className="grid h-11 w-11 place-items-center rounded-full hover:bg-primary-foreground/10">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : <span />}
        <h1 className="truncate text-lg font-semibold">{title}</h1>
        <div className="shrink-0">{action}</div>
      </div>
      {children}
    </header>
  );
}

export function FieldLabel({ label, children, hint }: { label: string; children: ReactNode; hint?: string | undefined }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const TextInput = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn("field", p.className)} />;
export const TextArea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={3} {...p} className={cn("field", p.className)} />;
export const SelectInput = ({ options, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) => (
  <select {...p} className={cn("field", p.className)}>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

export function FormDialog({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; children: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode | undefined; title: string; body?: string | undefined; action?: ReactNode }) {
  return (
    <div className="card-soft flex flex-col items-center gap-3 px-6 py-10 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {body && <p className="max-w-xs text-sm text-muted-foreground">{body}</p>}
      {action}
    </div>
  );
}

export function Pill({ tone = "muted", children }: { tone?: "success" | "warning" | "danger" | "muted"; children: ReactNode }) {
  const tones = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={cn("h-9 shrink-0 rounded-full border px-4 text-sm font-medium",
            value === o.value ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ListLink({ to, params, icon, title, sub, right }: { to: string; params?: Record<string, string> | undefined; icon: ReactNode; title: string; sub?: ReactNode | undefined; right?: ReactNode }) {
  return (
    <Link to={to as never} params={params as never} className="card-soft flex min-h-16 items-center gap-3 p-3 active:bg-muted">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        {sub && <div className="truncate text-sm text-muted-foreground">{sub}</div>}
      </div>
      {right}
    </Link>
  );
}

const speciesImg: Record<string, string> = { cattle: cattleImg, goat: goatImg, sheep: sheepImg, poultry: poultryImg, fish: fishImg };

export function SpeciesAvatar({ species, size = "md" }: { species: string; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "h-20 w-20 rounded-2xl" : "h-12 w-12 rounded-full";
  const src = speciesImg[species];
  return src
    ? <img src={src} alt="" width={256} height={256} loading="lazy" className={cn("shrink-0 object-cover ring-2 ring-card", cls)} />
    : <span className={cn("grid shrink-0 place-items-center bg-secondary text-primary", cls)}><PawPrint className="h-5 w-5" /></span>;
}

export function IconBadge({ icon: Icon, tone = "green" }: { icon: typeof PawPrint; tone?: "green" | "red" | "orange" | "blue" | "purple" }) {
  const tones = {
    green: "bg-secondary text-primary",
    red: "bg-danger-soft text-destructive",
    orange: "bg-warning-soft text-warning",
    blue: "bg-info-soft text-info",
    purple: "bg-violet-soft text-violet",
  };
  return <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}><Icon className="h-5 w-5" /></span>;
}
