import { db, type Resource, type Requirement } from "./db";

// Simple "AI" resume parser — extracts fields from pasted resume text.
export function parseResumeText(text: string): Partial<Resource> {
  const t = text.replace(/\r/g, "");
  const email = t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const phone = t.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0];
  const linkedin = t.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s)]+/i)?.[0];

  const firstLine = t.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
  const name =
    firstLine.length > 0 && firstLine.length < 60 && !firstLine.includes("@")
      ? firstLine
      : "Unknown Candidate";

  const expMatch = t.match(/(\d{1,2})\+?\s*(?:years|yrs)\b/i);
  const experienceYears = expMatch ? parseInt(expMatch[1], 10) : 0;

  const SKILL_DICT = [
    "javascript","typescript","react","node","node.js","next.js","angular","vue",
    "python","django","flask","fastapi","java","spring","kotlin","go","golang",
    "rust","c++","c#",".net","ruby","rails","php","laravel","sql","postgres",
    "mysql","mongodb","redis","kafka","aws","gcp","azure","docker","kubernetes",
    "terraform","graphql","rest","tailwind","html","css","figma","swift",
    "android","flutter","react native","devops","ci/cd","machine learning",
    "tensorflow","pytorch","data science","pandas","spark",
  ];
  const lower = t.toLowerCase();
  const skills = Array.from(
    new Set(SKILL_DICT.filter((s) => new RegExp(`\\b${s.replace(/\+/g, "\\+")}\\b`, "i").test(lower)))
  ).map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()));

  const location = t.match(/(?:Location|Based in|City)\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim();
  const employer = t.match(/(?:Current(?:ly)? at|Employer|Company)\s*[:\-]?\s*([^\n]+)/i)?.[1]?.trim();
  const notice = t.match(/(?:Notice(?:\s*Period)?)\s*[:\-]?\s*([^\n]+)/i)?.[1]?.trim();
  const rate = t.match(/(?:Expected(?:\s*Rate|\s*Salary)?)\s*[:\-]?\s*([^\n]+)/i)?.[1]?.trim();
  const availability = t.match(/(?:Availability)\s*[:\-]?\s*([^\n]+)/i)?.[1]?.trim();

  return {
    name,
    email: email ?? "",
    phone,
    linkedin,
    skills,
    experienceYears,
    currentLocation: location,
    currentEmployer: employer,
    noticePeriod: notice,
    expectedRate: rate,
    availability,
    resumeText: text,
  };
}

export function computeMatchScore(
  resource: Resource,
  requirement: Requirement
): { score: number; matched: number; total: number } {
  const req = requirement.skillsRequired.map((s) => s.toLowerCase());
  const have = resource.skills.map((s) => s.toLowerCase());
  const matched = req.filter((s) => have.includes(s)).length;
  const total = Math.max(req.length, 1);
  const skillPct = matched / total;
  const expPct = Math.min(resource.experienceYears / Math.max(requirement.experienceRequired, 1), 1);
  const score = Math.round((skillPct * 0.7 + expPct * 0.3) * 100);
  return { score, matched, total: req.length };
}

export async function seedIfEmpty() {
  const count = await db.resources.count();
  if (count > 0) return;
  const now = Date.now();
  const resIds = await db.resources.bulkAdd(
    [
      {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 98765 43210",
        skills: ["React", "Typescript", "Node.Js", "Aws", "Graphql"],
        experienceYears: 6,
        currentLocation: "Bengaluru, IN",
        currentEmployer: "Infosys",
        availability: "Immediate",
        noticePeriod: "15 days",
        expectedRate: "$55/hr",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Marcus Chen",
        email: "marcus.chen@example.com",
        phone: "+1 415 555 0134",
        skills: ["Python", "Django", "Postgres", "Aws", "Docker"],
        experienceYears: 8,
        currentLocation: "San Francisco, US",
        currentEmployer: "Stripe",
        availability: "2 weeks",
        noticePeriod: "2 weeks",
        expectedRate: "$95/hr",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Aisha Okafor",
        email: "aisha.okafor@example.com",
        phone: "+44 20 7946 0111",
        skills: ["Java", "Spring", "Kafka", "Kubernetes", "Sql"],
        experienceYears: 5,
        currentLocation: "London, UK",
        currentEmployer: "Barclays",
        availability: "1 month",
        noticePeriod: "30 days",
        expectedRate: "£65/hr",
        status: "new",
        createdAt: now,
        updatedAt: now,
      },
    ],
    { allKeys: true }
  );
  await db.requirements.bulkAdd([
    {
      client: "Acme Bank",
      project: "Retail Portal Modernisation",
      position: "Senior React Developer",
      skillsRequired: ["React", "Typescript", "Node.Js", "Graphql"],
      experienceRequired: 5,
      numberOfResources: 2,
      budget: "$60/hr",
      startDate: "2026-08-01",
      status: "open",
      createdAt: now,
      updatedAt: now,
    },
    {
      client: "Globex",
      project: "Data Platform",
      position: "Python Backend Engineer",
      skillsRequired: ["Python", "Django", "Postgres", "Aws"],
      experienceRequired: 6,
      numberOfResources: 1,
      budget: "$100/hr",
      startDate: "2026-08-15",
      status: "open",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  void resIds;
}
