import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db, type RequirementStatus } from "@/lib/db";

export const Route = createFileRoute("/requirements")({
  head: () => ({ meta: [{ title: "Requirements — TalentFlow" }] }),
  component: RequirementsPage,
});

const empty = {
  client: "",
  project: "",
  position: "",
  skillsRequired: "",
  experienceRequired: 3,
  numberOfResources: 1,
  budget: "",
  startDate: "",
};

function RequirementsPage() {
  const items = useLiveQuery(() => db.requirements.orderBy("createdAt").reverse().toArray(), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const save = async () => {
    if (!form.client || !form.project || !form.position) {
      return toast.error("Client, project, and position are required");
    }
    const now = Date.now();
    await db.requirements.add({
      client: form.client,
      project: form.project,
      position: form.position,
      skillsRequired: form.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experienceRequired: Number(form.experienceRequired) || 0,
      numberOfResources: Number(form.numberOfResources) || 1,
      budget: form.budget,
      startDate: form.startDate,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    toast.success("Requirement created");
    setForm(empty);
    setOpen(false);
  };

  const setStatus = async (id: number, status: RequirementStatus) => {
    await db.requirements.update(id, { status, updatedAt: Date.now() });
  };

  return (
    <AppShell title="Requirements" subtitle="Stage 2 — Client job requirements">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items?.length ?? 0} requirements</p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New Requirement
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Client / Project</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Skills</th>
              <th className="px-4 py-3">Exp</th>
              <th className="px-4 py-3">Openings</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items?.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{r.client}</p>
                      <p className="text-xs text-muted-foreground">{r.project}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{r.position}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.skillsRequired.slice(0, 4).map((s) => (
                      <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{r.experienceRequired}+ yrs</td>
                <td className="px-4 py-3">{r.numberOfResources}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => r.id && setStatus(r.id, e.target.value as RequirementStatus)}
                    className="rounded border border-input bg-background px-2 py-1 text-xs capitalize"
                  >
                    {["open", "in_progress", "filled", "closed", "cancelled"].map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => r.id && db.requirements.delete(r.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No requirements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">New Requirement</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Client", "client"],
                ["Project", "project"],
                ["Position", "position"],
                ["Skills (comma separated)", "skillsRequired"],
                ["Experience required (yrs)", "experienceRequired"],
                ["Number of openings", "numberOfResources"],
                ["Budget", "budget"],
                ["Start date", "startDate"],
              ].map(([label, key]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium uppercase text-muted-foreground">
                    {label}
                  </span>
                  <input
                    type={key === "startDate" ? "date" : "text"}
                    value={String((form as Record<string, unknown>)[key] ?? "")}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value } as typeof form)
                    }
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  />
                </label>
              ))}
            </div>
            <StatusBadge status="open" />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-input px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
