import { normalizeJobCreatorId } from "@/lib/job-owner";
import {
  canonicalizeExperienceLevel,
  canonicalizeJobPostingType,
  sanitizeSkills,
} from "@/lib/validate-job-posting";

/** Mongoose document or lean object (supports legacy field names in DB). */
export function jobToPublicJson(job: unknown): Record<string, unknown> {
  const j = job as Record<string, unknown>;

  const jobTypeStored = String(j.jobType ?? "").trim();
  const preferredStored = String(j.preferredJobType ?? "").trim();

  const experienceRaw = j.experience ?? j.experienceLevel;
  const companyRaw = j.company ?? j.companyName;
  const salaryNoteRaw = j.salaryNote ?? j.salaryText;
  const remoteRaw =
    typeof j.remote === "boolean"
      ? j.remote
      : j.remoteOk === true || j.remoteOk === "true";

  let skillsRaw: unknown = j.skills;
  if (!Array.isArray(skillsRaw) || skillsRaw.length === 0) {
    if (j.type === "profile") skillsRaw = j.candidateSkills;
    else skillsRaw = j.skillsRequired;
  }

  return {
    id: (j._id as { toString(): string }).toString(),
    createdBy: normalizeJobCreatorId(j.createdBy),
    type: j.type,
    title: j.title,
    description: j.description,
    category: j.category,
    location: j.location,
    contactName: j.contactName,
    contactPhone: j.contactPhone,
    contactEmail: j.contactEmail,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    jobRole: j.jobRole ?? "",
    jobType: canonicalizeJobPostingType(jobTypeStored) ?? jobTypeStored,
    experience:
      canonicalizeExperienceLevel(experienceRaw) ??
      String(experienceRaw ?? "").trim(),
    salaryMin: j.salaryMin ?? "",
    salaryMax: j.salaryMax ?? "",
    salaryNote: typeof salaryNoteRaw === "string" ? salaryNoteRaw : "",
    company: typeof companyRaw === "string" ? companyRaw : "",
    remote: Boolean(remoteRaw),
    skills: sanitizeSkills(skillsRaw),
    preferredJobType:
      canonicalizeJobPostingType(preferredStored) ?? preferredStored,
    education: typeof j.education === "string" ? j.education : "",
    bio:
      typeof j.bio === "string" && j.bio.trim()
        ? j.bio
        : j.type === "profile"
          ? String(j.description ?? "").trim()
          : "",
  };
}
