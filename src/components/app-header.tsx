import { Bell, Plus, Search } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">{subtitle ?? today}</p>
      </div>

      <div className="hidden md:flex relative w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search resources, requirements..."
          className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elevated)] transition-opacity hover:opacity-90">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Upload Resume</span>
      </button>

      <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
      </button>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        RM
      </div>
    </header>
  );
}
