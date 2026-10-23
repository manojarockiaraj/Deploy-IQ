# Resource Navigator

here is the tech stack for resource management portal and database should be indexingDB  I would redesign the workflow like this:

End-to-End Candidate Pipeline

Stage 1: Resume Upload & Resource Creation

Instead of manually creating candidates, recruiters upload resumes.

Process

Upload Resume (PDF/DOC)

AI Resume Parser extracts:

Name

Email

Phone

Skills

Experience

Certifications

Current Location

Current Employer

Availability

Notice Period

Expected Rate/Salary

LinkedIn Profile

System automatically creates a Resource Profile.

Status

New Resource

Profile Incomplete

Active Resource

Archived

Stage 2: Job Requirement Creation

Created from client requirements.

Information

Client

Project

Position

Skills Required

Experience Required

Number of Resources

Budget

Start Date

Status

Open

In Progress

Filled

Closed

Cancelled

Stage 3: Resource Matching / Screening

This should be one of the most important screens.

Workflow

Recruiter selects:

Client Requirement

Job Position

System automatically shows:

CandidateMatch ScoreExperienceAvailabilitySkills MatchStatus

Example:

| John Smith | 94% | 8 Years | Immediate | 12/14 Skills | New |
| Sarah Jones | 89% | 7 Years | 2 Weeks | 11/14 Skills | New |

Filters

Match Score

Technology

Experience

Availability

Notice Period

Actions

Shortlist

Reject

Send to Technical Screening

Status

New Match

Shortlisted

Rejected

Sent for Technical Review

Stage 4: Internal Technical Screening

Technical Team evaluates candidate.

Evaluation Areas

Technical Knowledge

Coding Ability

Communication

Problem Solving

Domain Experience

Outcomes

Selected

Rejected

Hold

Status Tracking

Pending Review

Scheduled

Interview Completed

Selected

Rejected

Hold

Stage 5: Client Interview

Dedicated module.

This is one of the most important sections.

Information

Interview Date

Interviewer

Feedback

Rating

Notes

Outcomes

Selected

Move to Assignment

Rejected

Pipeline Closed

Hold

Wait for Client Decision

Statuses

Awaiting Scheduling

Scheduled

Completed

Selected

Rejected

Hold

Stage 6: Assignment Approval

After client selection.

Information

Client

Project

Position

Start Date

End Date

Rate

Status

Pending Approval

Approved

Rejected

Hold

Stage 7: Onboarding

HR driven process.

Checklist

Offer Letter

Contract Signed

Identity Verification

Right To Work Check

Equipment Allocation

Training

Status

Not Started

In Progress

Awaiting Documents

Hold

Completed

Stage 8: Resource Deployment

Resource starts work.

Status

Scheduled

Active

Completed

Extended

Released

Dashboard Design

This is where Project Managers and Management spend most of their time.

Top KPI Cards

Open Requirements

Active Projects

Available Resources

New Candidates

Candidates Under Review

Client Interviews Scheduled

Resources Onboarding

Active Deployments

Recruitment Funnel

Resume Uploaded
       ↓
Screening
       ↓
Technical Review
       ↓
Client Interview
       ↓
Selected
       ↓
Onboarding
       ↓
Deployed


Display counts at every stage.

Example:

Uploaded: 500

Screening: 220

Technical Review: 80

Client Interview: 45

Selected: 25

Onboarding: 18

Deployed: 15

Candidate Status Summary

Show cards:

Selected

Rejected

Hold

Awaiting Review

Awaiting Client Feedback

Onboarding

Deployed

Requirement Status Summary

Show:

Open Requirements

In Progress

Filled

Closed

Client Interview Summary

Show:

Scheduled

Completed

Selected

Rejected

Hold

Technical Review Summary

Show:

Pending

Selected

Rejected

Hold

Onboarding Summary

Show:

Not Started

In Progress

Awaiting Documents

Completed

Smart AI Features

Resume Parser

Upload CV → Auto Create Resource

Match Score Engine

Generate:

Skill Match %

Experience Match %

Availability Match %

Overall Match %

AI Recommendations

Suggest:

Best candidates for requirement

Similar resources

Alternate resources if candidate rejected

AI Screening Assistant

Automatically identify:

Missing skills

Notice period conflicts

Salary mismatches

Experience gaps

This workflow gives recruiters, technical teams, HR, client managers, and project managers complete visibility from resume upload → screening → technical review → client interview → onboarding → deployment, with explicit Selected / Rejected / Hold statuses at every decision point. This is much closer to how real IT staffing and resource augmentation companies operate." design should be like the attached image

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eb6a5dbd-9abc-4be1-8342-35d5bc8563d1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
