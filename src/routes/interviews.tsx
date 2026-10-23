import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db, type ClientInterviewStatus } from "@/lib/db";

export const Route = createFileRoute("/interviews")({
  head: () => ({ meta: [{ title: "Client Interviews — TalentFlow" }] }),
  component: InterviewsPage,
});

function InterviewsPage() {
  const list = useLiveQuery(() => db.clientInterviews.toArray(), []);
  const resources = useLiveQuery(() => db.resources.toArray(), []);
  const requirements = useLiveQuery(() => db.requirements.toArray(), []);

  const rName = (id: number) => resources?.find((r) => r.id === id)?.name ?? "—";
  const qName = (id: number) => {
    const r = requirements?.find((x) => x.id === id);
    return r ? `${r.client} · ${r.position}` : "—";
  };

  const update = (id: number, patch: Partial<import("@/lib/db").ClientInterview>) =>
    db.clientInterviews.update(id, patch);

  const setStatus = async (it: NonNullable<typeof list>[number], status: ClientInterviewStatus) => {
    if (!it.id) return;
    await db.clientInterviews.update(it.id, { status });
    if (status === "selected") {
      const exists = await db.assignments
        .where({ resourceId: it.resourceId, requirementId: it.requirementId })
        .first();
      if (!exists) {
        await db.assignments.add({
          resourceId: it.resourceId,
          requirementId: it.requirementId,
          status: "pending_approval",
          createdAt: Date.now(),
        });
      }
      toast.success("Selected — assignment created");
    } else {
      toast.success(`Marked ${status.replace(/_/g, " ")}`);
    }
  };

  return (
    <AppShell title="Client Interviews" subtitle="Stage 5 — Client-facing interview coordination">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Requirement</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Interviewer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list?.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{rName(it.resourceId)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{qName(it.requirementId)}</td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={it.interviewDate ?? ""}
                    onChange={(e) => it.id && update(it.id, { interviewDate: e.target.value, status: it.status === "awaiting_scheduling" ? "scheduled" : it.status })}
                    className="rounded border border-input bg-background px-2 py-1 text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    value={it.interviewer ?? ""}
                    onChange={(e) => it.id && update(it.id, { interviewer: e.target.value })}
                    placeholder="Name"
                    className="w-32 rounded border border-input bg-background px-2 py-1 text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={it.rating ?? ""}
                    onChange={(e) => it.id && update(it.id, { rating: Number(e.target.value) })}
                    className="w-16 rounded border border-input bg-background px-2 py-1 text-xs"
                  />
                </td>
                <td className="px-4 py-3"><StatusBadge status={it.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(["scheduled", "completed", "selected", "rejected", "hold"] as ClientInterviewStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(it, s)}
                        className={`rounded border px-2 py-1 text-[11px] capitalize ${
                          it.status === s ? "border-primary bg-primary/10 text-primary" : "border-input"
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
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No client interviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
