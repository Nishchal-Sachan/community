"use client";

import Link from "next/link";
import { JobsListing } from "./JobsListing";

export function JobsPageContent() {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">रोजगार और प्रोफाइल</h1>
          <p className="mt-1 font-body text-gray-600">ABKM समुदाय में अवसर और प्रतिभा।</p>
        </div>
        <Link
          href="/jobs/post"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
        >
          नौकरी पोस्ट करें
        </Link>
      </div>
      <JobsListing />
    </>
  );
}
