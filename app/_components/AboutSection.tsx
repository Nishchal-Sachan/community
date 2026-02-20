import { connectDB } from "@/lib/db";
import { getSiteSettings } from "@/lib/models/SiteSettings";

const LEADER_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop";

const HIGHLIGHTS = [
  {
    title: "Vision",
    content:
      "A thriving community where every neighborhood has access to quality schools, reliable infrastructure, and opportunities for all. Long-term growth built on sustainable development and shared prosperity.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Mission",
    content:
      "To advance development projects that matter—better roads, upgraded schools, and expanded community centers. Foster citizen engagement through town halls, surveys, and open dialogue.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: "Values",
    content: "Integrity, Service, Inclusivity",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

async function getLeaderName(): Promise<string> {
  try {
    await connectDB();
    const settings = await getSiteSettings();
    return settings.heroTitle;
  } catch {
    return "Community Leader";
  }
}

export default async function AboutSection() {
  const leaderName = await getLeaderName();

  return (
    <section id="about" className="bg-gray-50 py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* First row: image left, text right */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[5/6] overflow-hidden rounded-2xl bg-gray-100 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LEADER_IMAGE}
              alt={`${leaderName} portrait`}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 h-1 w-12 rounded-full bg-blue-900" />
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">
              About {leaderName}
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              For over twelve years, I have had the privilege of serving our community—first as a
              school board member, then as a city council representative. My work has centered on
              education reform, infrastructure upgrades, and youth empowerment programs that give
              every child a fair start. I believe that strong schools, safe streets, and
              well-maintained public spaces are the foundation of a thriving neighborhood.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              Transparency and accountability are non-negotiable. Every decision I make is
              informed by resident input, public data, and a commitment to doing what is right
              for the long term—not just what is convenient. I invite you to hold me to that
              standard.
            </p>
          </div>
        </div>

        {/* Second row: 3 cards (separate from content above) */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-2xl bg-white p-8 shadow-md transition hover:shadow-xl"
            >
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-slate-700">
                  {item.icon}
                </div>
              </div>
              <h3 className="mb-3 mt-6 text-xl font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
