import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Plus, Mail, Phone, MapPin, Trash2, Pencil } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { db, type Resource, type ResourceStatus } from "@/lib/db";
import { parseResumeText } from "@/lib/pipeline";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources — TalentFlow" }] }),
  component: ResourcesPage,
});

const SAMPLE_RESUME = `Rahul Verma
rahul.verma@example.com
+91 99887 76655
Location: Pune, India
Currently at TCS
Notice Period: 30 days
Availability: 1 month
Expected Rate: $50/hr

Summary: 7 years of experience building web applications with React, TypeScript, Node.js, AWS, and GraphQL.`;

type EditDraft = Partial<Resource> & { skillsCsv?: string };

function ResourcesPage() {
  const resources = useLiveQuery(() => db.resources.orderBy("createdAt").reverse().toArray(), []);
  const [open, setOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof parseResumeText> | null>(null);
  const [editing, setEditing] = useState<EditDraft | null>(null);

  const parse = () => {
    if (!resumeText.trim()) return toast.error("Paste resume text first");
    setPreview(parseResumeText(resumeText));
  };

  const save = async () => {
    if (!preview) return;
    if (!preview.name || !preview.email) return toast.error("Name and email are required");
    const now = Date.now();
    await db.resources.add({
      name: preview.name!,
      email: preview.email!,
      phone: preview.phone,
      skills: preview.skills ?? [],
      experienceYears: preview.experienceYears ?? 0,
      currentLocation: preview.currentLocation,
      currentEmployer: preview.currentEmployer,
      availability: preview.availability,
      noticePeriod: preview.noticePeriod,
      expectedRate: preview.expectedRate,
      linkedin: preview.linkedin,
      resumeText: preview.resumeText,
      status: (preview.skills?.length ?? 0) > 0 ? "active" : "profile_incomplete",
      createdAt: now,
      updatedAt: now,
    });
    toast.success("Resource added to pipeline");
    setResumeText("");
    setPreview(null);
    setOpen(false);
  };

  const remove = async (id: number) => {
    await db.resources.delete(id);
    toast.success("Resource removed");
  };

  const openEdit = (r: Resource) => {
    setEditing({ ...r, skillsCsv: r.skills.join(", ") });
  };

  const saveEdit = async () => {
    if (!editing?.id) return;
    if (!editing.name || !editing.email) return toast.error("Name and email are required");
    const skills = (editing.skillsCsv ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await db.resources.update(editing.id, {
      name: editing.name,
      email: editing.email,
      phone: editing.phone,
      skills,
      experienceYears: Number(editing.experienceYears ?? 0),
      currentLocation: editing.currentLocation,
      currentEmployer: editing.currentEmployer,
      availability: editing.availability,
      noticePeriod: editing.noticePeriod,
      expectedRate: editing.expectedRate,
      linkedin: editing.linkedin,
      status: editing.status as ResourceStatus,
      updatedAt: Date.now(),
    });
    toast.success("Profile updated");
    setEditing(null);
  };

  return (
    <AppShell title="Resources" subtitle="Stage 1 — Resume upload and resource profiles">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {resources?.length ?? 0} candidates in the pool
        </p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elevated)]"
        >
          <Upload className="h-4 w-4" /> Upload Resume
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources?.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{r.name}</h3>
                  <p className="text-xs text-muted-foreground">{r.experienceYears} yrs experience</p>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> {r.email || "—"}
              </p>
              {r.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {r.phone}
                </p>
              )}
              {r.currentLocation && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> {r.currentLocation}
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.skills.slice(0, 6).map((s) => (
                <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground">
                  {s}
                </span>
              ))}
              {r.skills.length > 6 && (
                <span className="text-[11px] text-muted-foreground">+{r.skills.length - 6}</span>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>Notice: {r.noticePeriod ?? "—"}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEdit(r)}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => r.id && remove(r.id)}
                  className="inline-flex items-center gap-1 text-destructive hover:underline"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        {resources?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No candidates yet — click Upload Resume to get started.
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Resume</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  setPreview(null);
                }}
                className="text-sm text-muted-foreground"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste resume text below and let our parser extract structured fields.
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume content here..."
              className="mt-3 h-40 w-full rounded-lg border border-input bg-background p-3 text-sm"
            />
            <div className="mt-2 flex justify-between">
              <button
                onClick={() => setResumeText(SAMPLE_RESUME)}
                className="text-xs text-primary hover:underline"
              >
                Load sample resume
              </button>
              <button
                onClick={parse}
                className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
              >
                Parse with AI
              </button>
            </div>

            {preview && (
              <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Parsed profile
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Name" value={preview.name} onChange={(v) => setPreview({ ...preview, name: v })} />
                  <Field label="Email" value={preview.email} onChange={(v) => setPreview({ ...preview, email: v })} />
                  <Field label="Phone" value={preview.phone} onChange={(v) => setPreview({ ...preview, phone: v })} />
                  <Field label="Location" value={preview.currentLocation} onChange={(v) => setPreview({ ...preview, currentLocation: v })} />
                  <Field label="Employer" value={preview.currentEmployer} onChange={(v) => setPreview({ ...preview, currentEmployer: v })} />
                  <Field label="Experience (yrs)" value={String(preview.experienceYears ?? 0)} onChange={(v) => setPreview({ ...preview, experienceYears: parseInt(v || "0", 10) })} />
                  <Field label="Notice" value={preview.noticePeriod} onChange={(v) => setPreview({ ...preview, noticePeriod: v })} />
                  <Field label="Expected Rate" value={preview.expectedRate} onChange={(v) => setPreview({ ...preview, expectedRate: v })} />
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Skills</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(preview.skills ?? []).map((s) => (
                      <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {s}
                      </span>
                    ))}
                    {(preview.skills ?? []).length === 0 && (
                      <span className="text-xs text-muted-foreground">No skills detected</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setPreview(null);
                }}
                className="rounded-md border border-input px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!preview}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Save Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <button onClick={() => setEditing(null)} className="text-sm text-muted-foreground">
                Close
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Email" value={editing.email} onChange={(v) => setEditing({ ...editing, email: v })} />
              <Field label="Phone" value={editing.phone} onChange={(v) => setEditing({ ...editing, phone: v })} />
              <Field label="Location" value={editing.currentLocation} onChange={(v) => setEditing({ ...editing, currentLocation: v })} />
              <Field label="Employer" value={editing.currentEmployer} onChange={(v) => setEditing({ ...editing, currentEmployer: v })} />
              <Field
                label="Experience (yrs)"
                value={String(editing.experienceYears ?? 0)}
                onChange={(v) => setEditing({ ...editing, experienceYears: parseInt(v || "0", 10) })}
              />
              <Field label="Notice" value={editing.noticePeriod} onChange={(v) => setEditing({ ...editing, noticePeriod: v })} />
              <Field label="Availability" value={editing.availability} onChange={(v) => setEditing({ ...editing, availability: v })} />
              <Field label="Expected Rate" value={editing.expectedRate} onChange={(v) => setEditing({ ...editing, expectedRate: v })} />
              <Field label="LinkedIn" value={editing.linkedin} onChange={(v) => setEditing({ ...editing, linkedin: v })} />
              <label className="col-span-2 flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Skills (comma separated)</span>
                <input
                  value={editing.skillsCsv ?? ""}
                  onChange={(e) => setEditing({ ...editing, skillsCsv: e.target.value })}
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Status</span>
                <select
                  value={editing.status ?? "active"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as ResourceStatus })}
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                >
                  <option value="new">New</option>
                  <option value="profile_incomplete">Profile Incomplete</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border border-input px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase text-muted-foreground">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      />
    </label>
  );
}
