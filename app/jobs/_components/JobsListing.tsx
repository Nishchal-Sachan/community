"use client";

import { useCallback, useEffect, useState } from "react";
import { JobPostForm } from "../post/_components/JobPostForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "Technology", label: "प्रौद्योगिकी" },
  { value: "Healthcare", label: "स्वास्थ्य सेवा" },
  { value: "Education", label: "शिक्षा" },
  { value: "Agriculture", label: "कृषि" },
  { value: "Retail", label: "खुदरा" },
  { value: "Manufacturing", label: "विनिर्माण" },
  { value: "Services", label: "सेवाएं" },
  { value: "Government", label: "सरकार" },
  { value: "Other", label: "अन्य" },
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
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
}

const DESCRIPTION_MAX_LENGTH = 150;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

export function JobsListing() {
  const { user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"job" | "profile">("job");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", activeTab);
      if (category) params.set("category", category);
      if (searchDebounced.trim()) params.set("search", searchDebounced.trim());

      const res = await fetch(`/api/jobs/list?${params.toString()}`);
      const data = await res.json();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, category, searchDebounced]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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
          नौकरियां
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
          नौकरी चाहने वाले
        </button>
      </div>

      {/* Search + Category */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="search"
          placeholder="नौकरियां खोजें..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 font-body text-gray-900 placeholder-gray-500 focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2.5 font-body text-gray-900 focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00] sm:w-48"
        >
          <option value="">सभी श्रेणियां</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-[12px] border border-[#eeeeee] bg-white px-6 py-12 text-center font-body text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          लोड हो रहा है...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-[12px] border border-[#eeeeee] bg-white px-6 py-12 text-center font-body text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          कोई {activeTab === "job" ? "नौकरी" : "प्रोफाइल"} नहीं मिली।
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-[12px] border border-[#eeeeee] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-6"
            >
              <h3 className="mb-2 font-heading text-[18px] font-semibold text-gray-900">
                {job.title}
              </h3>
              <p className="mb-3 font-body text-[14px] text-gray-500">
                {CATEGORIES.find((c) => c.value === job.category)?.label ?? job.category}
                {job.location ? ` · ${job.location}` : ""}
              </p>
              <p className="mb-4 font-body text-[14px] leading-[1.7] text-[#555555]">
                {truncate(job.description, DESCRIPTION_MAX_LENGTH)}
              </p>
              <div className="space-y-1.5 border-t border-gray-100 pt-4 font-body text-[14px] text-[#555555]">
                <p>
                  <span className="font-medium text-gray-700">{job.contactName}</span>
                </p>
                <a
                  href={`tel:${job.contactPhone.replace(/\s/g, "")}`}
                  className="block text-[#F57C00] hover:underline"
                >
                  {job.contactPhone}
                </a>
                <a
                  href={`mailto:${job.contactEmail}`}
                  className="block text-[#F57C00] hover:underline"
                >
                  {job.contactEmail}
                </a>
              </div>
              {user && job.createdBy === user.id && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingJob(job)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 font-body text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-1"
                  >
                    संपादित करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingJobId(job.id)}
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  >
                    हटाएं
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingJob(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-gray-900">
                नौकरी संपादित करें
              </h2>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="बंद करें"
              >
                ×
              </button>
            </div>
            <JobPostForm
              jobId={editingJob.id}
              initialData={{
                type: editingJob.type as "job" | "profile",
                title: editingJob.title,
                description: editingJob.description,
                category: editingJob.category,
                location: editingJob.location,
                contactName: editingJob.contactName,
                contactPhone: editingJob.contactPhone,
                contactEmail: editingJob.contactEmail,
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
            className="w-full max-w-sm rounded-[12px] border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 font-body text-gray-700">
              क्या आप वाकई इस पोस्ट को हटाना चाहते हैं?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingJobId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 font-body text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingJobId)}
                disabled={deleteLoading}
                className="rounded-md bg-red-600 px-4 py-2 font-body text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleteLoading ? "हटाया जा रहा है..." : "हटाएं"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
