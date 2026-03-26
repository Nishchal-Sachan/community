"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isJobOwner } from "@/lib/job-owner";

interface JobDetail {
  id: string;
  /** Present when API includes creator id (required for owner UI). */
  createdBy?: string;
  type: string;
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  jobRole?: string;
  jobType?: string;
  experience?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryNote?: string;
  /** Formatted line from GET /api/jobs/:id */
  salary?: string;
  company?: string;
  remote?: boolean;
  skills?: string[];
  /** Legacy API / DB */
  experienceLevel?: string;
  salaryText?: string;
  remoteOk?: boolean;
  skillsRequired?: string[];
  candidateSkills?: string[];
  /** Legacy / alternate shapes */
  skill?: string;
  tags?: string[] | string;
  preferredJobType?: string;
  education?: string;
  /** Optional nested payload from some APIs */
  candidate?: {
    skills?: string[];
    experience?: string;
  };
}

function formatExperience(level: string | undefined): string {
  if (!level?.trim()) return "";
  const n = level.replace(/\u2013/g, "-").replace(/\u2014/g, "-").trim();
  switch (n) {
    case "fresher":
      return "Fresher";
    case "1-3":
      return "1–3 years";
    case "3plus":
      return "3+ years";
    default:
      return "";
  }
}

function formatSalary(job: JobDetail): string | null {
  const text = (job.salaryNote ?? job.salaryText)?.trim();
  if (text) return text;
  const min = job.salaryMin?.trim();
  const max = job.salaryMax?.trim();
  if (min || max) return `${min || "—"} – ${max || "—"}`;
  return null;
}

function splitSkillString(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Prefer API `skills`, then role-specific arrays, then `skill` string or `tags`. */
function normalizeSkillsList(job: JobDetail): string[] {
  if (Array.isArray(job.skills) && job.skills.length > 0) {
    return job.skills.filter((s) => typeof s === "string" && s.trim());
  }
  if (job.type === "profile") {
    if (Array.isArray(job.candidateSkills) && job.candidateSkills.length > 0) {
      return job.candidateSkills;
    }
  } else if (Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0) {
    return job.skillsRequired;
  }
  if (typeof job.skill === "string" && job.skill.trim()) {
    return splitSkillString(job.skill);
  }
  if (typeof job.tags === "string" && job.tags.trim()) {
    return splitSkillString(job.tags);
  }
  if (Array.isArray(job.tags) && job.tags.length > 0) {
    return job.tags.filter((t): t is string => typeof t === "string" && Boolean(t.trim()));
  }
  return [];
}

/** Prefer API `experience`, then legacy `experienceLevel`. */
function getExperienceRaw(job: JobDetail): string {
  const a = job.experience?.trim();
  if (a) return a;
  return job.experienceLevel?.trim() ?? "";
}

/** Profile-only: skills for seeker (nested `candidate`, summary `skills`, `candidateSkills`, legacy). */
function normalizeCandidateSkills(job: JobDetail): string[] {
  const nested = job.candidate?.skills;
  if (Array.isArray(nested) && nested.length > 0) {
    return nested.filter((s): s is string => typeof s === "string" && Boolean(s.trim()));
  }
  if (Array.isArray(job.skills) && job.skills.length > 0) {
    return job.skills.filter((s) => typeof s === "string" && s.trim());
  }
  if (Array.isArray(job.candidateSkills) && job.candidateSkills.length > 0) {
    return job.candidateSkills;
  }
  if (typeof job.skill === "string" && job.skill.trim()) {
    return splitSkillString(job.skill);
  }
  if (typeof job.tags === "string" && job.tags.trim()) {
    return splitSkillString(job.tags);
  }
  if (Array.isArray(job.tags) && job.tags.length > 0) {
    return job.tags.filter((t): t is string => typeof t === "string" && Boolean(t.trim()));
  }
  return [];
}

function getCandidateExperienceRaw(job: JobDetail): string {
  const nested = job.candidate?.experience?.trim();
  if (nested) return nested;
  return getExperienceRaw(job);
}

function buildCandidateView(job: JobDetail) {
  const skills = normalizeCandidateSkills(job);
  const experience = getCandidateExperienceRaw(job);
  const experienceDisplay = formatExperience(experience) || experience || "";
  const preferredJobType =
    job.preferredJobType?.trim() || job.jobType?.trim() || "";
  return {
    skills,
    experience,
    experienceDisplay,
    preferredJobType,
  };
}

/** Prefer API `salary` summary, then min/max/text. */
function getSalaryDisplay(job: JobDetail): string | null {
  const summary = job.salary?.trim();
  if (summary) return summary;
  return formatSalary(job);
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1.5 font-body text-gray-900">{children}</div>
    </div>
  );
}

