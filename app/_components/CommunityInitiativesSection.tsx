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
  { title: "युवा विकास कार्यक्रम", description: "कौशल निर्माण कार्यशालाओं और मेंटरशिप पहल को सहयोग।", icon: "academic" },
  { title: "महिला सशक्तिकरण", description: "उद्यमिता और वित्तीय साक्षरता कार्यक्रमों को बढ़ावा।", icon: "users" },
  { title: "बुनियादी ढाँचे में सुधार", description: "सड़कें, स्वच्छता और सार्वजनिक सुविधाओं का उन्नयन।", icon: "tools" },
  { title: "स्वास्थ्य एवं जागरूकता अभियान", description: "मुफ्त चिकित्सा शिविर और स्वास्थ्य जागरूकता अभियान।", icon: "heart" },
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
            हमारे कार्यक्रम
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
