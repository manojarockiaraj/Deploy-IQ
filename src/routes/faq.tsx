import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Users,
  Sparkles,
  ClipboardCheck,
  UserCheck,
  FileSignature,
  Briefcase,
  Rocket,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — TalentFlow" },
      { name: "description", content: "Learn how TalentFlow's 8-stage recruitment pipeline works end-to-end." },
      { property: "og:title", content: "FAQ — TalentFlow" },
      { property: "og:description", content: "Learn how TalentFlow's 8-stage recruitment pipeline works end-to-end." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

const flow = [
  {
    step: 1,
    title: "Resume Upload",
    icon: Upload,
    path: "/resources",
    summary: "Add candidates to the system.",
    details: [
      "Paste a resume or upload a document in the Resources page.",
      "The AI parser extracts name, email, phone, skills, experience, location, employer, notice period, and expected rate.",
      "You can also create or edit a candidate profile manually.",
    ],
  },
  {
    step: 2,
    title: "Resource Pool",
    icon: Users,
    path: "/resources",
    summary: "Manage your candidate database.",
    details: [
      "All candidates are stored in the Resources page with full profile details.",
      "Profiles are editable at any time.",
      "A candidate status can be new, active, shortlisted, rejected, or deployed.",
    ],
  },
  {
    step: 3,
    title: "Requirements",
    icon: FileSignature,
    path: "/requirements",
    summary: "Create client job requisitions.",
    details: [
      "Add a requirement with client, project, position, required skills, experience level, budget, start date, and number of resources needed.",
      "Requirements are listed as open until they are fully filled.",
    ],
  },
  {
    step: 4,
    title: "Matching",
    icon: Sparkles,
    path: "/matching",
    summary: "Match candidates to requirements.",
    details: [
      "Select a requirement to see all matching candidates ranked by a score.",
      "The score is based on required skills (70%) and experience (30%).",
      "You can shortlist, reject, or send a candidate to Technical Review.",
    ],
  },
  {
    step: 5,
    title: "Technical Review",
    icon: ClipboardCheck,
    path: "/technical",
    summary: "Run internal screening.",
    details: [
      "The Technical Review page lists candidates already assigned to requirements.",
      "Filter by requirement, review status, and minimum match score.",
      "Select a candidate to record the reviewer, interview date, feedback, score, and a pass/fail decision.",
      "A passed review automatically moves the candidate to Client Interviews.",
    ],
  },
  {
    step: 6,
    title: "Client Interviews",
    icon: UserCheck,
    path: "/interviews",
    summary: "Schedule and record client feedback.",
    details: [
      "Candidates who pass technical review appear in the Client Interviews page.",
      "Schedule the interview, add interviewer details, and capture feedback.",
      "Selecting a candidate here creates an Assignment record.",
    ],
  },
  {
    step: 7,
    title: "Assignments",
    icon: FileSignature,
    path: "/assignments",
    summary: "Approve placement details.",
    details: [
      "Assignments store the final rate, start date, and end date for a candidate.",
      "Approve the assignment to trigger Onboarding.",
    ],
  },
  {
    step: 8,
    title: "Onboarding",
    icon: Briefcase,
    path: "/onboarding",
    summary: "Complete pre-deployment checks.",
    details: [
      "Onboarding has a checklist: contract signed, ID verified, background check, equipment allocated, accounts created, and induction done.",
      "When every item is checked, a Deployment record is created automatically.",
    ],
  },
  {
    step: 9,
    title: "Deployment",
    icon: Rocket,
    path: "/deployments",
    summary: "Track live resource placements.",
    details: [
      "Deployments start as scheduled and are moved to active when the resource begins work.",
      "Marking a deployment as active automatically updates the linked requirement to filled.",
    ],
  },
];

function FaqPage() {
  return (
    <AppShell title="How TalentFlow works">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          TalentFlow is an end-to-end recruitment pipeline. Every record is saved locally in your
          browser's IndexedDB database, so your data persists between sessions.
        </p>

        <div className="grid gap-4">
          {flow.map((item) => (
            <Card key={item.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">
                    <span className="text-muted-foreground mr-2">{item.step}.</span>
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.summary}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Frequently asked questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Where is my data stored?</h3>
              <p className="text-sm text-muted-foreground">
                All data is stored in your browser's IndexedDB. It will persist as long as you use
                the same browser and do not clear site data.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Can I edit a candidate after saving?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. Open the Resources page and click the Edit action on any candidate card.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">How is the match score calculated?</h3>
              <p className="text-sm text-muted-foreground">
                70% of the score comes from skill overlap with the requirement, and 30% comes from
                how the candidate's experience compares to the required years.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">What happens when onboarding is complete?</h3>
              <p className="text-sm text-muted-foreground">
                Completing every onboarding checklist item automatically creates a scheduled
                Deployment record. You can then mark it active in the Deployments page.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">How does a requirement get marked as filled?</h3>
              <p className="text-sm text-muted-foreground">
                When a deployment is marked as active, the linked requirement status is updated to
                filled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
