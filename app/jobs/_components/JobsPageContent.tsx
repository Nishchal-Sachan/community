"use client";

import Link from "next/link";
import { Suspense } from "react";
import { JobsListing } from "./JobsListing";

export function JobsPageContent() {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Jobs & profiles</h1>
          <p className="mt-1 font-body text-gray-600">
            Opportunities and talent in the ABKM community.
          </p>
        </div>
        <Link
          href="/jobs/post"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
        >
          Post a job or candidate profile
        </Link>
      </div>
      <Suspense fallback={<div className="rounded-xl border border-gray-100 bg-white px-6 py-14 text-center font-body text-gray-500 shadow-sm">Loading…</div>}>
        <JobsListing />
      </Suspense>
    </>
  );
}
