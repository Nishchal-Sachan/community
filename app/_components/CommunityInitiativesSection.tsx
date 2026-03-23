import { getInitiativeIcon } from "@/lib/icon-map";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/sections/Section";

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
    <Section id="programs" className="bg-gray-50">
      <Container>
        <div className="flex flex-col gap-8">
          <h2 className="text-center font-heading text-4xl font-extrabold tracking-tight text-gray-900">
            Programs
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.title}
                className="text-left rounded-lg border border-gray-200 bg-white p-6 transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary hover:shadow-md"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white [&_svg]:h-6 [&_svg]:w-6">
                  {getInitiativeIcon(item.icon)}
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 font-body text-sm text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
