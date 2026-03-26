"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { JOB_MAX_LENGTHS } from "@/lib/job-field-limits";
import { JOB_POSTING_TYPES, sanitizeSkills } from "@/lib/validate-job-posting";

/** Skills in form state are always `string[]`; sent as JSON array `skills: ["React","Node"]`. */
type SkillsChange = string[] | ((prev: string[]) => string[]);

function applySkillsChange(prev: string[], next: SkillsChange): string[] {
  return typeof next === "function" ? next(prev) : next;
}

const CATEGORIES = [
  "Technology",
  "Healthcare",
  "Education",
  "Agriculture",
  "Retail",
  "Manufacturing",
  "Services",
  "Government",
  "Other",
] as const;

export type JobFlow = "job" | "profile";

export interface JobFormData {
  type: JobFlow;
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
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

/** Client form state — keys match API / Job schema (see `JobFormData`). */
export type JobFormState = {
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  jobRole: string;
  jobType: string;
  experience: string;
  salaryMin: string;
  salaryMax: string;
  salaryNote: string;
  company: string;
  remote: boolean;
  skills: string[];
  preferredJobType: string;
  education: string;
};

/** Initial state — every key must match API `/api/jobs/create` job fields (employer + shared + seeker extras). */
function emptyFormState(): JobFormState {
  return {
    title: "",
    description: "",
    category: "",
    location: "",
    company: "",
    jobRole: "",
    jobType: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    salaryNote: "",
    skills: [],
    remote: false,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    preferredJobType: "",
    education: "",
  };
}

function toFormState(data?: JobFormData): JobFormState {
  const e = emptyFormState();
  if (!data) return e;
  return {
    ...e,
    title: data.title ?? "",
    description: data.description ?? "",
    category: data.category ?? "",
    location: data.location ?? "",
    contactName: data.contactName ?? "",
    contactPhone: data.contactPhone ?? "",
    contactEmail: data.contactEmail ?? "",
    jobRole: data.jobRole ?? "",
    jobType: data.jobType ?? "",
    experience: data.experience ?? "",
    salaryMin: data.salaryMin ?? "",
    salaryMax: data.salaryMax ?? "",
    salaryNote: data.salaryNote ?? "",
    company: data.company ?? "",
    remote: Boolean(data.remote),
    skills: sanitizeSkills(data.skills ?? []),
    preferredJobType: data.preferredJobType ?? "",
    education: data.education ?? "",
  };
}

/** Full employer job payload — every field the API expects for `type: "job"`. */
function buildEmployerJobPayload(fd: JobFormState): Record<string, unknown> {
  return {
    title: fd.title.trim(),
    description: fd.description.trim(),
    category: fd.category.trim(),
    location: fd.location.trim(),
    company: fd.company.trim(),
    jobRole: fd.jobRole.trim(),
    jobType: fd.jobType.trim(),
    experience: fd.experience.trim(),
    salaryMin: fd.salaryMin.trim(),
    salaryMax: fd.salaryMax.trim(),
    salaryNote: fd.salaryNote.trim(),
    skills: sanitizeSkills(Array.isArray(fd.skills) ? fd.skills : []),
    remote: Boolean(fd.remote),
    contactName: fd.contactName.trim(),
    contactPhone: fd.contactPhone.trim(),
    contactEmail: fd.contactEmail.trim(),
  };
}

/** Full candidate profile payload — every field the API expects for `type: "profile"`. */
function buildSeekerProfilePayload(fd: JobFormState): Record<string, unknown> {
  return {
    title: fd.title.trim(),
    description: fd.description.trim(),
    category: fd.category.trim(),
    location: fd.location.trim(),
    contactName: fd.contactName.trim(),
    contactPhone: fd.contactPhone.trim(),
    contactEmail: fd.contactEmail.trim(),
    experience: fd.experience.trim(),
    preferredJobType: fd.preferredJobType.trim(),
    education: fd.education.trim(),
    skills: sanitizeSkills(Array.isArray(fd.skills) ? fd.skills : []),
  };
}

interface JobPostFormProps {
  initialData?: JobFormData;
  jobId?: string;
  onSuccess?: () => void;
}

function CategorySelect({
  inputClass,
  labelClass,
  value,
  onChange,
  label = "Category",
}: {
  inputClass: string;
  labelClass: string;
  value: string;
  onChange: (next: string) => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="category" className={labelClass}>
        {label}
      </label>
      <select
        id="category"
        name="category"
        required
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}

function SkillsTagInput({
  tags,
  onChange,
  inputClass,
  labelClass,
  label,
  hint = "Type a skill and press Enter. Up to 20 tags.",
  draftInputId,
  inputName = "skills",
  tagChipClassName = "border-gray-200 bg-gray-50 text-gray-800",
  removeBtnClassName = "text-gray-500 hover:bg-gray-200 hover:text-gray-800",
  placeholder = "e.g. React, TypeScript, communication",
}: {
  tags: string[];
  /** Updates `skills` as string[] — supports functional updates so Enter always appends to latest array. */
  onChange: (next: SkillsChange) => void;
  inputClass: string;
  labelClass: string;
  label: string;
  hint?: string;
  draftInputId: string;
  /** For a11y / debugging — values are stored in React state; request body sends `skills: string[]`. */
  inputName?: string;
  tagChipClassName?: string;
  removeBtnClassName?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const maxTag = JOB_MAX_LENGTHS.skillTag;
  const maxSkills = JOB_MAX_LENGTHS.skillsMaxCount;

  function addTag(raw: string) {
    const t = raw.trim().slice(0, maxTag);
    if (!t) return;
    onChange((prev) => {
      if (prev.includes(t) || prev.length >= maxSkills) return prev;
      return [...prev, t];
    });
    setDraft("");
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={draftInputId} className={labelClass}>
        {label}
      </label>
      <p className="font-body text-xs text-gray-500">{hint}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-body text-sm ${tagChipClassName}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange((prev) => prev.filter((x) => x !== tag))}
                className={`ml-0.5 rounded p-0.5 ${removeBtnClassName}`}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id={draftInputId}
        name={inputName}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "NumpadEnter") {
            e.preventDefault();
            addTag(draft);
          }
        }}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
        className={inputClass}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

/** Grouped card section — keeps the form scannable and compact. */
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
      <h3 className="mb-5 border-b border-gray-200/60 pb-3 font-heading text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-gray-600">
        {title}
      </h3>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function EmployerFields({
  inputClass,
  textAreaClass,
  labelClass,
  formData,
  setFormData,
}: {
  inputClass: string;
  textAreaClass: string;
  labelClass: string;
  formData: JobFormState;
  setFormData: Dispatch<SetStateAction<JobFormState>>;
}) {
  const patch = (partial: Partial<JobFormState>) =>
    setFormData((prev) => ({ ...prev, ...partial }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F57C00] px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-white">
          Employer
        </span>
        <span className="font-body text-sm text-gray-600">Job opening — not a candidate profile</span>
      </div>

      <FormSection title="Job Info">
        <div className="space-y-1.5">
          <label htmlFor="title" className={labelClass}>
            Job title <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className={inputClass}
            placeholder="Frontend Developer, Sales Manager"
            value={formData.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </div>
        <CategorySelect
          inputClass={inputClass}
          labelClass={labelClass}
          value={formData.category}
          onChange={(v) => patch({ category: v })}
          label="Job category"
        />
        <div className="space-y-1.5">
          <label htmlFor="jobRole" className={labelClass}>
            Job role / position <span className="text-red-600">*</span>
          </label>
          <input
            id="jobRole"
            name="jobRole"
            type="text"
            required
            className={inputClass}
            placeholder="e.g. React Developer"
            value={formData.jobRole}
            onChange={(e) => patch({ jobRole: e.target.value })}
          />
          <p className="font-body text-xs text-gray-500">Separate from industry category.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="company" className={labelClass}>
            Company name <span className="text-red-600">*</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className={inputClass}
            placeholder="Your company or organization"
            value={formData.company}
            onChange={(e) => patch({ company: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="location" className={labelClass}>
            City / office location <span className="text-red-600">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            className={inputClass}
            placeholder="e.g. Bengaluru, Mumbai"
            value={formData.location}
            onChange={(e) => patch({ location: e.target.value })}
          />
        </div>
        <label
          htmlFor="employer-remote"
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent px-1 py-1 font-body text-sm text-gray-700 transition-colors hover:border-gray-100 hover:bg-gray-50/80"
        >
          <input
            id="employer-remote"
            type="checkbox"
            name="remote"
            checked={Boolean(formData.remote)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                remote: e.target.checked,
              }))
            }
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#F57C00] focus:ring-2 focus:ring-[#F57C00]/30"
          />
          <span>
            <span className="font-medium">Remote / hybrid offered</span>
            <span className="mt-0.5 block text-xs font-normal text-gray-500">
              Optional — check if remote or hybrid is available.
            </span>
          </span>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="salaryMin" className={labelClass}>
              Salary (min)
            </label>
            <input
              id="salaryMin"
              name="salaryMin"
              type="text"
              className={inputClass}
              placeholder="e.g. 6 LPA"
              value={formData.salaryMin}
              onChange={(e) => patch({ salaryMin: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="salaryMax" className={labelClass}>
              Salary (max)
            </label>
            <input
              id="salaryMax"
              name="salaryMax"
              type="text"
              className={inputClass}
              placeholder="e.g. 12 LPA"
              value={formData.salaryMax}
              onChange={(e) => patch({ salaryMax: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="salaryNote" className={labelClass}>
            Or one-line salary note
          </label>
          <input
            id="salaryNote"
            name="salaryNote"
            type="text"
            className={inputClass}
            placeholder="e.g. Competitive, as per norms"
            value={formData.salaryNote}
            onChange={(e) => patch({ salaryNote: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection title="Requirements">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="jobType" className={labelClass}>
              Job type <span className="text-red-600">*</span>
            </label>
            <select
              id="jobType"
              name="jobType"
              required
              className={inputClass}
              value={formData.jobType}
              onChange={(e) => patch({ jobType: e.target.value })}
            >
              <option value="">Select type</option>
              {JOB_POSTING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="experience" className={labelClass}>
              Experience required <span className="text-red-600">*</span>
            </label>
            <select
              id="experience"
              name="experience"
              required
              className={inputClass}
              value={formData.experience}
              onChange={(e) => patch({ experience: e.target.value })}
            >
              <option value="">Select experience</option>
              <option value="fresher">Fresher</option>
              <option value="1-3">1–3 years</option>
              <option value="3plus">3+ years</option>
            </select>
          </div>
        </div>
        <SkillsTagInput
          draftInputId="employer-skill-draft"
          label="Skills required"
          hint="Press Enter after each skill · max 20"
          tags={formData.skills}
          onChange={(next) =>
            setFormData((prev) => ({
              ...prev,
              skills: applySkillsChange(prev.skills, next),
            }))
          }
          inputClass={inputClass}
          labelClass={labelClass}
          placeholder="e.g. React, TypeScript"
        />
        <div className="space-y-1.5">
          <label htmlFor="description" className={labelClass}>
            Job description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            className={textAreaClass}
            placeholder="Role summary, responsibilities, and requirements."
            value={formData.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection title="Contact Details">
        <p className="text-xs leading-relaxed text-gray-500">
          Shown on the job detail page only (not on the main list). Interested members reach out by phone or
          email.
        </p>
        <div className="space-y-1.5">
          <label htmlFor="contactName" className={labelClass}>
            Contact name <span className="text-red-600">*</span>
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            required
            className={inputClass}
            placeholder="Hiring manager or HR contact"
            value={formData.contactName}
            onChange={(e) => patch({ contactName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contactPhone" className={labelClass}>
            Phone <span className="text-red-600">*</span>
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            required
            className={inputClass}
            placeholder="e.g. +91 9876543210"
            value={formData.contactPhone}
            onChange={(e) => patch({ contactPhone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contactEmail" className={labelClass}>
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            className={inputClass}
            placeholder="contact@company.com"
            value={formData.contactEmail}
            onChange={(e) => patch({ contactEmail: e.target.value })}
          />
        </div>
      </FormSection>
    </div>
  );
}

function JobSeekerProfileFields({
  inputClass,
  textAreaClass,
  labelClass,
  formData,
  setFormData,
}: {
  inputClass: string;
  textAreaClass: string;
  labelClass: string;
  formData: JobFormState;
  setFormData: Dispatch<SetStateAction<JobFormState>>;
}) {
  const patch = (partial: Partial<JobFormState>) =>
    setFormData((prev) => ({ ...prev, ...partial }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-teal-700 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-white">
          Job seeker
        </span>
        <span className="font-body text-sm text-gray-600">Candidate profile — not a job posting</span>
      </div>

      <FormSection title="Profile">
        <div className="space-y-1.5">
          <label htmlFor="seeker-fullName" className={labelClass}>
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            id="seeker-fullName"
            name="contactName"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
            placeholder="Your full name"
            value={formData.contactName}
            onChange={(e) => patch({ contactName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="seeker-desired-title" className={labelClass}>
            Desired job title <span className="text-red-600">*</span>
          </label>
          <input
            id="seeker-desired-title"
            name="title"
            type="text"
            required
            className={inputClass}
            placeholder="e.g. Product Designer, Staff Nurse"
            value={formData.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </div>
        <CategorySelect
          inputClass={inputClass}
          labelClass={labelClass}
          value={formData.category}
          onChange={(v) => patch({ category: v })}
          label="Category"
        />
        <SkillsTagInput
          draftInputId="seeker-skill-draft"
          label="Skills"
          hint="Enter + max 20"
          tags={formData.skills}
          onChange={(next) =>
            setFormData((prev) => ({
              ...prev,
              skills: applySkillsChange(prev.skills, next),
            }))
          }
          inputClass={inputClass}
          labelClass={labelClass}
          tagChipClassName="border-teal-200/90 bg-teal-50/80 text-teal-950"
          removeBtnClassName="text-teal-700 hover:bg-teal-100 hover:text-teal-950"
          placeholder="e.g. Excel, Python, patient care"
        />
        <div className="space-y-1.5">
          <label htmlFor="seeker-bio" className={labelClass}>
            Short bio <span className="text-red-600">*</span>
          </label>
          <textarea
            id="seeker-bio"
            name="description"
            rows={4}
            required
            className={textAreaClass}
            placeholder="Background, strengths, and the role you are looking for."
            value={formData.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection title="Work preferences">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="seeker-experience" className={labelClass}>
              Experience level <span className="text-red-600">*</span>
            </label>
            <select
              id="seeker-experience"
              name="experience"
              required
              className={inputClass}
              value={formData.experience}
              onChange={(e) => patch({ experience: e.target.value })}
            >
              <option value="">Select experience</option>
              <option value="fresher">Fresher</option>
              <option value="1-3">1–3 years</option>
              <option value="3plus">3+ years</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="preferredJobType" className={labelClass}>
              Preferred job type <span className="text-red-600">*</span>
            </label>
            <select
              id="preferredJobType"
              name="preferredJobType"
              required
              className={inputClass}
              value={formData.preferredJobType}
              onChange={(e) => patch({ preferredJobType: e.target.value })}
            >
              <option value="">Select type</option>
              {JOB_POSTING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="seeker-location" className={labelClass}>
            Preferred location <span className="text-red-600">*</span>
          </label>
          <input
            id="seeker-location"
            name="location"
            type="text"
            required
            className={inputClass}
            placeholder="e.g. Mumbai, Remote, Pan-India"
            value={formData.location}
            onChange={(e) => patch({ location: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="seeker-education" className={labelClass}>
            Education <span className="text-red-600">*</span>
          </label>
          <input
            id="seeker-education"
            name="education"
            type="text"
            required
            className={inputClass}
            placeholder="e.g. B.Tech CSE, Diploma in Nursing"
            value={formData.education}
            onChange={(e) => patch({ education: e.target.value })}
          />
        </div>
      </FormSection>

      <FormSection title="Contact Details">
        <div className="space-y-1.5">
          <label htmlFor="seeker-phone" className={labelClass}>
            Contact phone <span className="text-red-600">*</span>
          </label>
          <input
            id="seeker-phone"
            name="contactPhone"
            type="tel"
            required
            autoComplete="tel"
            className={inputClass}
            placeholder="e.g. +91 9876543210"
            value={formData.contactPhone}
            onChange={(e) => patch({ contactPhone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="seeker-email" className={labelClass}>
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="seeker-email"
            name="contactEmail"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
            value={formData.contactEmail}
            onChange={(e) => patch({ contactEmail: e.target.value })}
          />
        </div>
      </FormSection>
    </div>
  );
}

export function JobPostForm({ initialData, jobId, onSuccess }: JobPostFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(jobId && initialData);

  const [createFlow, setCreateFlow] = useState<JobFlow>(
    initialData?.type === "profile" ? "profile" : "job"
  );

  /** Which form to show: employer job post vs job seeker profile (driven by tabs in create mode, fixed in edit mode). */
  const activeFlow: JobFlow = isEdit ? initialData!.type : createFlow;
  const isEmployerForm = activeFlow === "job";

  /** Remount form when switching tabs so no stale employer/seeker fields mix in the DOM. */
  const formKey = isEdit ? `edit-${jobId}-${activeFlow}` : `create-${createFlow}`;

  const [formData, setFormData] = useState<JobFormState>(() => toFormState(initialData));

  useEffect(() => {
    setFormData(toFormState(initialData));
  }, [formKey, initialData]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("FORM DATA:", formData);

    const data = isEmployerForm
      ? buildEmployerJobPayload(formData)
      : buildSeekerProfilePayload(formData);
    await submitPayload(data);

    async function submitPayload(data: Record<string, unknown>) {
      try {
        const url = isEdit ? `/api/jobs/update/${jobId}` : "/api/jobs/create";
        const method = isEdit ? "PUT" : "POST";
        const payload: Record<string, unknown> = isEdit
          ? data
          : { type: createFlow, ...data };
        /** Same object as request JSON body — compare with server `REQ BODY:` after `JSON.parse`. */
        console.log("REQUEST BODY (JSON):", payload);

        const body = JSON.stringify(payload);

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body,
          credentials: "include",
        });

        const result = await res.json();

        if (!res.ok) {
          setError(result.error ?? "Something went wrong");
          return;
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/jobs");
          router.refresh();
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  }

  const employerInputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#F57C00] focus:ring-2 focus:ring-[#F57C00]/20";
  const employerTextAreaClass =
    "min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#F57C00] focus:ring-2 focus:ring-[#F57C00]/20 resize-y";
  const seekerInputClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";
  const seekerTextAreaClass =
    "min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 resize-y";
  const labelClass = "block font-body text-sm font-medium text-gray-700";

  const tabBase =
    "flex-1 rounded-xl px-4 py-2.5 text-center font-body text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2";
  const tabActive = "bg-white text-gray-900 shadow-sm";
  const tabInactive = "text-gray-600 hover:text-gray-900";

  const submitLabel = (() => {
    if (loading) {
      return isEmployerForm ? "Posting…" : "Submitting…";
    }
    if (isEdit) {
      return isEmployerForm ? "Save job" : "Save profile";
    }
    return isEmployerForm ? "Post Job" : "Submit Profile";
  })();

  return (
    <div className="flex flex-col gap-6">
      {!isEdit && (
        <div>
          <p className="mb-2 font-body text-sm font-medium text-gray-700">
            I want to
          </p>
          <div
            className="flex gap-1 rounded-2xl border border-gray-200 bg-gray-100/90 p-1"
            role="tablist"
            aria-label="Choose job portal flow"
          >
            <button
              type="button"
              role="tab"
              id="tab-employer"
              aria-selected={createFlow === "job"}
              aria-controls="job-portal-form-panel"
              className={`${tabBase} ${createFlow === "job" ? tabActive : tabInactive}`}
              onClick={() => setCreateFlow("job")}
            >
              <span className="block font-semibold">Post a Job</span>
              <span className="mt-0.5 block text-xs font-normal text-gray-500">
                For employers
              </span>
            </button>
            <button
              type="button"
              role="tab"
              id="tab-seeker"
              aria-selected={createFlow === "profile"}
              aria-controls="job-portal-form-panel"
              className={`${tabBase} ${createFlow === "profile" ? tabActive : tabInactive}`}
              onClick={() => setCreateFlow("profile")}
            >
              <span className="block font-semibold">Find a Job</span>
              <span className="mt-0.5 block text-xs font-normal text-gray-500">
                Job seeker profile
              </span>
            </button>
          </div>
          <p className="mt-2 font-body text-xs text-gray-500">
            {createFlow === "job"
              ? "Post an open role for the community."
              : "Create a candidate profile — skills, goals, and contact — for employers to discover."}
          </p>
        </div>
      )}

      {isEdit && (
        <p className="rounded-md border border-amber-100 bg-amber-50/80 px-3 py-2 font-body text-sm text-amber-950">
          {isEmployerForm
            ? "Editing: job post (employer)"
            : "Editing: job seeker (candidate profile)"}
        </p>
      )}

      <form
        key={formKey}
        id="job-portal-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        aria-labelledby={!isEdit ? (isEmployerForm ? "tab-employer" : "tab-seeker") : undefined}
      >
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div
          id="job-portal-form-panel"
          role="tabpanel"
          aria-labelledby={!isEdit ? (isEmployerForm ? "tab-employer" : "tab-seeker") : undefined}
        >
          {isEmployerForm ? (
            <EmployerFields
              inputClass={employerInputClass}
              textAreaClass={employerTextAreaClass}
              labelClass={labelClass}
              formData={formData}
              setFormData={setFormData}
            />
          ) : (
            <JobSeekerProfileFields
              inputClass={seekerInputClass}
              textAreaClass={seekerTextAreaClass}
              labelClass={labelClass}
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`rounded-xl px-8 py-3.5 font-body text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:text-base ${
            isEmployerForm
              ? "bg-[#F57C00] hover:bg-[#E65100] focus-visible:ring-[#F57C00]"
              : "bg-teal-700 hover:bg-teal-800 focus-visible:ring-teal-600"
          }`}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
