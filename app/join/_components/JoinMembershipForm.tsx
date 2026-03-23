"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinMembershipForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = {
      fullName: (form.elements.namedItem("fullName") as HTMLInputElement).value.trim(),
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
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push(data.redirect ?? "/payment");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block font-body text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block font-body text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
          placeholder="e.g. +91 9876543210"
        />
      </div>

      <div>
        <label
          htmlFor="city"
          className="mb-1.5 block font-body text-sm font-medium text-gray-700"
        >
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
          placeholder="Enter your city"
        />
      </div>

      <div>
        <label
          htmlFor="state"
          className="mb-1.5 block font-body text-sm font-medium text-gray-700"
        >
          State
        </label>
        <input
          id="state"
          name="state"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
          placeholder="Enter your state"
        />
      </div>

      <div>
        <label
          htmlFor="occupation"
          className="mb-1.5 block font-body text-sm font-medium text-gray-700"
        >
          Occupation
        </label>
        <input
          id="occupation"
          name="occupation"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-4 py-3 font-body focus:border-[#F57C00] focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
          placeholder="Enter your occupation"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
      >
        {loading ? "Saving..." : "Continue to Payment"}
      </button>
    </form>
  );
}
