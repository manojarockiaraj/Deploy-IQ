import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db } from "@/lib/db";
import { computeMatchScore } from "@/lib/pipeline";

export const Route = createFileRoute("/matching")({
  head: () => ({ meta: [{ title: "Matching — TalentFlow" }] }),
  component: MatchingPage,
});

function MatchingPage() {
  const requirements = useLiveQuery(() => db.requirements.toArray(), []);
  const resources = useLiveQuery(() => db.resources.toArray(), []);
  const matches = useLiveQuery(() => db.matches.toArray(), []);
  const [reqId, setReqId] = useState<number | null>(null);

  const selected = requirements?.find((r) => r.id === reqId) ?? requirements?.[0];
  const activeReqId = selected?.id ?? null;

  const ranked = useMemo(() => {
    if (!selected || !resources) return [];
    return resources
      .map((r) => ({ resource: r, ...computeMatchScore(r, selected) }))
      .sort((a, b) => b.score - a.score);
  }, [selected, resources]);

  const getMatch = (resourceId: number) =>
    matches?.find((m) => m.resourceId === resourceId && m.requirementId === activeReqId);

  const sendToTechnical = async (resourceId: number, score: number, matched: number, total: number) => {
    if (!activeReqId) return;
    const existing = getMatch(resourceId);
    const now = Date.now();
    if (existing?.id) {
      await db.matches.update(existing.id, { status: "sent_for_technical", matchScore: score });
    } else {
      await db.matches.add({
        resourceId,
        requirementId: activeReqId,
        matchScore: score,
        skillsMatched: matched,
        skillsTotal: total,
        status: "sent_for_technical",
        createdAt: now,
      });
    }
    const techExists = await db.technicalReviews
      .where({ resourceId, requirementId: activeReqId })
      .first();
    if (!techExists) {
      await db.technicalReviews.add({
        resourceId,
        requirementId: activeReqId,
        status: "pending_review",
        createdAt: now,
      });
    }
    await db.requirements.update(activeReqId, { status: "in_progress", updatedAt: now });
    toast.success("Sent to technical review");
  };

  const shortlist = async (resourceId: number, score: number, matched: number, total: number) => {
    if (!activeReqId) return;
    const existing = getMatch(resourceId);
    if (existing?.id) {
      await db.matches.update(existing.id, { status: "shortlisted" });
    } else {
      await db.matches.add({
        resourceId,
        requirementId: activeReqId,
        matchScore: score,
        skillsMatched: matched,
        skillsTotal: total,
        status: "shortlisted",
        createdAt: Date.now(),
      });
    }
    toast.success("Shortlisted");
  };

  const reject = async (resourceId: number, score: number, matched: number, total: number) => {
    if (!activeReqId) return;
    const existing = getMatch(resourceId);
    if (existing?.id) {
      await db.matches.update(existing.id, { status: "rejected" });
    } else {
      await db.matches.add({
        resourceId,
        requirementId: activeReqId,
        matchScore: score,
        skillsMatched: matched,
        skillsTotal: total,
        status: "rejected",
        createdAt: Date.now(),
      });
    }
    toast.success("Rejected");
  };

  return (
    <AppShell title="Resource Matching" subtitle="Stage 3 — AI-powered candidate matching">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">Requirement:</label>
        <select
          value={activeReqId ?? ""}
          onChange={(e) => setReqId(Number(e.target.value))}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {requirements?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.client} — {r.position}
            </option>
          ))}
        </select>
        {selected && (
          <span className="text-xs text-muted-foreground">
            Needs: {selected.skillsRequired.join(", ")} · {selected.experienceRequired}+ yrs
          </span>
        )}
      </div>

      {!selected ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Create a requirement first.
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map(({ resource, score, matched, total }) => {
            const m = getMatch(resource.id!);
            return (
              <div
                key={resource.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {resource.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-semibold">{resource.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.experienceYears} yrs · {resource.currentLocation ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary/20 text-sm font-bold text-primary">
                    {score}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {matched}/{total} skills
                    </p>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap gap-1">
                    {resource.skills.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          selected.skillsRequired.map((r) => r.toLowerCase()).includes(s.toLowerCase())
                            ? "bg-success/15 text-success"
                            : "bg-muted"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {m ? (
                  <StatusBadge status={m.status} />
                ) : (
                  <span className="text-xs text-muted-foreground">new</span>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => shortlist(resource.id!, score, matched, total)}
                    className="rounded-md border border-input px-3 py-1.5 text-xs"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => reject(resource.id!, score, matched, total)}
                    className="rounded-md border border-input px-3 py-1.5 text-xs text-destructive"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => sendToTechnical(resource.id!, score, matched, total)}
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    Technical <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
