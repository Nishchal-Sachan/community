"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FormBackButton from "@/components/layout/FormBackButton";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { JobPostForm } from "../post/_components/JobPostForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isJobOwner, normalizeJobCreatorId } from "@/lib/job-owner";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Retail", label: "Retail" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Services", label: "Services" },
  { value: "Government", label: "Government" },
  { value: "Other", label: "Other" },
];

interface JobItem {
  id: string;
  createdBy: string;
  type: string;
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  /** Omitted in API for non-owners; kept for edit modal when you own the listing. */
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  jobRole?: string;
  jobType?: string;
  experience?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryNote?: string;
  company?: string;
  remote?: boolean;
  skills?: string[];
  preferredJobType?: string;
  education?: string;
}

const DESCRIPTION_MAX_LENGTH = 150;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

/** Map GET /api/jobs/:id JSON into a `JobItem` for the edit modal. */
function jobFromApiResponse(j: Record<string, unknown>): JobItem {
  return {
    id: String(j.id ?? ""),
    createdBy: normalizeJobCreatorId(j.createdBy),
    type: String(j.type ?? "job"),
    title: String(j.title ?? ""),
    description: String(j.description ?? ""),
    category: String(j.category ?? ""),
    location: String(j.location ?? ""),
    contactName: String(j.contactName ?? ""),
    contactPhone: typeof j.contactPhone === "string" ? j.contactPhone : undefined,
    contactEmail: typeof j.contactEmail === "string" ? j.contactEmail : undefined,
    createdAt: String(j.createdAt ?? ""),
    jobRole: typeof j.jobRole === "string" ? j.jobRole : undefined,
    jobType: typeof j.jobType === "string" ? j.jobType : undefined,
    experience: typeof j.experience === "string" ? j.experience : undefined,
    salaryMin: typeof j.salaryMin === "string" ? j.salaryMin : undefined,
    salaryMax: typeof j.salaryMax === "string" ? j.salaryMax : undefined,
    salaryNote: typeof j.salaryNote === "string" ? j.salaryNote : undefined,
    company: typeof j.company === "string" ? j.company : undefined,
    remote: typeof j.remote === "boolean" ? j.remote : undefined,
    skills: Array.isArray(j.skills)
      ? j.skills.filter((x): x is string => typeof x === "string")
      : undefined,
    preferredJobType:
      typeof j.preferredJobType === "string" ? j.preferredJobType : undefined,
    education: typeof j.education === "string" ? j.education : undefined,
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

function formatSalary(job: JobItem): string | null {
  const text = job.salaryNote?.trim();
  if (text) return text;
  const min = job.salaryMin?.trim();
  const max = job.salaryMax?.trim();
  if (min || max) {
    return `${min || "—"} – ${max || "—"}`;
  }
  return null;
}

/** Subtle category label — small, light background */
function CardCategoryLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block max-w-full truncate rounded-md bg-gray-100/95 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}

/** Job type / schedule badge — compact pill */
function CardJobTypeBadge({
  children,
  variant = "job",
}: {
  children: ReactNode;
  variant?: "job" | "profile";
}) {
  if (variant === "profile") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-teal-50 px-2.5 py-0.5 font-body text-[11px] font-semibold text-teal-900 ring-1 ring-teal-100">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 rounded-full bg-orange-50 px-2.5 py-0.5 font-body text-[11px] font-semibold text-orange-900 ring-1 ring-orange-100/90">
      {children}
    </span>
  );
}

/** Skill / stack tags — light pill, small type */
function CardSkillTag({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "job" | "profile";
}) {
  const jobCls =
    "rounded-full bg-stone-50 px-2.5 py-1 font-body text-[11px] font-medium text-stone-800 ring-1 ring-stone-200/80";
  const profileCls =
    "rounded-full bg-teal-50/90 px-2.5 py-1 font-body text-[11px] font-medium text-teal-900 ring-1 ring-teal-100/90";
  return <span className={variant === "job" ? jobCls : profileCls}>{children}</span>;
}

