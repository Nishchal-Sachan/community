import { Container } from "@/components/ui/Container";
import { Section } from "@/components/sections/Section";

interface AboutSectionProps {
  about: {
    bio: string;
    leaderImage: string;
  };
  leaderName: string;
}

const HIGHLIGHTS = [
  {
    title: "संकल्प",
    content:
      "ऐसा समुदाय जहाँ हर क्षेत्र को गुणवत्तापूर्ण शिक्षा, विश्वसनीय बुनियादी सुविधाएं और सभी के लिए अवसर उपलब्ध हों। सतत विकास और साझा समृद्धि पर आधारित दीर्घकालिक विकास।",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "लक्ष्य",
    content:
      "महत्वपूर्ण विकास परियोजनाओं को आगे बढ़ाना — बेहतर सड़कें, उन्नत विद्यालय और विस्तृत समुदाय केंद्र। जनसभाओं, सर्वेक्षणों और खुले संवाद के माध्यम से नागरिक भागीदारी को बढ़ावा देना।",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: "मूल्य",
    content: "निष्ठा, सेवा, समावेशिता",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const FALLBACK_BIO =
  "बारह वर्षों से अधिक समय से मुझे अपने समुदाय की सेवा करने का सौभाग्य मिला है — पहले विद्यालय बोर्ड सदस्य के रूप में, फिर नगर परिषद प्रतिनिधि के रूप में। मेरा कार्य शिक्षा सुधार, बुनियादी ढाँचे के उन्नयन और युवा सशक्तिकरण कार्यक्रमों पर केंद्रित रहा है जो हर बच्चे को उचित शुरुआत देते हैं। मेरा मानना है कि मजबूत विद्यालय, सुरक्षित सड़कें और सुव्यवस्थित सार्वजनिक स्थान एक समृद्ध समुदाय की नींव हैं।\n\nपारदर्शिता और जवाबदेही अटल हैं। मैं जो भी निर्णय लेता हूँ वह निवासियों की राय, सार्वजनिक आँकड़ों और दीर्घकाल में सही करने के प्रति प्रतिबद्धता पर आधारित होता है। मैं आपको उस मानक के प्रति मुझे जवाबदेह बनाने के लिए आमंत्रित करता हूँ।";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop";

export default function AboutSection({ about, leaderName }: AboutSectionProps) {
  const bio = about?.bio?.trim() || FALLBACK_BIO;
  const leaderImage = about?.leaderImage?.trim() || FALLBACK_IMAGE;
  const name = leaderName?.trim() || "समुदाय नेता";
  const paragraphs = bio.split(/\n\n+/).filter(Boolean);

  return (
    <Section id="about" className="bg-white">
      <Container>
        <div className="grid gap-16 md:grid-cols-2">
          <div className="relative aspect-[5/6] overflow-hidden rounded-xl shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={leaderImage}
              alt={`${name} portrait`}
              className="h-full w-full scale-105 object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="h-1 w-10 shrink-0 bg-primary" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight text-gray-900">
              {name} के बारे में
            </h2>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className="mt-4 font-body text-gray-600 leading-loose">
                  {p}
                </p>
              ))
            ) : (
              <p className="mt-4 font-body text-gray-600 leading-loose">{bio}</p>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="flex min-w-0 flex-col gap-4 border border-gray-200 bg-white p-6 text-left transition-[transform,box-shadow] duration-200 ease-out rounded-xl hover:-translate-y-1.5 hover:shadow-lg"
            >
              <div className="flex w-fit items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
                {item.icon}
              </div>
              <h3 className="font-heading text-lg font-bold tracking-tight text-gray-900">{item.title}</h3>
              <p className="font-body text-sm leading-relaxed text-gray-600 sm:text-base">{item.content}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
