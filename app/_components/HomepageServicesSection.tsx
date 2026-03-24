interface Props {
  title: string;
  descriptions: string[];
}

export default function HomepageServicesSection({ title, descriptions }: Props) {
  const heading = title.trim() || "हमारी सेवाएं";
  const lines =
    descriptions.length > 0
      ? descriptions
      : [
          "समाज के सर्वांगीण विकास हेतु शिक्षा व स्वास्थ्य कार्यक्रम।",
          "युवाओं के लिए कौशल व रोजगार संबंधी सहयोग।",
          "सांस्कृतिक व सामाजिक एकता के आयोजन।",
        ];

  return (
    <section
      id="services"
      className="border-y border-gray-200 bg-white px-6 py-16 lg:px-16"
      aria-labelledby="home-services-heading"
    >
      <div className="mx-auto max-w-[900px]">
        <h2
          id="home-services-heading"
          className="border-b border-gray-300 pb-3 font-heading text-2xl font-semibold text-gray-900 md:text-3xl"
        >
          {heading}
        </h2>
        <ul className="mt-6 list-disc space-y-3 pl-6 font-body text-[15px] leading-relaxed text-gray-700">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
