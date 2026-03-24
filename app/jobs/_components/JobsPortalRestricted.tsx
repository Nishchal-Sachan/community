import Link from "next/link";

const SAMPLE_JOBS = [
  {
    title: "सॉफ्टवेयर डेवलपर — नमूना पूर्वावलोकन",
    category: "प्रौद्योगिकी",
    location: "दिल्ली",
  },
  {
    title: "शिक्षक — नमूना पूर्वावलोकन",
    category: "शिक्षा",
    location: "लखनऊ",
  },
];

export function JobsPortalRestricted() {
  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center sm:px-10">
        <h2 className="font-heading text-xl font-semibold text-amber-900 sm:text-2xl">
          यह सुविधा केवल सदस्यों के लिए उपलब्ध है
        </h2>
        <p className="mt-3 font-body text-sm text-amber-800 sm:text-base">
          रोजगार पोर्टल का उपयोग करने के लिए कृपया सदस्यता लें
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/members"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#F57C00] bg-[#F57C00] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#E65100] focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
          >
            सदस्य बनें
          </Link>
          <Link
            href="/members"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
          >
            अभी आवेदन करें
          </Link>
        </div>
      </div>

      <div className="relative">
        <p className="mb-4 text-center font-body text-xs font-medium uppercase tracking-wide text-gray-500">
          पूर्वावलोकन (सदस्यता के बाद पूर्ण सूची)
        </p>
        <div className="pointer-events-none select-none space-y-4 blur-sm">
          {SAMPLE_JOBS.map((job, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white px-5 py-4 opacity-90"
              aria-hidden
            >
              <p className="font-medium text-gray-900">{job.title}</p>
              <p className="mt-1 text-sm text-gray-500">
                {job.category} · {job.location}
              </p>
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/20"
          aria-hidden
        >
          <span className="rounded-full border border-gray-300 bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
            🔒 सदस्यों के लिए अनलॉक
          </span>
        </div>
      </div>
    </div>
  );
}
