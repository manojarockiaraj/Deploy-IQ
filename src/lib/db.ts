import Dexie, { type Table } from "dexie";

// ==================== TYPES ====================

export type ResourceStatus = "new" | "profile_incomplete" | "active" | "archived";

export interface Resource {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experienceYears: number;
  certifications?: string[];
  currentLocation?: string;
  currentEmployer?: string;
  availability?: string;
  noticePeriod?: string;
  expectedRate?: string;
  linkedin?: string;
  resumeText?: string;
  status: ResourceStatus;
  createdAt: number;
  updatedAt: number;
}

export type RequirementStatus = "open" | "in_progress" | "filled" | "closed" | "cancelled";

export interface Requirement {
  id?: number;
  client: string;
  project: string;
  position: string;
  skillsRequired: string[];
  experienceRequired: number;
  numberOfResources: number;
  budget?: string;
  startDate?: string;
  status: RequirementStatus;
  createdAt: number;
  updatedAt: number;
}

export type MatchStatus = "new" | "shortlisted" | "rejected" | "sent_for_technical";

export interface Match {
  id?: number;
  resourceId: number;
  requirementId: number;
  matchScore: number;
  skillsMatched: number;
  skillsTotal: number;
  status: MatchStatus;
  createdAt: number;
}

export type TechnicalStatus =
  | "pending_review"
  | "scheduled"
  | "interview_completed"
  | "selected"
  | "rejected"
  | "hold";

export interface TechnicalReview {
  id?: number;
  resourceId: number;
  requirementId: number;
  interviewer?: string;
  technicalScore?: number;
  codingScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  domainScore?: number;
  notes?: string;
  status: TechnicalStatus;
  createdAt: number;
}

export type ClientInterviewStatus =
  | "awaiting_scheduling"
  | "scheduled"
  | "completed"
  | "selected"
  | "rejected"
  | "hold";

export interface ClientInterview {
  id?: number;
  resourceId: number;
  requirementId: number;
  interviewDate?: string;
  interviewer?: string;
  rating?: number;
  feedback?: string;
  notes?: string;
  status: ClientInterviewStatus;
  createdAt: number;
}

export type AssignmentStatus = "pending_approval" | "approved" | "rejected" | "hold";

export interface Assignment {
  id?: number;
  resourceId: number;
  requirementId: number;
  startDate?: string;
  endDate?: string;
  rate?: string;
  status: AssignmentStatus;
  createdAt: number;
}

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_documents"
  | "hold"
  | "completed";

export interface Onboarding {
  id?: number;
  resourceId: number;
  assignmentId: number;
  offerLetter: boolean;
  contractSigned: boolean;
  identityVerified: boolean;
  rightToWork: boolean;
  equipmentAllocated: boolean;
  trainingComplete: boolean;
  status: OnboardingStatus;
  createdAt: number;
}

export type DeploymentStatus = "scheduled" | "active" | "completed" | "extended" | "released";

export interface Deployment {
  id?: number;
  resourceId: number;
  assignmentId: number;
  startDate?: string;
  endDate?: string;
  status: DeploymentStatus;
  createdAt: number;
}

export interface Holiday {
  id?: number;
  date: string; // YYYY-MM-DD
  name: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
}

export interface LeaveEntry {
  id?: number;
  resourceId: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

// ==================== DB ====================

export class RmpDatabase extends Dexie {
  resources!: Table<Resource, number>;
  requirements!: Table<Requirement, number>;
  matches!: Table<Match, number>;
  technicalReviews!: Table<TechnicalReview, number>;
  clientInterviews!: Table<ClientInterview, number>;
  assignments!: Table<Assignment, number>;
  onboardings!: Table<Onboarding, number>;
  deployments!: Table<Deployment, number>;
  holidays!: Table<Holiday, number>;
  settings!: Table<AppSetting, string>;
  leaves!: Table<LeaveEntry, number>;

  constructor() {
    super("resource_management_portal");
    this.version(1).stores({
      resources: "++id, name, email, status, createdAt",
      requirements: "++id, client, project, status, createdAt",
      matches: "++id, resourceId, requirementId, status, matchScore",
      technicalReviews: "++id, resourceId, requirementId, status",
      clientInterviews: "++id, resourceId, requirementId, status",
      assignments: "++id, resourceId, requirementId, status",
      onboardings: "++id, resourceId, assignmentId, status",
      deployments: "++id, resourceId, assignmentId, status",
    });
    this.version(2).stores({
      holidays: "++id, &date",
      settings: "&key",
      leaves: "++id, resourceId, date, [resourceId+date]",
    });
  }
}

export const db = new RmpDatabase();

/** Default week off: Saturday (6) and Sunday (0). */
export const DEFAULT_WEEK_OFFS = [0, 6];
