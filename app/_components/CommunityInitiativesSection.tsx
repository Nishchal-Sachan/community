import { getInitiativeIcon } from "@/lib/icon-map";

interface Initiative {
  title: string;
  description: string;
  icon: string;
}

interface CommunityInitiativesSectionProps {
  initiatives: Initiative[];
}

const FALLBACK_INITIATIVES: Initiative[] = [
  { title: "Youth Development Programs", description: "Supporting skill-building workshops and mentorship initiatives.", icon: "academic" },
  { title: "Women Empowerment", description: "Promoting entrepreneurship and financial literacy programs.", icon: "users" },
  { title: "Infrastructure Improvement", description: "Roads, sanitation, and public facilities upgrades.", icon: "tools" },
  { title: "Health & Awareness Drives", description: "Free medical camps and wellness awareness campaigns.", icon: "heart" },
];

export default function CommunityInitiativesSection({
  initiatives,
}: CommunityInitiativesSectionProps) {
  const items = Array.isArray(initiatives) && initiatives.length > 0
    ? initiatives
    : FALLBACK_INITIATIVES;

  return (
    <section id="initiatives" className="overflow-hidden bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Building a Stronger Community Together
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Focused efforts to improve the quality of life for everyone in our neighborhood.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white sm:h-14 sm:w-14 [&>svg]:h-full [&>svg]:max-h-full [&>svg]:w-full [&>svg]:max-w-full">
                {getInitiativeIcon(item.icon)}
              </div>
              <h3 className="mt-5 break-words text-base font-semibold text-slate-900 sm:mt-6 sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 break-words text-sm leading-relaxed text-slate-600 sm:mt-3">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
