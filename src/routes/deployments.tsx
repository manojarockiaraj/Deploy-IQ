import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db, type DeploymentStatus } from "@/lib/db";

export const Route = createFileRoute("/deployments")({
  head: () => ({ meta: [{ title: "Deployments — TalentFlow" }] }),
  component: DeploymentsPage,
});

function DeploymentsPage() {
  const list = useLiveQuery(() => db.deployments.toArray(), []);
  const resources = useLiveQuery(() => db.resources.toArray(), []);
  const assignments = useLiveQuery(() => db.assignments.toArray(), []);
  const requirements = useLiveQuery(() => db.requirements.toArray(), []);

  const rName = (id: number) => resources?.find((r) => r.id === id)?.name ?? "—";
  const project = (aid: number) => {
    const a = assignments?.find((x) => x.id === aid);
    const q = requirements?.find((x) => x.id === a?.requirementId);
    return q ? `${q.client} · ${q.project}` : "—";
  };

  const update = (id: number, patch: Partial<import("@/lib/db").Deployment>) =>
    db.deployments.update(id, patch);

  const setStatus = async (id: number, status: DeploymentStatus) => {
    await db.deployments.update(id, { status });
    if (status === "active") {
      // mark linked requirement as filled
      const d = list?.find((x) => x.id === id);
      const a = assignments?.find((x) => x.id === d?.assignmentId);
      if (a) await db.requirements.update(a.requirementId, { status: "filled", updatedAt: Date.now() });
    }
    toast.success(`Deployment ${status}`);
  };

  return (
    <AppShell title="Deployments" subtitle="Stage 8 — Resource deployment tracking">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list?.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{rName(d.resourceId)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{project(d.assignmentId)}</td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={d.startDate ?? ""}
                    onChange={(e) => d.id && update(d.id, { startDate: e.target.value })}
                    className="rounded border border-input bg-background px-2 py-1 text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={d.endDate ?? ""}
                    onChange={(e) => d.id && update(d.id, { endDate: e.target.value })}
                    className="rounded border border-input bg-background px-2 py-1 text-xs"
                  />
                </td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(["scheduled", "active", "completed", "extended", "released"] as DeploymentStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => d.id && setStatus(d.id, s)}
                        className={`rounded border px-2 py-1 text-[11px] capitalize ${
                          d.status === s ? "border-primary bg-primary/10 text-primary" : "border-input"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {list?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No deployments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
