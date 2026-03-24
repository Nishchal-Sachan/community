"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { MATRIMONY_MAX_GALLERY } from "@/lib/matrimony-profile";

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
  galleryUrls: string[];
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

function galleryFromInitial(initial?: MatrimonyFormData): string[] {
  if (!initial) return [];
  const g = initial.galleryUrls?.filter(Boolean) ?? [];
  if (g.length > 0) return g.slice(0, MATRIMONY_MAX_GALLERY);
  return [];
}

export function MatrimonyPostForm({ initialData, profileId, onSuccess }: MatrimonyPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => galleryFromInitial(initialData));
  const isEdit = Boolean(profileId && initialData);

  const syncGalleryFromInitial = useCallback(() => {
    setGalleryUrls(galleryFromInitial(initialData));
  }, [initialData]);

  useEffect(() => {
    syncGalleryFromInitial();
  }, [syncGalleryFromInitial]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      let next = [...galleryUrls];
      for (let i = 0; i < files.length && next.length < MATRIMONY_MAX_GALLERY; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("photo", file);
        const res = await fetch("/api/matrimony/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.url) {
          next = [...next, data.url].slice(0, MATRIMONY_MAX_GALLERY);
        } else {
          setError(data.error ?? "अपलोड विफल");
          break;
        }
      }
      setGalleryUrls(next);
      if (next.length > galleryUrls.length) setError(null);
    } catch {
      setError("अपलोड विफल");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(index: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
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
      galleryUrls,
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
      const url = isEdit ? `/api/matrimony/update/${profileId}` : "/api/matrimony/create";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        router.push("/matrimony");
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
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label htmlFor="fullName" className={labelClass}>
          पूरा नाम
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className={inputClass}
          placeholder="आपका पूरा नाम"
          defaultValue={initialData?.fullName}
        />
      </div>

      <div>
        <label htmlFor="age" className={labelClass}>
          आयु
        </label>
        <input
          id="age"
          name="age"
          type="number"
          required
          min={18}
          max={120}
          className={inputClass}
          placeholder="जैसे 28"
          defaultValue={initialData?.age}
        />
      </div>

      <div>
        <label htmlFor="gender" className={labelClass}>
          लिंग
        </label>
        <select
          id="gender"
          name="gender"
          required
          className={inputClass}
          defaultValue={initialData?.gender}
        >
          <option value="">लिंग चुनें</option>
          <option value="male">पुरुष</option>
          <option value="female">महिला</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>प्रोफ़ाइल फोटो (1–4, अधिकतम 4)</label>
        <p className="mb-2 font-body text-xs text-gray-500">
          कम से कम एक फोटो जोड़ने की सिफारिश है।
        </p>
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || galleryUrls.length >= MATRIMONY_MAX_GALLERY}
            className="rounded-md border border-gray-300 px-4 py-3 font-body text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading
              ? "अपलोड हो रहा है..."
              : galleryUrls.length >= MATRIMONY_MAX_GALLERY
                ? "अधिकतम 4 फोटो"
                : "फोटो जोड़ें (JPEG, PNG, WebP, 5MB तक)"}
          </button>
          {galleryUrls.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {galleryUrls.map((url, idx) => (
                <li key={`${url}-${idx}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-24 w-24 rounded object-cover ring-1 ring-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white hover:bg-red-700"
                    aria-label="फोटो हटाएं"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="height" className={labelClass}>
          ऊँचाई
        </label>
        <select
          id="height"
          name="height"
          required
          className={inputClass}
          defaultValue={initialData?.height}
        >
          <option value="">ऊँचाई चुनें</option>
          {HEIGHTS.map((h) => (
            <option key={h} value={h}>
              {h === "Other" ? "अन्य" : h}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="maritalStatus" className={labelClass}>
          वैवाहिक स्थिति
        </label>
        <select
          id="maritalStatus"
          name="maritalStatus"
          required
          className={inputClass}
          defaultValue={initialData?.maritalStatus}
        >
          <option value="">स्थिति चुनें</option>
          <option value="Never Married">अविवाहित</option>
          <option value="Divorced">तलाकशुदा</option>
          <option value="Widowed">विधुर/विधवा</option>
          <option value="Separated">अलग</option>
        </select>
      </div>

      <div>
        <label htmlFor="religion" className={labelClass}>
          धर्म
        </label>
        <input
          id="religion"
          name="religion"
          type="text"
          required
          className={inputClass}
          placeholder="जैसे हिंदू, सिख"
          defaultValue={initialData?.religion}
        />
      </div>

      <div>
        <label htmlFor="caste" className={labelClass}>
          जाति
        </label>
        <input
          id="caste"
          name="caste"
          type="text"
          required
          className={inputClass}
          placeholder="जैसे कुशवाहा"
          defaultValue={initialData?.caste}
        />
      </div>

      <div>
        <label htmlFor="education" className={labelClass}>
          शिक्षा
        </label>
        <input
          id="education"
          name="education"
          type="text"
          required
          className={inputClass}
          placeholder="जैसे बी.टेक, एमबीए"
          defaultValue={initialData?.education}
        />
      </div>

      <div>
        <label htmlFor="profession" className={labelClass}>
          व्यवसाय
        </label>
        <input
          id="profession"
          name="profession"
          type="text"
          required
          className={inputClass}
          placeholder="जैसे सॉफ्टवेयर इंजीनियर"
          defaultValue={initialData?.profession}
        />
      </div>

      <div>
        <label htmlFor="income" className={labelClass}>
          आय
        </label>
        <input
          id="income"
          name="income"
          type="text"
          required
          className={inputClass}
          placeholder="जैसे 5-10 LPA"
          defaultValue={initialData?.income}
        />
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
          placeholder="जैसे नई दिल्ली, मुंबई"
          defaultValue={initialData?.location}
        />
      </div>

      <div>
        <label htmlFor="about" className={labelClass}>
          परिचय
        </label>
        <textarea
          id="about"
          name="about"
          rows={5}
          required
          className={`${inputClass} resize-y`}
          placeholder="अपने बारे में, पारिवारिक पृष्ठभूमि, अपेक्षाएं बताएं..."
          defaultValue={initialData?.about}
        />
      </div>

      <div className="border-t border-gray-200 pt-5">
        <p className="mb-4 font-body text-sm font-medium text-gray-700">संपर्क विवरण</p>
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
              placeholder="आपका नाम या अभिभावक/संबंधी"
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
        {loading
          ? isEdit
            ? "अपडेट हो रहा है..."
            : "पोस्ट हो रहा है..."
          : isEdit
            ? "प्रोफाइल अपडेट करें"
            : "प्रोफाइल पोस्ट करें"}
      </button>
    </form>
  );
}
