import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { CheckSquare, Square } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db, type Onboarding } from "@/lib/db";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — TalentFlow" }] }),
  component: OnboardingPage,
});

const CHECKS: [keyof Onboarding, string][] = [
  ["offerLetter", "Offer letter"],
  ["contractSigned", "Contract signed"],
  ["identityVerified", "Identity verified"],
  ["rightToWork", "Right to work"],
  ["equipmentAllocated", "Equipment allocated"],
  ["trainingComplete", "Training complete"],
];

function OnboardingPage() {
  const list = useLiveQuery(() => db.onboardings.toArray(), []);
  const resources = useLiveQuery(() => db.resources.toArray(), []);
  const rName = (id: number) => resources?.find((r) => r.id === id)?.name ?? "—";

  const toggle = async (o: NonNullable<typeof list>[number], key: keyof Onboarding) => {
    if (!o.id) return;
    const patch = { [key]: !o[key] } as Partial<Onboarding>;
    const merged = { ...o, ...patch };
    const done = CHECKS.every(([k]) => merged[k]);
    const any = CHECKS.some(([k]) => merged[k]);
    patch.status = done ? "completed" : any ? "in_progress" : "not_started";
    await db.onboardings.update(o.id, patch);
    if (done && o.status !== "completed") {
      const exists = await db.deployments.where({ assignmentId: o.assignmentId }).first();
      if (!exists) {
        await db.deployments.add({
          resourceId: o.resourceId,
          assignmentId: o.assignmentId,
          status: "scheduled",
          createdAt: Date.now(),
        });
        toast.success("Onboarding complete — deployment scheduled");
      }
    }
  };

  return (
    <AppShell title="Onboarding" subtitle="Stage 7 — HR-driven onboarding checklist">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list?.map((o) => {
          const doneCount = CHECKS.filter(([k]) => o[k]).length;
          return (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{rName(o.resourceId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {doneCount}/{CHECKS.length} steps complete
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-4 space-y-2">
                {CHECKS.map(([key, label]) => {
                  const checked = Boolean(o[key]);
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(o, key)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      {checked ? (
                        <CheckSquare className="h-4 w-4 text-success" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={checked ? "line-through text-muted-foreground" : ""}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {list?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No onboardings yet. Approve an assignment first.
          </div>
        )}
      </div>
    </AppShell>
  );
}
