import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db, type AssignmentStatus } from "@/lib/db";

export const Route = createFileRoute("/assignments")({
  head: () => ({ meta: [{ title: "Assignments — TalentFlow" }] }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const list = useLiveQuery(() => db.assignments.toArray(), []);
  const resources = useLiveQuery(() => db.resources.toArray(), []);
  const requirements = useLiveQuery(() => db.requirements.toArray(), []);

  const rName = (id: number) => resources?.find((r) => r.id === id)?.name ?? "—";
  const qName = (id: number) => {
    const r = requirements?.find((x) => x.id === id);
    return r ? `${r.client} · ${r.position}` : "—";
  };

  const update = (id: number, patch: Partial<import("@/lib/db").Assignment>) =>
    db.assignments.update(id, patch);

  const setStatus = async (a: NonNullable<typeof list>[number], status: AssignmentStatus) => {
    if (!a.id) return;
    await db.assignments.update(a.id, { status });
    if (status === "approved") {
      const exists = await db.onboardings.where({ assignmentId: a.id }).first();
      if (!exists) {
        await db.onboardings.add({
          resourceId: a.resourceId,
          assignmentId: a.id,
          offerLetter: false,
          contractSigned: false,
          identityVerified: false,
          rightToWork: false,
          equipmentAllocated: false,
          trainingComplete: false,
          status: "not_started",
          createdAt: Date.now(),
        });
      }
      toast.success("Approved — onboarding started");
    } else toast.success(`Marked ${status.replace(/_/g, " ")}`);
  };

  return (
    <AppShell title="Assignments" subtitle="Stage 6 — Assignment approval">
      <div className="space-y-3">
        {list?.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{rName(a.resourceId)}</p>
                <p className="text-xs text-muted-foreground">{qName(a.requirementId)}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Start</span>
                <input
                  type="date"
                  value={a.startDate ?? ""}
                  onChange={(e) => a.id && update(a.id, { startDate: e.target.value })}
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">End</span>
                <input
                  type="date"
                  value={a.endDate ?? ""}
                  onChange={(e) => a.id && update(a.id, { endDate: e.target.value })}
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Rate</span>
                <input
                  value={a.rate ?? ""}
                  onChange={(e) => a.id && update(a.id, { rate: e.target.value })}
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["approved", "rejected", "hold"] as AssignmentStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(a, s)}
                  className={`rounded-md border px-3 py-1.5 text-xs capitalize ${
                    a.status === s ? "border-primary bg-primary/10 text-primary" : "border-input"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {list?.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No assignments yet.
          </div>
        )}
      </div>
    </AppShell>
  );
}
