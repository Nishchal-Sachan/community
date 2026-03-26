import { ApiError } from "@/lib/api-error";
import { JOB_MAX_LENGTHS } from "@/lib/job-field-limits";
import {
  canonicalizeExperienceLevel,
  canonicalizeJobPostingType,
  sanitizeSkills,
  type ExperienceLevelValue,
  type JobPostingTypeValue,
} from "@/lib/validate-job-posting";

function sanitizeString(val: unknown, maxLen: number): string {
  return String(val ?? "")
    .trim()
    .slice(0, maxLen);
}

export interface SeekerProfileFields {
  bio: string;
  experience: ExperienceLevelValue;
  preferredJobType: JobPostingTypeValue;
  education: string;
  skills: string[];
}

/** Validates candidate-profile-only fields (type === profile). */
export function validateSeekerProfileFields(
  b: Record<string, unknown>
): SeekerProfileFields {
  const bioSource =
    typeof b.bio === "string" && b.bio.trim() ? b.bio : b.description;
  const bio = sanitizeString(bioSource, JOB_MAX_LENGTHS.bio);
  const education = sanitizeString(b.education, JOB_MAX_LENGTHS.education);
  const skills = sanitizeSkills(b.skills ?? b.candidateSkills);

  const experienceCanon = canonicalizeExperienceLevel(
    b.experience ?? b.experienceLevel
  );
  const preferredCanon = canonicalizeJobPostingType(
    b.preferredJobType ?? b.jobType
  );

  if (!bio) throw new ApiError(400, "Bio is required");
  if (!experienceCanon) throw new ApiError(400, "Experience level is required");
  if (!preferredCanon) throw new ApiError(400, "Preferred job type is required");
  if (!education) throw new ApiError(400, "Education is required");

  return {
    bio,
    experience: experienceCanon,
    preferredJobType: preferredCanon,
    education,
    skills,
  };
}
