import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db, type Match, type TechnicalReview, type TechnicalStatus } from "@/lib/db";

export const Route = createFileRoute("/technical")({
  head: () => ({ meta: [{ title: "Technical Review — TalentFlow" }] }),
  component: TechnicalPage,
});

interface Row {
  resourceId: number;
  requirementId: number;
  matchScore?: number;
  review?: TechnicalReview;
}

const ALL_STATUSES: TechnicalStatus[] = [
  "pending_review",
  "scheduled",
  "interview_completed",
  "selected",
  "rejected",
  "hold",
];

function TechnicalPage() {
  const reviews = useLiveQuery(() => db.technicalReviews.toArray(), []);
  const matches = useLiveQuery(
    () => db.matches.where("status").equals("sent_for_technical").toArray(),
    []
  );
  const resources = useLiveQuery(() => db.resources.toArray(), []);
  const requirements = useLiveQuery(() => db.requirements.toArray(), []);
  const [selected, setSelected] = useState<{ resourceId: number; requirementId: number } | null>(null);
  const [draft, setDraft] = useState<Partial<TechnicalReview>>({});

  const [reqFilter, setReqFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("");

  const matchMap = useMemo(() => {
    const map = new Map<string, Match>();
    matches?.forEach((m) => map.set(`${m.resourceId}:${m.requirementId}`, m));
    return map;
  }, [matches]);

  const rows: Row[] = useMemo(() => {
    const map = new Map<string, Row>();
    matches?.forEach((m) => {
      const k = `${m.resourceId}:${m.requirementId}`;
      map.set(k, { resourceId: m.resourceId, requirementId: m.requirementId, matchScore: m.matchScore });
    });
    reviews?.forEach((r) => {
      const k = `${r.resourceId}:${r.requirementId}`;
      const existing = map.get(k);
      map.set(k, {
        resourceId: r.resourceId,
        requirementId: r.requirementId,
        matchScore: existing?.matchScore ?? matchMap.get(k)?.matchScore,
        review: r,
      });
    });
    return Array.from(map.values());
  }, [matches, reviews, matchMap]);

  const filteredRows = useMemo(() => {
    const min = minScore === "" ? 0 : Number(minScore);
    return rows.filter((row) => {
      if (reqFilter !== "all" && `${row.requirementId}` !== reqFilter) return false;
      const status = row.review?.status ?? "pending_review";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if ((row.matchScore ?? 0) < min) return false;
      return true;
    });
  }, [rows, reqFilter, statusFilter, minScore]);

  const rName = (id: number) => resources?.find((r) => r.id === id)?.name ?? "—";
  const qName = (id: number) => {
    const r = requirements?.find((x) => x.id === id);
    return r ? `${r.client} · ${r.position}` : "—";
  };

  const selectedRow = selected
    ? rows.find((x) => x.resourceId === selected.resourceId && x.requirementId === selected.requirementId)
    : null;

  const openRow = (row: Row) => {
    setSelected({ resourceId: row.resourceId, requirementId: row.requirementId });
    setDraft(row.review ?? { status: "pending_review" });
  };

  const saveDraft = async (nextStatus?: TechnicalStatus) => {
    if (!selected) return;
    const status = nextStatus ?? (draft.status as TechnicalStatus) ?? "pending_review";
    const existing = await db.technicalReviews
      .where({ resourceId: selected.resourceId, requirementId: selected.requirementId })
      .first();
    const payload = {
      resourceId: selected.resourceId,
      requirementId: selected.requirementId,
      interviewer: draft.interviewer,
      technicalScore: draft.technicalScore,
      codingScore: draft.codingScore,
      communicationScore: draft.communicationScore,
      problemSolvingScore: draft.problemSolvingScore,
      domainScore: draft.domainScore,
      notes: draft.notes,
      status,
    };
    if (existing?.id) {
      await db.technicalReviews.update(existing.id, payload);
    } else {
      await db.technicalReviews.add({ ...payload, createdAt: Date.now() });
    }

    if (status === "selected") {
      const exists = await db.clientInterviews
        .where({ resourceId: selected.resourceId, requirementId: selected.requirementId })
        .first();
      if (!exists) {
        await db.clientInterviews.add({
          resourceId: selected.resourceId,
          requirementId: selected.requirementId,
          status: "awaiting_scheduling",
          createdAt: Date.now(),
        });
      }
      toast.success("Selected — moved to client interviews");
    } else {
      toast.success("Review saved");
    }
    setSelected(null);
    setDraft({});
  };

  return (
    <AppShell title="Technical Review" subtitle="Stage 4 — Internal technical screening">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Candidates assigned to requirements
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <select
                value={reqFilter}
                onChange={(e) => setReqFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                <option value="all">All requirements</option>
                {requirements?.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.client} · {q.position}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                <option value="all">All statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Min score</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {filteredRows.map((row) => {
              const isActive =
                selected?.resourceId === row.resourceId && selected?.requirementId === row.requirementId;
              const status = row.review?.status ?? "pending_review";
              return (
                <button
                  key={`${row.resourceId}:${row.requirementId}`}
                  onClick={() => openRow(row)}
                  className={`flex w-full items-center justify-between px-5 py-3 text-left transition ${
                    isActive ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium">{rName(row.resourceId)}</div>
                    <div className="text-xs text-muted-foreground">{qName(row.requirementId)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {row.matchScore != null && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {row.matchScore}%
                      </span>
                    )}
                    <StatusBadge status={status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
            {filteredRows.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No candidates match the selected filters.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          {!selectedRow ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-muted-foreground">
              Select a candidate to record review details.
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{rName(selectedRow.resourceId)}</h3>
                  <p className="text-xs text-muted-foreground">{qName(selectedRow.requirementId)}</p>
                </div>
                <StatusBadge status={(draft.status as string) ?? "pending_review"} />
              </div>

              <label className="mt-4 block">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">
                  Interviewer
                </span>
                <input
                  value={draft.interviewer ?? ""}
                  onChange={(e) => setDraft({ ...draft, interviewer: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  placeholder="Reviewer name"
                />
              </label>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {(
                  [
                    ["Technical", "technicalScore"],
                    ["Coding", "codingScore"],
                    ["Communication", "communicationScore"],
                    ["Problem Solving", "problemSolvingScore"],
                    ["Domain", "domainScore"],
                  ] as const
                ).map(([label, key]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium uppercase text-muted-foreground">
                      {label}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={(draft[key] as number | undefined) ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          [key]: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      placeholder="0-10"
                    />
                  </label>
                ))}
              </div>

              <label className="mt-3 block">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Notes</span>
                <textarea
                  value={draft.notes ?? ""}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  className="mt-1 h-24 w-full rounded-md border border-input bg-background p-2 text-sm"
                />
              </label>

              <div className="mt-3">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Status</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(
                    ["pending_review", "scheduled", "interview_completed", "selected", "rejected", "hold"] as TechnicalStatus[]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDraft({ ...draft, status: s })}
                      className={`rounded-md border px-3 py-1.5 text-xs capitalize ${
                        draft.status === s ? "border-primary bg-primary/10 text-primary" : "border-input"
                      }`}
                    >
                      {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelected(null);
                    setDraft({});
                  }}
                  className="rounded-md border border-input px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveDraft()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Save Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
