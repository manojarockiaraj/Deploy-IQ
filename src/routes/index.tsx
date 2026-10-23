import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  PauseCircle,
  Rocket,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import type { ComponentType } from "react";
import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TalentFlow Resource Management" },
      {
        name: "description",
        content:
          "End-to-end recruitment pipeline dashboard: resumes, screening, technical review, client interviews, onboarding, and deployment.",
      },
      { property: "og:title", content: "TalentFlow — Resource Management Portal" },
      {
        property: "og:description",
        content: "Track every candidate from resume upload to deployment in one intelligent pipeline.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const counts = useLiveQuery(async () => {
    const [
      resources,
      requirements,
      matches,
      technicalReviews,
      clientInterviews,
      assignments,
      onboardings,
      deployments,
    ] = await Promise.all([
      db.resources.toArray(),
      db.requirements.toArray(),
      db.matches.toArray(),
      db.technicalReviews.toArray(),
      db.clientInterviews.toArray(),
      db.assignments.toArray(),
      db.onboardings.toArray(),
      db.deployments.toArray(),
    ]);
    return {
      resources,
      requirements,
      matches,
      technicalReviews,
      clientInterviews,
      assignments,
      onboardings,
      deployments,
    };
  });

  const openRequirements = counts?.requirements.filter((r) => r.status === "open").length ?? 0;
  const inProgressReqs = counts?.requirements.filter((r) => r.status === "in_progress").length ?? 0;
  const filledReqs = counts?.requirements.filter((r) => r.status === "filled").length ?? 0;
  const closedReqs = counts?.requirements.filter((r) => r.status === "closed").length ?? 0;

  const activeResources = counts?.resources.filter((r) => r.status === "active").length ?? 0;
  const newCandidates = counts?.resources.filter((r) => r.status === "new").length ?? 0;

  const uploadedCount = counts?.resources.length ?? 0;
  const screeningCount = counts?.matches.length ?? 0;
  const techCount = counts?.technicalReviews.length ?? 0;
  const clientCount = counts?.clientInterviews.length ?? 0;
  const selectedCount =
    counts?.clientInterviews.filter((i) => i.status === "selected").length ?? 0;
  const onboardingCount = counts?.onboardings.length ?? 0;
  const deployedCount = counts?.deployments.filter((d) => d.status === "active").length ?? 0;

  const clientScheduled =
    counts?.clientInterviews.filter((i) => i.status === "scheduled").length ?? 0;

  return (
    <AppShell title="Dashboard" subtitle="Overview of your recruitment pipeline">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Open Requirements"
            value={openRequirements}
            hint={`${inProgressReqs} in progress`}
            Icon={FileText}
            tone="primary"
          />
          <KpiCard
            label="Active Resources"
            value={activeResources}
            hint={`${newCandidates} new this week`}
            Icon={Users}
            tone="warning"
          />
          <KpiCard
            label="Client Interviews"
            value={clientScheduled}
            hint="scheduled"
            Icon={UserCheck}
            tone="success"
          />
          <KpiCard
            label="Active Deployments"
            value={deployedCount}
            hint={`${onboardingCount} onboarding`}
            Icon={Rocket}
            tone="info"
          />
        </div>

        {/* Funnel */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recruitment Funnel</h2>
              <p className="text-sm text-muted-foreground">
                Candidate flow from resume upload through deployment
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <TrendingUp className="h-3.5 w-3.5" /> Live
            </span>
          </div>

          <FunnelChart
            stages={[
              { label: "Uploaded", count: uploadedCount, color: "oklch(0.72 0.13 175)" },
              { label: "Screening", count: screeningCount, color: "oklch(0.7 0.14 210)" },
              { label: "Technical", count: techCount, color: "oklch(0.75 0.16 65)" },
              { label: "Client Interview", count: clientCount, color: "oklch(0.7 0.17 30)" },
              { label: "Selected", count: selectedCount, color: "oklch(0.62 0.16 155)" },
              { label: "Onboarding", count: onboardingCount, color: "oklch(0.58 0.15 275)" },
              { label: "Deployed", count: deployedCount, color: "oklch(0.55 0.14 170)" },
            ]}
          />
        </section>

        {/* Status summaries */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Candidate Status"
            Icon={Users}
            rows={[
              { label: "Selected", value: selectedCount, tone: "success", Icon: CheckCircle2 },
              {
                label: "Awaiting Review",
                value:
                  counts?.technicalReviews.filter((r) => r.status === "pending_review").length ??
                  0,
                tone: "warning",
                Icon: ClipboardCheck,
              },
              {
                label: "Awaiting Client",
                value:
                  counts?.clientInterviews.filter((i) => i.status === "awaiting_scheduling")
                    .length ?? 0,
                tone: "info",
                Icon: CalendarClock,
              },
              {
                label: "Rejected",
                value:
                  (counts?.technicalReviews.filter((r) => r.status === "rejected").length ?? 0) +
                  (counts?.clientInterviews.filter((i) => i.status === "rejected").length ?? 0),
                tone: "danger",
                Icon: XCircle,
              },
              {
                label: "Hold",
                value:
                  (counts?.technicalReviews.filter((r) => r.status === "hold").length ?? 0) +
                  (counts?.clientInterviews.filter((i) => i.status === "hold").length ?? 0),
                tone: "muted",
                Icon: PauseCircle,
              },
            ]}
          />

          <SummaryCard
            title="Requirements"
            Icon={FileText}
            rows={[
              { label: "Open", value: openRequirements, tone: "primary", Icon: Sparkles },
              {
                label: "In Progress",
                value: inProgressReqs,
                tone: "warning",
                Icon: ClipboardCheck,
              },
              { label: "Filled", value: filledReqs, tone: "success", Icon: CheckCircle2 },
              { label: "Closed", value: closedReqs, tone: "muted", Icon: XCircle },
            ]}
          />

          <SummaryCard
            title="Onboarding"
            Icon={Briefcase}
            rows={[
              {
                label: "Not Started",
                value: counts?.onboardings.filter((o) => o.status === "not_started").length ?? 0,
                tone: "muted",
                Icon: PauseCircle,
              },
              {
                label: "In Progress",
                value: counts?.onboardings.filter((o) => o.status === "in_progress").length ?? 0,
                tone: "warning",
                Icon: ClipboardCheck,
              },
              {
                label: "Awaiting Docs",
                value:
                  counts?.onboardings.filter((o) => o.status === "awaiting_documents").length ?? 0,
                tone: "info",
                Icon: CalendarClock,
              },
              {
                label: "Completed",
                value: counts?.onboardings.filter((o) => o.status === "completed").length ?? 0,
                tone: "success",
                Icon: CheckCircle2,
              },
            ]}
          />
        </div>

        {/* Empty state hint */}
        {uploadedCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              Your pipeline is ready
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Upload a resume and let AI parse it into a full candidate profile. Every stage of the
              journey — screening, technical review, client interview, onboarding — lives here.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <ArrowUpRight className="h-4 w-4" /> Upload first resume
            </button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

// ---------- components ----------



type Tone = "primary" | "success" | "warning" | "info" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  info: "bg-info/10 text-info",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

const gradientBg: Record<string, string> = {
  primary: "var(--gradient-primary)",
  warning: "var(--gradient-warning)",
  success: "var(--gradient-success)",
  info: "var(--gradient-info)",
};

function KpiCard({
  label,
  value,
  hint,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  Icon: ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "info";
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-[var(--shadow-elevated)]"
      style={{ backgroundImage: gradientBg[tone] }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="mt-2 text-4xl font-bold leading-none">{value}</p>
          {hint ? <p className="mt-2 text-xs text-white/75">{hint}</p> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function FunnelChart({
  stages,
}: {
  stages: { label: string; count: number; color: string }[];
}) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const pct = Math.max((s.count / max) * 100, 4);
        return (
          <div key={s.label} className="flex items-center gap-4">
            <div className="flex w-36 items-center gap-2 text-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <span className="font-medium text-foreground">{s.label}</span>
            </div>
            <div className="flex-1">
              <div className="h-8 w-full rounded-lg bg-muted/50">
                <div
                  className="flex h-8 items-center justify-end rounded-lg px-3 text-sm font-semibold text-white transition-all"
                  style={{ width: `${pct}%`, backgroundColor: s.color }}
                >
                  {s.count > 0 ? s.count : ""}
                </div>
              </div>
            </div>
            <div className="w-12 text-right text-sm font-semibold tabular-nums text-foreground">
              {s.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SummaryCard({
  title,
  Icon,
  rows,
}: {
  title: string;
  Icon: ComponentType<{ className?: string }>;
  rows: {
    label: string;
    value: number;
    tone: Tone;
    Icon: ComponentType<{ className?: string }>;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {rows.map((r) => {
          const RowIcon = r.Icon;
          return (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-md ${toneClasses[r.tone]}`}
                >
                  <RowIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-foreground">{r.label}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-foreground">{r.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


