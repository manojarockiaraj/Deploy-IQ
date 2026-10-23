import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { db, DEFAULT_WEEK_OFFS } from "@/lib/db";

export const Route = createFileRoute("/holidays")({
  head: () => ({
    meta: [
      { title: "Holiday Tracker — TalentFlow" },
      { name: "description", content: "Deployed resources mark leave on a calendar with admin holidays and week offs." },
      { property: "og:title", content: "Holiday Tracker — TalentFlow" },
      { property: "og:description", content: "Mark leave and view holidays for deployed resources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HolidayTrackerPage,
});

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function HolidayTrackerPage() {
  const deployments = useLiveQuery(() => db.deployments.toArray(), []);
  const resources = useLiveQuery(() => db.resources.toArray(), []);
  const holidays = useLiveQuery(() => db.holidays.toArray(), []);
  const weekOffSetting = useLiveQuery(() => db.settings.get("weekOffs"), []);
  const weekOffs = (weekOffSetting?.value as number[] | undefined) ?? DEFAULT_WEEK_OFFS;

  const deployed = useMemo(() => {
    const ids = new Set(
      (deployments ?? []).filter((d) => ["scheduled", "active", "extended"].includes(d.status)).map((d) => d.resourceId),
    );
    return (resources ?? []).filter((r) => r.id && ids.has(r.id));
  }, [deployments, resources]);

  const [resourceId, setResourceId] = useState<number | null>(null);
  const activeId = resourceId ?? deployed[0]?.id ?? null;
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const leaves = useLiveQuery(
    () => (activeId ? db.leaves.where("resourceId").equals(activeId).toArray() : []),
    [activeId],
  );
  const leaveSet = new Set((leaves ?? []).map((l) => l.date));
  const holidayMap = new Map((holidays ?? []).map((h) => [h.date, h.name]));

  const first = new Date(cursor.y, cursor.m, 1).getDay();
  const daysIn = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
  const monthPrefix = `${cursor.y}-${pad(cursor.m + 1)}`;
  const leaveCount = [...leaveSet].filter((d) => d.startsWith(monthPrefix)).length;

  const toggle = async (date: string) => {
    if (!activeId) return;
    const existing = await db.leaves.where("[resourceId+date]").equals([activeId, date]).first();
    if (existing?.id) {
      await db.leaves.delete(existing.id);
      toast.success(`Leave removed for ${date}`);
    } else {
      await db.leaves.add({ resourceId: activeId, date, createdAt: Date.now() });
      toast.success(`Leave marked for ${date}`);
    }
  };

  const shift = (n: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <AppShell title="Holiday Tracker" subtitle="Deployed resources — mark attendance / leave">
      {deployed.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          No deployed resources yet. Resources appear here once they have a scheduled or active deployment.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <select
              value={activeId ?? ""}
              onChange={(e) => setResourceId(Number(e.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {deployed.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => shift(-1)} className="rounded-md border border-input p-2" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
              <span className="w-40 text-center font-semibold">{monthLabel}</span>
              <button onClick={() => shift(1)} className="rounded-md border border-input p-2" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-warning/40" /> Leave</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary/20" /> Holiday</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted" /> Week off</span>
            <span className="ml-auto font-medium text-foreground">Leaves this month: {leaveCount}</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const date = ymd(cursor.y, cursor.m, d);
              const dow = new Date(cursor.y, cursor.m, d).getDay();
              const holiday = holidayMap.get(date);
              const off = weekOffs.includes(dow);
              const locked = !!holiday || off;
              const isLeave = leaveSet.has(date);
              const bg = holiday ? "bg-primary/15" : off ? "bg-muted" : isLeave ? "bg-warning/30" : "bg-background";
              return (
                <label
                  key={i}
                  className={`flex min-h-20 flex-col rounded-lg border border-border p-2 text-left text-xs ${bg} ${locked ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{d}</span>
                    <input
                      type="checkbox"
                      disabled={locked}
                      checked={isLeave && !locked}
                      onChange={() => toggle(date)}
                      className="h-4 w-4 accent-primary"
                    />
                  </div>
                  <span className="mt-auto truncate text-muted-foreground">
                    {holiday ? holiday : off ? "Week off" : isLeave ? "Leave" : "Present"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
