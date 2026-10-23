import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FileText,
  Sparkles,
  ClipboardCheck,
  UserCheck,
  FileSignature,
  Briefcase,
  Rocket,
  LifeBuoy,
  LogOut,
  HelpCircle,
  CalendarDays,
  Settings,
} from "lucide-react";
import type { ComponentType } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resources", label: "Resources", icon: Users },
  { to: "/requirements", label: "Requirements", icon: FileText },
  { to: "/matching", label: "Matching", icon: Sparkles },
  { to: "/technical", label: "Technical Review", icon: ClipboardCheck },
  { to: "/interviews", label: "Client Interviews", icon: UserCheck },
];

const opsNav: NavItem[] = [
  { to: "/assignments", label: "Assignments", icon: FileSignature },
  { to: "/onboarding", label: "Onboarding", icon: Briefcase },
  { to: "/deployments", label: "Deployments", icon: Rocket },
  { to: "/holidays", label: "Holiday Tracker", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

const helpNav: NavItem[] = [{ to: "/faq", label: "FAQ / Help", icon: HelpCircle }];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const renderItem = (item: NavItem) => {
    const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        className={[
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        ].join(" ")}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge ? (
          <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-semibold text-warning-foreground">
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            TalentFlow
          </span>
          <span className="text-[11px] text-sidebar-foreground/60">Resource Management</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Pipeline
        </p>
        <div className="space-y-1">{mainNav.map(renderItem)}</div>

        <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Operations
        </p>
        <div className="space-y-1">{opsNav.map(renderItem)}</div>

        <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Help
        </p>
        <div className="space-y-1">{helpNav.map(renderItem)}</div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
            RM
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Recruiter</p>
            <p className="truncate text-xs text-sidebar-foreground/60">admin@talentflow.com</p>
          </div>
        </div>
        <div className="mt-2 flex gap-1">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/50">
            <LifeBuoy className="h-3.5 w-3.5" /> Help
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/50">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
