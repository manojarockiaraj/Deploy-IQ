const toneMap: Record<string, string> = {
  new: "bg-info/10 text-info",
  active: "bg-success/10 text-success",
  archived: "bg-muted text-muted-foreground",
  profile_incomplete: "bg-warning/15 text-warning-foreground",
  open: "bg-primary/10 text-primary",
  in_progress: "bg-warning/15 text-warning-foreground",
  filled: "bg-success/10 text-success",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  shortlisted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  sent_for_technical: "bg-info/10 text-info",
  pending_review: "bg-warning/15 text-warning-foreground",
  scheduled: "bg-info/10 text-info",
  interview_completed: "bg-primary/10 text-primary",
  selected: "bg-success/10 text-success",
  hold: "bg-muted text-muted-foreground",
  awaiting_scheduling: "bg-warning/15 text-warning-foreground",
  completed: "bg-success/10 text-success",
  pending_approval: "bg-warning/15 text-warning-foreground",
  approved: "bg-success/10 text-success",
  not_started: "bg-muted text-muted-foreground",
  awaiting_documents: "bg-warning/15 text-warning-foreground",
  active_deployment: "bg-success/10 text-success",
  extended: "bg-info/10 text-info",
  released: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status in toneMap ? status : "muted";
  const cls = toneMap[key] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
