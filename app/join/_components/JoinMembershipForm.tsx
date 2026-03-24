"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { INDIA_STATES_AND_UTS } from "@/lib/india-states";

interface JoinMembershipFormProps {
  onSuccess?: () => void;
  formId?: string;
  submitInFooter?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export function JoinMembershipForm({
  onSuccess,
  formId,
  submitInFooter,
  onLoadingChange,
}: JoinMembershipFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    onLoadingChange?.(true);

    const form = e.currentTarget;
    const formData = {
      fullName: (form.elements.namedItem("fullName") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim().toLowerCase(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      city: (form.elements.namedItem("city") as HTMLInputElement).value.trim(),
      state: (form.elements.namedItem("state") as HTMLInputElement).value.trim(),
      occupation: (form.elements.namedItem("occupation") as HTMLInputElement).value.trim(),
    };

    try {
      const res = await fetch("/api/join/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "कुछ गलत हुआ");
        return;
      }

      onSuccess?.();
      router.push(data.redirect ?? "/payment");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-3 font-body text-sm font-semibold text-gray-800">
          व्यक्तिगत जानकारी
        </legend>
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block font-body text-sm font-medium text-gray-700"
          >
            पूरा नाम
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            maxLength={100}
            lang="en"
            className="min-h-[44px] w-full rounded-lg border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
            placeholder="Full name (English, e.g. Rajesh Kumar)"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-body text-sm font-medium text-gray-700"
          >
            ईमेल पता
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            lang="en"
            className="min-h-[44px] w-full rounded-lg border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block font-body text-sm font-medium text-gray-700"
          >
            फ़ोन नंबर
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={20}
            lang="en"
            className="min-h-[44px] w-full rounded-lg border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
            placeholder="+91 9876543210"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-3 font-body text-sm font-semibold text-gray-800">
          स्थान की जानकारी
        </legend>
        <div>
          <label
            htmlFor="city"
            className="mb-2 block font-body text-sm font-medium text-gray-700"
          >
            शहर
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            maxLength={80}
            lang="en"
            className="min-h-[44px] w-full rounded-lg border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
            placeholder="City (English, e.g. Mumbai)"
          />
        </div>
        <div>
          <label
            htmlFor="state"
            className="mb-2 block font-body text-sm font-medium text-gray-700"
          >
            राज्य
          </label>
          <select
            id="state"
            name="state"
            required
            className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-body text-gray-900 focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
            defaultValue=""
          >
            <option value="" disabled>
              Select state / UT (English)
            </option>
            {INDIA_STATES_AND_UTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-3 font-body text-sm font-semibold text-gray-800">
          व्यावसायिक जानकारी
        </legend>
        <div>
          <label
            htmlFor="occupation"
            className="mb-2 block font-body text-sm font-medium text-gray-700"
          >
            व्यवसाय
          </label>
          <input
            id="occupation"
            name="occupation"
            type="text"
            required
            maxLength={120}
            lang="en"
            className="min-h-[44px] w-full rounded-lg border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
            placeholder="Occupation (English, e.g. Teacher)"
          />
        </div>
      </fieldset>

      {!submitInFooter && (
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-[#F57C00] px-6 py-3.5 font-body font-medium text-white transition-colors hover:bg-[#E65100] disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
        >
          {loading ? "सेव हो रहा है..." : "भुगतान पर जाएं"}
        </button>
      )}
    </form>
  );
}
