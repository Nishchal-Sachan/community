/**
 * Shared string limits for job / profile payloads.
 * Kept separate from `lib/models/Job` so client components can import limits
 * without pulling Mongoose (which breaks in the browser — `mongoose.models` is undefined).
 */
export const JOB_MAX_LENGTHS = {
  title: 200,
  description: 5000,
  category: 100,
  location: 200,
  contactName: 120,
  contactPhone: 20,
  contactEmail: 320,
  jobRole: 120,
  jobType: 40,
  experience: 20,
  salaryMin: 80,
  salaryMax: 80,
  salaryNote: 200,
  company: 200,
  skillTag: 40,
  skillsMaxCount: 20,
  education: 500,
  /** Candidate profile short / long bio (separate from listing `description` when both sent) */
  bio: 5000,
} as const;