export function JobsListing() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"job" | "profile">("job");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const params = new URLSearchParams();
      params.set("type", activeTab);
      if (category) params.set("category", category);
      if (searchDebounced.trim()) params.set("search", searchDebounced.trim());

      const res = await fetch(`/api/jobs/list?${params.toString()}`);
      const data = (await res.json().catch(() => ({}))) as { jobs?: unknown };
      if (!res.ok) {
        setJobs([]);
        setListError("Could not load listings. Please try again.");
        return;
      }
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch {
      setJobs([]);
      setListError("Could not load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, category, searchDebounced]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const editFromQuery = searchParams.get("edit");
  useEffect(() => {
    if (!editFromQuery || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/jobs/${editFromQuery}`, {
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json().catch(() => ({}))) as {
          job?: Record<string, unknown>;
        };
        const raw = data.job;
        if (!raw || cancelled) return;
        if (!isJobOwner(user, raw)) return;
        const item = jobFromApiResponse(raw);
        setActiveTab(item.type === "profile" ? "profile" : "job");
        setEditingJob(item);
        router.replace("/jobs", { scroll: false });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editFromQuery, user, router]);

  async function handleDelete(jobId: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/jobs/delete/${jobId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDeletingJobId(null);
        fetchJobs();
      }
    } catch {
      setDeletingJobId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEditSuccess() {
    setEditingJob(null);
    fetchJobs();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("job")}
          className={`rounded-md px-5 py-2.5 font-body text-sm font-medium transition-colors ${
            activeTab === "job"
              ? "bg-[#F57C00] text-white"
              : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          Jobs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`rounded-md px-5 py-2.5 font-body text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-[#F57C00] text-white"
              : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          Candidate profiles
        </button>
      </div>

      {/* Search + Category */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor="jobs-search" className="sr-only">
            Search jobs
          </label>
          <input
            id="jobs-search"
            type="search"
            placeholder={activeTab === "job" ? "Search jobs…" : "Search candidate profiles…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 font-body text-gray-900 placeholder-gray-500 focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor="jobs-category" className="sr-only">
            Category filter
          </label>
          <select
            id="jobs-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 font-body text-gray-900 focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-14 text-center font-body text-gray-500 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)]">
          Loading…
        </div>
      ) : listError ? (
        <div
          className="rounded-xl border border-amber-100 bg-amber-50/50 px-6 py-14 text-center shadow-[0_2px_12px_-4px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)]"
          role="alert"
        >
          <p className="font-body text-sm font-medium text-amber-950">{listError}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-14 text-center shadow-[0_2px_12px_-4px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)]">
          {activeTab === "job" ? (
            <>
              <p className="font-heading text-lg font-semibold text-gray-900">No jobs available</p>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-gray-500">
                Try a different category or{" "}
                <Link
                  href="/jobs/post"
                  className="font-medium text-[#F57C00] underline-offset-2 hover:underline"
                >
                  post a job
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-lg font-semibold text-gray-900">
                No candidate profiles available
              </p>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-gray-500">
                Try a different category or{" "}
                <Link
                  href="/jobs/post"
                  className="font-medium text-[#F57C00] underline-offset-2 hover:underline"
                >
                  post a profile
                </Link>
                .
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-7 sm:grid-cols-2">
          {jobs.map((job) => {
            const isOwner = isJobOwner(user, job);

            return (
            <article
              key={job.id}
              className={`flex flex-col rounded-xl border bg-white p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(15,23,42,0.11),0_4px_12px_-4px_rgba(15,23,42,0.06)] sm:p-7 ${
                activeTab === "profile"
                  ? "border-teal-100/80 border-l-[3px] border-l-teal-600"
                  : "border-gray-100/90"
              }`}
            >
              {activeTab === "profile" ? (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-teal-900">
                      Candidate
                    </span>
                    <CardCategoryLabel>{job.category}</CardCategoryLabel>
                    {job.preferredJobType?.trim() ? (
                      <CardJobTypeBadge variant="profile">{job.preferredJobType.trim()}</CardJobTypeBadge>
                    ) : null}
                  </div>
                  <h3 className="mb-1.5 font-heading text-lg font-bold tracking-tight text-gray-900">
                    {job.contactName}
                  </h3>
                  <p className="mb-3 font-body text-[15px] font-medium text-gray-600">{job.title}</p>
                  <p className="mb-4 font-body text-sm text-gray-500">
                    {formatExperience(job.experience) ? (
                      <span>{formatExperience(job.experience)}</span>
                    ) : null}
                    {formatExperience(job.experience) && job.location?.trim() ? (
                      <span className="text-gray-300"> · </span>
                    ) : null}
                    {job.location?.trim() ? <span>{job.location.trim()}</span> : null}
                  </p>
                  {job.education?.trim() ? (
                    <p className="mb-4 font-body text-sm text-gray-500">
                      <span className="font-medium text-gray-600">Education:</span>{" "}
                      {job.education.trim()}
                    </p>
                  ) : null}
                  {Array.isArray(job.skills) && job.skills.length > 0 ? (
                    <div className="mb-5">
                      <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((s) => (
                          <CardSkillTag key={s} variant="profile">
                            {s}
                          </CardSkillTag>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="mb-6 flex-1 font-body text-[15px] leading-relaxed text-gray-600">
                    {truncate(job.description, DESCRIPTION_MAX_LENGTH)}
                  </p>
                  <div className="mt-auto border-t border-teal-100/90 pt-5">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-teal-200 bg-white px-4 py-2 font-body text-sm font-medium text-teal-800 shadow-sm transition-colors hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    >
                      View Details
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <CardCategoryLabel>{job.category}</CardCategoryLabel>
                    {job.jobType?.trim() ? (
                      <CardJobTypeBadge>{job.jobType.trim()}</CardJobTypeBadge>
                    ) : null}
                    {job.remote ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-body text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
                        Remote OK
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-bold leading-snug tracking-tight text-gray-900">
                    {job.title}
                  </h3>
                  {(job.company?.trim() || job.jobRole?.trim()) && (
                    <p className="mb-3 font-body text-sm text-gray-500">
                      {[job.company?.trim(), job.jobRole?.trim()].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {job.location?.trim() ? (
                    <p className="mb-3 font-body text-sm text-gray-500">{job.location.trim()}</p>
                  ) : null}
                  {(formatExperience(job.experience) || formatSalary(job)) ? (
                    <p className="mb-4 font-body text-sm text-gray-500">
                      {[formatExperience(job.experience), formatSalary(job)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {Array.isArray(job.skills) && job.skills.length > 0 ? (
                    <div className="mb-5">
                      <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((s) => (
                          <CardSkillTag key={s} variant="job">
                            {s}
                          </CardSkillTag>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="mb-6 flex-1 font-body text-[15px] leading-relaxed text-gray-600">
                    {truncate(job.description, DESCRIPTION_MAX_LENGTH)}
                  </p>
                  <div className="mt-auto border-t border-gray-100/90 pt-5">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 font-body text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2"
                    >
                      Contact Employer
                    </Link>
                  </div>
                </>
              )}
              {isOwner && (
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingJob(job)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 font-body text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-1"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingJobId(job.id)}
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingJob(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FormBackButton />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-gray-900">
                {editingJob.type === "profile" ? "Edit candidate profile" : "Edit job posting"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <JobPostForm
              key={editingJob.id}
              jobId={editingJob.id}
              initialData={{
                type: editingJob.type as "job" | "profile",
                title: editingJob.title,
                description: editingJob.description,
                category: editingJob.category,
                location: editingJob.location,
                contactName: editingJob.contactName,
                contactPhone: editingJob.contactPhone ?? "",
                contactEmail: editingJob.contactEmail ?? "",
                jobRole: editingJob.jobRole,
                jobType: editingJob.jobType,
                experience: editingJob.experience,
                salaryMin: editingJob.salaryMin,
                salaryMax: editingJob.salaryMax,
                salaryNote: editingJob.salaryNote,
                company: editingJob.company,
                remote: editingJob.remote,
                skills: editingJob.skills,
                preferredJobType: editingJob.preferredJobType,
                education: editingJob.education,
              }}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deletingJobId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeletingJobId(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 font-body text-gray-700">
              Delete this post permanently?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingJobId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 font-body text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingJobId)}
                disabled={deleteLoading}
                className="rounded-md bg-red-600 px-4 py-2 font-body text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
