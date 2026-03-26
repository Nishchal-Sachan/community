"use client";

import {
  categories,
  HELPDESK_CATEGORIES,
  HELPDESK_CATEGORY_LABELS_HI,
  subLabelHi,
  type HelpdeskCategory,
} from "@/lib/helpdesk-categories";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const inputClass =
  "w-full rounded-md border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]";
const labelClass = "mb-1.5 block font-body text-sm font-medium text-gray-700";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

export function HelpdeskForm() {
  const [category, setCategory] = useState<HelpdeskCategory | "">("");
  const [subCategory, setSubCategory] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSubCategory("");
  }, [category]);

  const subOptions = category ? [...categories[category]] : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;

    if (!category) {
      setError("श्रेणी चुनें।");
      setLoading(false);
      return;
    }
    if (!subCategory) {
      setError("उप-श्रेणी चुनें।");
      setLoading(false);
      return;
    }

    const fullName = (
      form.elements.namedItem("fullName") as HTMLInputElement
    ).value.trim();
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
      .trim()
      .toLowerCase();
    const location = (
      form.elements.namedItem("location") as HTMLInputElement
    ).value.trim();
    const description = (
      form.elements.namedItem("description") as HTMLTextAreaElement
    ).value.trim();

    const formData: Record<string, unknown> = {
      fullName,
      phone,
      email,
      category,
      subCategory,
      location,
      description,
      urgency,
    };

    const file = fileRef.current?.files?.[0];
    if (file && file.size > 0) {
      try {
        formData.attachmentBase64 = await readFileAsBase64(file);
        formData.attachmentMimeType = file.type;
        formData.attachmentFileName = file.name;
      } catch {
        setError("फ़ाइल पढ़ने में त्रुटि।");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        toast.error("Failed to send request");
        return;
      }

      toast.success("Request sent successfully");
      form.reset();
      setCategory("");
      setSubCategory("");
      setUrgency("medium");
      setFileLabel(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="fullName" className={labelClass}>
            पूरा नाम <span className="text-red-600">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
            placeholder="आपका पूरा नाम"
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            फ़ोन नंबर <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={inputClass}
            placeholder="जैसे 9876543210"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            ईमेल (वैकल्पिक)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="contact@example.com"
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            श्रेणी <span className="text-red-600">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            className={inputClass}
            value={category}
            onChange={(e) =>
              setCategory((e.target.value || "") as HelpdeskCategory | "")
            }
          >
            <option value="">श्रेणी चुनें</option>
            {HELPDESK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {HELPDESK_CATEGORY_LABELS_HI[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subCategory" className={labelClass}>
            उप-श्रेणी <span className="text-red-600">*</span>
          </label>
          <select
            id="subCategory"
            name="subCategory"
            required
            disabled={!category}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-100`}
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option value="">
              {category ? "उप-श्रेणी चुनें" : "पहले श्रेणी चुनें"}
            </option>
            {subOptions.map((s) => (
              <option key={s} value={s}>
                {category ? subLabelHi(category, s) : s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>
            स्थान (शहर / ज़िला) <span className="text-red-600">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            className={inputClass}
            placeholder="जैसे लखनऊ, गोरखपुर"
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            विवरण <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            minLength={10}
            className={`${inputClass} resize-y`}
            placeholder="अपनी समस्या या अनुरोध विस्तार से लिखें..."
          />
        </div>

        <div>
          <label htmlFor="urgency" className={labelClass}>
            तात्कालिकता स्तर
          </label>
          <select
            id="urgency"
            name="urgency"
            className={inputClass}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="low">निम्न</option>
            <option value="medium">मध्यम</option>
            <option value="high">उच्च</option>
          </select>
        </div>

        <div>
          <label htmlFor="attachment" className={labelClass}>
            संलग्नक (वैकल्पिक)
          </label>
          <p className="mb-2 font-body text-xs text-gray-500">
            PDF, JPEG, PNG या WebP — अधिकतम 10MB
          </p>
          <input
            ref={fileRef}
            id="attachment"
            name="attachment"
            type="file"
            accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#F57C00] file:px-4 file:py-2 file:font-body file:text-sm file:font-medium file:text-white hover:file:bg-[#E65100]"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFileLabel(f ? f.name : null);
            }}
          />
          {fileLabel ? (
            <p className="mt-2 font-body text-xs text-gray-600">{fileLabel}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2 sm:w-auto"
        >
          {loading ? "भेजा जा रहा है..." : "अनुरोध भेजें"}
        </button>
    </form>
  );
}
