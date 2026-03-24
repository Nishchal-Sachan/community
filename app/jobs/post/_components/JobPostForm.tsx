"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

const CATEGORY_LABELS: Record<string, string> = {
  Technology: "प्रौद्योगिकी",
  Healthcare: "स्वास्थ्य सेवा",
  Education: "शिक्षा",
  Agriculture: "कृषि",
  Retail: "खुदरा",
  Manufacturing: "विनिर्माण",
  Services: "सेवाएं",
  Government: "सरकार",
  Other: "अन्य",
};

export interface JobFormData {
  type: "job" | "profile";
  title: string;
  description: string;
  category: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

interface JobPostFormProps {
  initialData?: JobFormData;
  jobId?: string;
  onSuccess?: () => void;
}

export function JobPostForm({ initialData, jobId, onSuccess }: JobPostFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(jobId && initialData);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value.trim(),
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim(),
      category: (form.elements.namedItem("category") as HTMLSelectElement).value.trim(),
      location: (form.elements.namedItem("location") as HTMLInputElement).value.trim(),
      contactName: (form.elements.namedItem("contactName") as HTMLInputElement).value.trim(),
      contactPhone: (form.elements.namedItem("contactPhone") as HTMLInputElement).value.trim(),
      contactEmail: (form.elements.namedItem("contactEmail") as HTMLInputElement).value.trim(),
    };

    try {
      const url = isEdit
        ? `/api/jobs/update/${jobId}`
        : "/api/jobs/create";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? JSON.stringify(data) : JSON.stringify({
        type: (form.elements.namedItem("type") as HTMLSelectElement).value as "job" | "profile",
        ...data,
      });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "कुछ गलत हुआ");
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/jobs");
        router.refresh();
      }
    } catch {
      setError("कुछ गलत हुआ");
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

      {!isEdit && (
        <div>
          <label htmlFor="type" className={labelClass}>
            मुझे चाहिए
          </label>
          <select
            id="type"
            name="type"
            required
            className={inputClass}
            defaultValue="job"
          >
            <option value="job">मुझे नौकरी देनी है</option>
            <option value="profile">मुझे नौकरी ढूँढनी है</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>
          शीर्षक
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className={inputClass}
          placeholder="जैसे फ्रंटएंड डेवलपर, सेल्स मैनेजर"
          defaultValue={initialData?.title}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          विवरण
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          className={`${inputClass} resize-y`}
          placeholder="भूमिका या अपने अनुभव का विवरण दें..."
          defaultValue={initialData?.description}
        />
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>
          श्रेणी
        </label>
        <select id="category" name="category" required className={inputClass} defaultValue={initialData?.category}>
          <option value="">श्रेणी चुनें</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] ?? cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>
          स्थान
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          className={inputClass}
          placeholder="जैसे नई दिल्ली, रिमोट"
          defaultValue={initialData?.location}
        />
      </div>

      <div className="border-t border-gray-200 pt-5">
        <p className="mb-4 font-body text-sm font-medium text-gray-700">
          संपर्क विवरण
        </p>
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="contactName" className={labelClass}>
              संपर्क नाम
            </label>
            <input
              id="contactName"
              name="contactName"
              type="text"
              required
              className={inputClass}
              placeholder="आपका नाम या संपर्क व्यक्ति"
              defaultValue={initialData?.contactName}
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className={labelClass}>
              फ़ोन
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              required
              className={inputClass}
              placeholder="जैसे +91 9876543210"
              defaultValue={initialData?.contactPhone}
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              ईमेल
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
        {loading ? (isEdit ? "अपडेट हो रहा है..." : "पोस्ट हो रहा है...") : (isEdit ? "नौकरी अपडेट करें" : "नौकरी पोस्ट करें")}
      </button>
    </form>
  );
}
