import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { db, DEFAULT_WEEK_OFFS } from "@/lib/db";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TalentFlow" },
      { name: "description", content: "Configure company holidays and weekly offs for deployed resources." },
      { property: "og:title", content: "Settings — TalentFlow" },
      { property: "og:description", content: "Configure company holidays and weekly offs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function SettingsPage() {
  const weekOffSetting = useLiveQuery(() => db.settings.get("weekOffs"), []);
  const weekOffs = (weekOffSetting?.value as number[] | undefined) ?? DEFAULT_WEEK_OFFS;
  const holidays = useLiveQuery(() => db.holidays.orderBy("date").toArray(), []);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");

  const toggleDay = async (d: number) => {
    const next = weekOffs.includes(d) ? weekOffs.filter((x) => x !== d) : [...weekOffs, d].sort();
    await db.settings.put({ key: "weekOffs", value: next });
    toast.success("Week off updated");
  };

  const addHoliday = async () => {
    const n = name.trim();
    if (!date || !n) return toast.error("Date and name are required");
    if (n.length > 100) return toast.error("Name too long");
    if (await db.holidays.where("date").equals(date).first()) return toast.error("Holiday already set for that date");
    await db.holidays.add({ date, name: n });
    setDate("");
    setName("");
    toast.success("Holiday added");
  };

  return (
    <AppShell title="Settings" subtitle="Admin — holidays & week off configuration">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Week off</h2>
          <p className="mb-4 text-sm text-muted-foreground">Selected days are blocked on every resource's calendar.</p>
          <div className="space-y-2">
            {DAYS.map((d, i) => (
              <label key={d} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <input type="checkbox" checked={weekOffs.includes(i)} onChange={() => toggleDay(i)} className="h-4 w-4 accent-primary" />
                {d}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Holidays</h2>
          <p className="mb-4 text-sm text-muted-foreground">Company holidays can't be marked by resources.</p>
          <div className="mb-4 flex flex-wrap gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="Holiday name" className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <button onClick={addHoliday} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add</button>
          </div>
          <ul className="divide-y divide-border">
            {holidays?.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                <span><span className="font-medium">{h.date}</span> — {h.name}</span>
                <button onClick={() => h.id && db.holidays.delete(h.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete holiday">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {holidays?.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No holidays yet.</li>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
