"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const MARITAL_STATUSES = ["Never Married", "Divorced", "Widowed", "Separated"] as const;
const HEIGHTS = [
  "4'10\" (147 cm)",
  "5'0\" (152 cm)",
  "5'2\" (157 cm)",
  "5'4\" (162 cm)",
  "5'6\" (167 cm)",
  "5'8\" (172 cm)",
  "5'10\" (177 cm)",
  "6'0\" (182 cm)",
  "6'2\" (187 cm)",
  "6'4\" (193 cm)",
  "Other",
] as const;

export interface MatrimonyFormData {
  fullName: string;
  age: number;
  gender: "male" | "female";
  profilePhotoUrl: string;
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  education: string;
  profession: string;
  income: string;
  location: string;
  about: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

interface MatrimonyPostFormProps {
  initialData?: MatrimonyFormData;
  profileId?: string;
  onSuccess?: () => void;
}

export function MatrimonyPostForm({ initialData, profileId, onSuccess }: MatrimonyPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialData?.profilePhotoUrl ?? "");
  const isEdit = Boolean(profileId && initialData);

  useEffect(() => {
    if (initialData?.profilePhotoUrl) {
      setProfilePhotoUrl(initialData.profilePhotoUrl);
    }
  }, [initialData?.profilePhotoUrl]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/matrimony/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProfilePhotoUrl(data.url);
        setError(null);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      fullName: (form.elements.namedItem("fullName") as HTMLInputElement).value.trim(),
      age: parseInt((form.elements.namedItem("age") as HTMLInputElement).value, 10),
      gender: (form.elements.namedItem("gender") as HTMLSelectElement).value as "male" | "female",
      profilePhotoUrl,
      height: (form.elements.namedItem("height") as HTMLSelectElement).value.trim(),
      maritalStatus: (form.elements.namedItem("maritalStatus") as HTMLSelectElement).value.trim(),
      religion: (form.elements.namedItem("religion") as HTMLInputElement).value.trim(),
      caste: (form.elements.namedItem("caste") as HTMLInputElement).value.trim(),
      education: (form.elements.namedItem("education") as HTMLInputElement).value.trim(),
      profession: (form.elements.namedItem("profession") as HTMLInputElement).value.trim(),
      income: (form.elements.namedItem("income") as HTMLInputElement).value.trim(),
      location: (form.elements.namedItem("location") as HTMLInputElement).value.trim(),
      about: (form.elements.namedItem("about") as HTMLTextAreaElement).value.trim(),
      contactName: (form.elements.namedItem("contactName") as HTMLInputElement).value.trim(),
      contactPhone: (form.elements.namedItem("contactPhone") as HTMLInputElement).value.trim(),
      contactEmail: (form.elements.namedItem("contactEmail") as HTMLInputElement).value.trim(),
    };

    try {
      const url = isEdit
        ? `/api/matrimony/update/${profileId}`
        : "/api/matrimony/create";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        router.push("/matrimony");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]";
  const labelClass = "mb-1.5 block font-body text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className={inputClass}
          placeholder="Your full name"
          defaultValue={initialData?.fullName}
        />
      </div>

      <div>
        <label htmlFor="age" className={labelClass}>
          Age
        </label>
        <input
          id="age"
          name="age"
          type="number"
          required
          min={18}
          max={120}
          className={inputClass}
          placeholder="e.g. 28"
          defaultValue={initialData?.age}
        />
      </div>

      <div>
        <label htmlFor="gender" className={labelClass}>
          Gender
        </label>
        <select id="gender" name="gender" required className={inputClass} defaultValue={initialData?.gender}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Profile Photo
        </label>
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-gray-300 px-4 py-3 font-body text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-70"
          >
            {uploading ? "Uploading..." : "Choose file (JPEG, PNG, WebP, max 5MB)"}
          </button>
          {profilePhotoUrl && (
            <div className="flex items-center gap-3">
              <img
                src={profilePhotoUrl}
                alt="Profile"
                className="h-20 w-20 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => setProfilePhotoUrl("")}
                className="text-sm text-red-600 hover:underline"
              >
                Remove photo
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="height" className={labelClass}>
          Height
        </label>
        <select id="height" name="height" required className={inputClass} defaultValue={initialData?.height}>
          <option value="">Select height</option>
          {HEIGHTS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="maritalStatus" className={labelClass}>
          Marital Status
        </label>
        <select id="maritalStatus" name="maritalStatus" required className={inputClass} defaultValue={initialData?.maritalStatus}>
          <option value="">Select status</option>
          {MARITAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="religion" className={labelClass}>
          Religion
        </label>
        <input
          id="religion"
          name="religion"
          type="text"
          required
          className={inputClass}
          placeholder="e.g. Hindu, Sikh"
          defaultValue={initialData?.religion}
        />
      </div>

      <div>
        <label htmlFor="caste" className={labelClass}>
          Caste
        </label>
        <input
          id="caste"
          name="caste"
          type="text"
          required
          className={inputClass}
          placeholder="e.g. Kushwaha"
          defaultValue={initialData?.caste}
        />
      </div>

      <div>
        <label htmlFor="education" className={labelClass}>
          Education
        </label>
        <input
          id="education"
          name="education"
          type="text"
          required
          className={inputClass}
          placeholder="e.g. B.Tech, MBA"
          defaultValue={initialData?.education}
        />
      </div>

      <div>
        <label htmlFor="profession" className={labelClass}>
          Profession
        </label>
        <input
          id="profession"
          name="profession"
          type="text"
          required
          className={inputClass}
          placeholder="e.g. Software Engineer"
          defaultValue={initialData?.profession}
        />
      </div>

      <div>
        <label htmlFor="income" className={labelClass}>
          Income
        </label>
        <input
          id="income"
          name="income"
          type="text"
          required
          className={inputClass}
          placeholder="e.g. 5-10 LPA"
          defaultValue={initialData?.income}
        />
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          className={inputClass}
          placeholder="e.g. New Delhi, Mumbai"
          defaultValue={initialData?.location}
        />
      </div>

      <div>
        <label htmlFor="about" className={labelClass}>
          About
        </label>
        <textarea
          id="about"
          name="about"
          rows={5}
          required
          className={`${inputClass} resize-y`}
          placeholder="Tell us about yourself, family background, expectations..."
          defaultValue={initialData?.about}
        />
      </div>

      <div className="border-t border-gray-200 pt-5">
        <p className="mb-4 font-body text-sm font-medium text-gray-700">
          Contact details
        </p>
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="contactName" className={labelClass}>
              Contact Name
            </label>
            <input
              id="contactName"
              name="contactName"
              type="text"
              required
              className={inputClass}
              placeholder="Your name or guardian/relative"
              defaultValue={initialData?.contactName}
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className={labelClass}>
              Phone
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              required
              className={inputClass}
              placeholder="e.g. +91 9876543210"
              defaultValue={initialData?.contactPhone}
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              Email
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              className={inputClass}
              placeholder="contact@example.com"
              defaultValue={initialData?.contactEmail}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
      >
        {loading ? (isEdit ? "Updating..." : "Posting...") : (isEdit ? "Update Profile" : "Post Profile")}
      </button>
    </form>
  );
}
