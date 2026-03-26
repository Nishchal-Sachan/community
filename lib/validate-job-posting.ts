import { ApiError } from "@/lib/api-error";
import { JOB_MAX_LENGTHS } from "@/lib/job-field-limits";

export const JOB_POSTING_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Freelance",
] as const;

export const EXPERIENCE_LEVELS = ["fresher", "1-3", "3plus"] as const;

export type JobPostingTypeValue = (typeof JOB_POSTING_TYPES)[number];
export type ExperienceLevelValue = (typeof EXPERIENCE_LEVELS)[number];

export interface JobPostingFields {
  jobRole: string;
  jobType: JobPostingTypeValue;
  experience: ExperienceLevelValue;
  salaryMin: string;
  salaryMax: string;
  salaryNote: string;
  company: string;
  remote: boolean;
  skills: string[];
}

function sanitizeString(val: unknown, maxLen: number): string {
  return String(val ?? "")
    .trim()
    .slice(0, maxLen);
}

function splitSkillsFromDelimitedString(t: string): string[] {
  return t
    .split(/[,;]/)
    .map((x) => x.trim().slice(0, JOB_MAX_LENGTHS.skillTag))
    .filter(Boolean)
    .filter((x, i, a) => a.indexOf(x) === i)
    .slice(0, JOB_MAX_LENGTHS.skillsMaxCount);
}

/** Accepts string[], comma/semicolon string, or a JSON array string. */
export function sanitizeSkills(val: unknown): string[] {
  if (typeof val === "string") {
    const t = val.trim();
    if (!t) return [];
    if (t.startsWith("[") && t.endsWith("]")) {
      try {
        const p = JSON.parse(t) as unknown;
        if (Array.isArray(p)) return sanitizeSkills(p);
      } catch {
        /* fall through to delimited string */
      }
    }
    return splitSkillsFromDelimitedString(t);
  }
  if (!Array.isArray(val)) return [];
  const out: string[] = [];
  for (const item of val) {
    if (typeof item !== "string") continue;
    const tag = item.trim().slice(0, JOB_MAX_LENGTHS.skillTag);
    if (tag && !out.includes(tag)) out.push(tag);
    if (out.length >= JOB_MAX_LENGTHS.skillsMaxCount) break;
  }
  return out;
}

/** Map UI / DB variants (unicode dashes, spacing) to stored enum values. */
export function canonicalizeExperienceLevel(
  raw: unknown
): ExperienceLevelValue | null {
  let s = String(raw ?? "").trim();
  if (!s) return null;
  s = s.replace(/\u2013/g, "-").replace(/\u2014/g, "-");
  if ((EXPERIENCE_LEVELS as readonly string[]).includes(s)) {
    return s as ExperienceLevelValue;
  }
  const key = s.replace(/\s/g, "").toLowerCase();
  if (key === "fresher" || key.startsWith("fresher")) return "fresher";
  if (key === "1-3" || key.startsWith("1-3")) return "1-3";
  if (key === "3plus" || key === "3+" || key.startsWith("3+")) return "3plus";
  return null;
}

/** Match canonical Full-time / Part-time / … (case-insensitive). */
export function canonicalizeJobPostingType(
  raw: unknown
): JobPostingTypeValue | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if ((JOB_POSTING_TYPES as readonly string[]).includes(s)) {
    return s as JobPostingTypeValue;
  }
  const fold = s.toLowerCase();
  const found = (JOB_POSTING_TYPES as readonly string[]).find(
    (t) => t.toLowerCase() === fold
  );
  return (found as JobPostingTypeValue) ?? null;
}

export function parseRemote(val: unknown): boolean {
  if (val === true || val === "true" || val === "on" || val === 1 || val === "1") {
    return true;
  }
  return false;
}

/** Validates and returns job-only fields for employer postings. */
export function validateJobPostingFields(b: Record<string, unknown>): JobPostingFields {
  const jobRole = sanitizeString(b.jobRole, JOB_MAX_LENGTHS.jobRole);
  const salaryMin = sanitizeString(b.salaryMin, JOB_MAX_LENGTHS.salaryMin);
  const salaryMax = sanitizeString(b.salaryMax, JOB_MAX_LENGTHS.salaryMax);
  const salaryNote = sanitizeString(
    b.salaryNote ?? b.salaryText,
    JOB_MAX_LENGTHS.salaryNote
  );
  const company = sanitizeString(
    b.company ?? b.companyName,
    JOB_MAX_LENGTHS.company
  );
  const remote = parseRemote(b.remote ?? b.remoteOk);
  const skills = sanitizeSkills(
    b.skills ?? b.skillsRequired ?? b.candidateSkills
  );

  const jobTypeCanon = canonicalizeJobPostingType(b.jobType);
  const experienceCanon = canonicalizeExperienceLevel(
    b.experience ?? b.experienceLevel
  );

  if (!jobRole) throw new ApiError(400, "Job role / position is required");
  if (!jobTypeCanon) throw new ApiError(400, "Job type is required");
  if (!experienceCanon) throw new ApiError(400, "Experience required is invalid");
  if (!company) throw new ApiError(400, "Company name is required");

  return {
    jobRole,
    jobType: jobTypeCanon,
    experience: experienceCanon,
    salaryMin,
    salaryMax,
    salaryNote,
    company,
    remote,
    skills,
  };
}