export function JobDetailContent({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        job?: JobDetail;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not load this listing.");
        setJob(null);
        return;
      }
      setJob(data.job ?? null);
    } catch {
      setError("Could not load this listing.");
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  async function handleDeleteListing() {
    if (!job) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this post permanently?")) {
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/jobs/delete/${job.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) router.push("/jobs");
    } finally {
      setDeleteLoading(false);
    }
  }

  const candidate = useMemo(() => {
    if (!job || job.type !== "profile") return null;
    return buildCandidateView(job);
  }, [job]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center font-body text-gray-500 shadow-sm">
        Loading…
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
        <p className="font-body text-red-800">{error ?? "Listing not found."}</p>
        <Link
          href="/jobs"
          className="mt-4 inline-block font-body text-sm font-medium text-[#F57C00] hover:underline"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  const isOwner = isJobOwner(user, job);
  const isJob = job.type === "job";

  const skillsList = isJob ? normalizeSkillsList(job) : [];
  const experienceLine = isJob
    ? formatExperience(getExperienceRaw(job)) || getExperienceRaw(job) || ""
    : "";
  const salaryLine = isJob ? getSalaryDisplay(job) : null;

  if (!isJob) {
    if (!candidate) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center font-body text-gray-500 shadow-sm">
          Could not load profile details.
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="w-fit font-body text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          ← Back to listings
        </button>
        <article className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
          <div className="border-b border-teal-100 bg-teal-50/50 px-6 py-6 sm:px-8">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-800">
              Candidate profile
            </span>
            <h1 className="mt-2 font-heading text-2xl font-bold text-gray-900">{job.contactName}</h1>
            <p className="mt-1 text-lg font-medium text-teal-900">{job.title}</p>
            {job.location?.trim() ? (
              <p className="mt-3 text-sm text-gray-600">{job.location.trim()}</p>
            ) : null}
          </div>
          <div className="px-6 py-6 sm:px-8">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-gray-500">
              Profile details
            </h2>
            <div className="mt-2">
              <DetailRow label="Bio">
                <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </DetailRow>
              {candidate.skills.length > 0 ? (
                <DetailRow label="Skills">
                  <ul className="flex flex-wrap gap-2">
                    {candidate.skills.map((s) => (
                      <li
                        key={s}
                        className="rounded-lg border border-teal-100 bg-teal-50/60 px-2.5 py-1 text-sm font-medium text-teal-900"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </DetailRow>
              ) : null}
              {candidate.experienceDisplay.trim() ? (
                <DetailRow label="Experience">{candidate.experienceDisplay}</DetailRow>
              ) : null}
              {candidate.preferredJobType ? (
                <DetailRow label="Preferred job type">{candidate.preferredJobType}</DetailRow>
              ) : null}
              <DetailRow label="Category">{job.category}</DetailRow>
              {job.education?.trim() ? (
                <DetailRow label="Education">{job.education.trim()}</DetailRow>
              ) : null}
            </div>
          </div>
          <section
            className="border-t border-teal-100 bg-teal-50/30 px-6 py-6 sm:px-8"
            aria-labelledby="profile-contact-heading"
          >
            <h2
              id="profile-contact-heading"
              className="font-heading text-sm font-semibold uppercase tracking-wide text-teal-900"
            >
              Contact
            </h2>
            <p className="mt-1 text-xs text-teal-800/80">Full contact is only shown on this page.</p>
            <ul className="mt-4 space-y-3 font-body text-sm">
              <li className="font-medium text-gray-900">{job.contactName}</li>
              <li>
                <a
                  href={`tel:${job.contactPhone.replace(/\s/g, "")}`}
                  className="text-teal-800 underline-offset-2 hover:underline"
                >
                  {job.contactPhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${job.contactEmail}`}
                  className="break-all text-teal-800 underline-offset-2 hover:underline"
                >
                  {job.contactEmail}
                </a>
              </li>
            </ul>
            {!isOwner ? (
              <>
                <p className="mt-5 rounded-lg border border-teal-200/80 bg-white/70 px-4 py-3 font-body text-sm text-teal-950">
                  Please verify profile details before proceeding.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    aria-disabled="true"
                    className="cursor-not-allowed rounded-lg border border-teal-200/80 bg-transparent px-4 py-2 font-body text-xs font-medium text-teal-800/50 opacity-70"
                  >
                    Report profile
                  </button>
                </div>
              </>
            ) : null}
            {isOwner ? (
              <div className="mt-3 flex gap-2 border-t border-teal-100 pt-4">
                <button
                  type="button"
                  onClick={() => router.push(`/jobs?edit=${job.id}`)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-body text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeleteListing}
                  disabled={deleteLoading}
                  className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-60"
                >
                  {deleteLoading ? "Deleting…" : "Delete"}
                </button>
              </div>
            ) : null}
          </section>
        </article>
      </div>
    );
  }

  const locationDisplay = job.location?.trim();
  const hasSalaryDisplay = Boolean(salaryLine?.trim());
  const hasJobTypeDisplay = Boolean(job.jobType?.trim() || job.preferredJobType?.trim());
  const phoneTel = job.contactPhone.replace(/\s/g, "");

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => router.push("/jobs")}
        className="w-fit font-body text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        ← Back to listings
      </button>

      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header: title, company, location */}
        <header className="border-b border-gray-100 bg-gradient-to-br from-orange-50/80 to-white px-6 py-8 sm:px-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#F57C00] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Job opening
            </span>
            {job.remote ?? job.remoteOk ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                Remote OK
              </span>
            ) : null}
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {job.title}
          </h1>
          {job.company && (
            <p className="text-sm text-gray-500">{job.company}</p>
          )}
          {locationDisplay ? (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-base text-gray-600">
              <span>{locationDisplay}</span>
            </p>
          ) : null}
          {job.jobRole?.trim() ? (
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-600">Role:</span> {job.jobRole.trim()}
            </p>
          ) : null}
        </header>

        {/* Details: description, skills, experience, salary, job type */}
        <section className="px-6 py-6 sm:px-10" aria-labelledby="job-details-heading">
          <h2 id="job-details-heading" className="font-heading text-lg font-semibold text-gray-900">
            Details
          </h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {job.description}
          </p>

          <div className="mt-8 border-t border-gray-100">
            {skillsList.length > 0 ? (
              <DetailRow label="Skills">
                <ul className="flex flex-wrap gap-2">
                  {skillsList.map((s) => (
                    <li
                      key={s}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </DetailRow>
            ) : null}
            {experienceLine.trim() ? (
              <DetailRow label="Experience required">{experienceLine}</DetailRow>
            ) : null}
            {hasSalaryDisplay ? (
              <DetailRow label="Salary">{salaryLine}</DetailRow>
            ) : null}
            {hasJobTypeDisplay ? (
              <DetailRow label="Job type">
                {job.jobType?.trim() || job.preferredJobType?.trim()}
              </DetailRow>
            ) : null}
            <DetailRow label="Category">{job.category}</DetailRow>
          </div>
        </section>

        <section
          className="border-t border-gray-200 bg-gray-50/80 px-6 py-8 sm:px-10"
          aria-labelledby="job-contact-employer-heading"
        >
          <h2
            id="job-contact-employer-heading"
            className="font-heading text-lg font-semibold text-gray-900"
          >
            Contact Employer
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Contact the employer directly for this opportunity. Phone and email are not shown on the main
            listing — only here.
          </p>

          <dl className="mt-6 space-y-4 font-body">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contact name
              </dt>
              <dd className="mt-1 text-base font-medium text-gray-900">{job.contactName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</dt>
              <dd className="mt-1 text-base text-gray-900">{job.contactPhone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</dt>
              <dd className="mt-1 break-all text-base text-gray-900">{job.contactEmail}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {phoneTel.length > 0 ? (
              <a
                href={`tel:${phoneTel}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#F57C00] px-6 py-3 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E65100] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2"
              >
                Call Now
              </a>
            ) : null}
            {job.contactEmail?.trim() ? (
              <a
                href={`mailto:${job.contactEmail.trim()}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 font-body text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2"
              >
                Send Email
              </a>
            ) : null}
          </div>

          {!isOwner ? (
            <>
              <p className="mt-6 rounded-lg border border-amber-100 bg-amber-50/70 px-4 py-3 font-body text-sm text-amber-950">
                Please verify job details before proceeding.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  aria-disabled="true"
                  className="cursor-not-allowed rounded-lg border border-gray-300 bg-transparent px-4 py-2 font-body text-xs font-medium text-gray-500 opacity-80"
                >
                  Report job
                </button>
              </div>
            </>
          ) : null}

          {isOwner ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => router.push(`/jobs?edit=${job.id}`)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-body text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-1"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={deleteLoading}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          ) : null}
        </section>
      </article>
    </div>
  );
}
