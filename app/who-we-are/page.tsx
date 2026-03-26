import Link from "next/link";
import Footer from "@/app/_components/Footer";
import ImpactStatsSection from "@/app/_components/ImpactStatsSection";
import LeadershipCmsSliderSection from "@/app/_components/LeadershipCmsSliderSection";
import {
  getMergedSiteContent,
  leadershipCardsFromContent,
} from "@/lib/get-site-content";

function DividerWithDots({ bg = "bg-white" }: { bg?: string }) {
  return (
    <div className="relative mx-auto mt-5 w-30" aria-hidden="true">
      <div className="h-px w-full bg-[#cccccc]" />
      <div
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 px-0.5 ${bg}`}
      >
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
      </div>
    </div>
  );
}

const KEY_INITIATIVES = [
  {
    icon: "🎓",
    title: "शिक्षा सहायता",
    desc: "छात्रों को शिक्षा, स्कॉलरशिप और करियर मार्गदर्शन प्रदान करना।",
    href: "/who-we-are#impact",
  },
  {
    icon: "💼",
    title: "रोजगार पोर्टल",
    desc: "युवाओं को नौकरी और व्यवसाय के अवसरों से जोड़ना।",
    href: "/jobs",
  },
  {
    icon: "🏥",
    title: "स्वास्थ्य सेवा",
    desc: "स्वास्थ्य जागरूकता और चिकित्सा सहायता कार्यक्रम।",
    href: "/join",
  },
  {
    icon: "👩‍👩‍👧‍👦",
    title: "महिला सशक्तिकरण",
    desc: "महिलाओं के लिए प्रशिक्षण और आत्मनिर्भरता कार्यक्रम।",
    href: "/members",
  },
  {
    icon: "⚖️",
    title: "कानूनी सहायता",
    desc: "कानूनी मार्गदर्शन और दस्तावेज़ सहायता।",
    href: "/who-we-are#contact",
  },
  {
    icon: "📢",
    title: "सामाजिक कार्यक्रम",
    desc: "सामाजिक और सांस्कृतिक आयोजनों के माध्यम से एकता बढ़ाना।",
    href: "/gallery",
  },
] as const;

const ORG_LEVELS = [
  { title: "राष्ट्रीय स्तर", desc: "पूरे देश में नीतियाँ बनाना, दिशा निर्धारित करना और समन्वय स्थापित करना।" },
  { title: "राज्य स्तर", desc: "राज्य स्तर पर कार्यक्रमों का संचालन और संगठन को मजबूत करना।" },
  { title: "जिला स्तर", desc: "जिला इकाइयों के माध्यम से स्थानीय स्तर पर कार्यों को लागू करना।" },
  { title: "स्थानीय इकाई", desc: "ग्राम और वार्ड स्तर पर समाज के लोगों से सीधा संपर्क और सहयोग।" },
];

const OBJECTIVES = [
  { label: "शिक्षा", desc: "समाज के बच्चों को गुणवत्तापूर्ण शिक्षा और मार्गदर्शन प्रदान करना।" },
  { label: "रोजगार", desc: "युवाओं को रोजगार और स्वरोजगार के अवसर उपलब्ध कराना।" },
  { label: "सामाजिक एकता", desc: "समाज के लोगों को जोड़कर एक मजबूत नेटवर्क बनाना।" },
  { label: "महिला सशक्तिकरण", desc: "महिलाओं को आत्मनिर्भर और सशक्त बनाना।" },
  { label: "आत्मनिर्भरता", desc: "समाज के प्रत्येक व्यक्ति को आत्मनिर्भर बनाने के लिए प्रयास करना।" },
];

export const metadata = {
  title: "Who We Are",
  description:
    "अखिल भारतीय कुशवाहा महासभा — एक संगठित, सशक्त और जागरूक समाज के निर्माण की दिशा में समर्पित।",
};

export const dynamic = "force-dynamic";

export default async function WhoWeArePage() {
  const content = await getMergedSiteContent();
  const leadershipCms = leadershipCardsFromContent(content.leadership);

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* 1. Hero */}
      <section className="border-b border-gray-200 bg-white py-14 px-6 lg:px-16">
        <div className="mx-auto max-w-4xl text-left">
          <h1 className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Who We Are
          </h1>
          <div className="mt-5 space-y-2 font-body text-[15px] leading-[1.85] text-gray-700">
            <p>
              अखिल भारतीय कुशवाहा महासभा एक राष्ट्रीय स्तर का सामाजिक संगठन है, जो समाज के सर्वांगीण विकास के लिए समर्पित है। हमारा उद्देश्य समाज के प्रत्येक वर्ग को शिक्षा, स्वास्थ्य, रोजगार और सम्मान के माध्यम से सशक्त बनाना है।
            </p>
          </div>
          <DividerWithDots bg="bg-white" />
        </div>
      </section>

      {/* 2. About Organization */}
      <section className="border-b border-gray-200 bg-gray-50 py-20 px-6 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-left">
            <h2 className="font-heading text-2xl font-bold text-gray-800 md:text-3xl">
              हमारे बारे में
            </h2>
            <div className="mx-auto mt-4 mb-6 h-px w-16 bg-[#F57C00]" aria-hidden />
            <div className="space-y-5 font-body text-[15px] leading-[1.9] text-gray-600">
              <p>
                अखिल भारतीय कुशवाहा महासभा (ABKM) एक राष्ट्रीय सामाजिक संगठन है जो समाज के सर्वांगीण विकास के लिए समर्पित है। संगठन पूरे भारत में अपनी उपस्थिति बनाए हुए है और हज़ारों सदस्यों को जोड़ता है।
              </p>
              <p>
                हम शिक्षा, स्वास्थ्य, रोजगार, कानूनी सहायता और सामाजिक एकता के क्षेत्र में कार्य करते हैं। समाज के हर वर्ग — युवा, महिलाएं, बुजुर्ग — को अवसर और मार्गदर्शन प्रदान करना हमारा प्रमुख उद्देश्य है।
              </p>
              <p>
                समुदाय उत्थान और सामाजिक सशक्तिकरण हमारे कार्यों का केंद्र है। हम ग्रामीण और शहरी दोनों क्षेत्रों में कार्यक्रम चलाते हैं तथा समाज को एकजुट और आत्मनिर्भर बनाने के लिए निरंतर प्रयासरत हैं।
              </p>
            </div>
          </div>
          <div>
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-8 shadow-sm">
              <h3 className="mb-6 font-heading text-xl font-bold text-gray-800">
                हमारा उद्देश्य
              </h3>
              <ul className="space-y-4 font-body text-[15px] leading-[1.85] text-gray-700">
                {OBJECTIVES.map((obj, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 shrink-0 text-[#F57C00]">✔</span>
                    <div>
                      <span className="font-medium text-gray-800">{obj.label}</span>
                      <p className="mt-0.5 text-gray-600">{obj.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision & Mission */}
      <section className="border-b border-gray-200 bg-white py-20 px-6 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-left">
            <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-[#F57C00]">
              Direction
            </p>
            <h2 className="font-heading text-2xl font-bold text-gray-800 md:text-3xl">
              विजन और मिशन
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="mb-4 font-heading text-lg font-bold text-[#F57C00]">
                विजन
              </h3>
              <p className="font-body text-[15px] leading-[1.9] text-gray-600">
                एक सशक्त, शिक्षित और सम्मानित समाज का निर्माण करना, जहाँ हर व्यक्ति को समान अवसर और सम्मान प्राप्त हो।
              </p>
              <p className="mt-3 font-body text-[15px] leading-[1.9] text-gray-600">
                हम ऐसा समाज बनाना चाहते हैं जहाँ हर वर्ग का व्यक्ति आत्मनिर्भर और जागरूक हो।
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="mb-4 font-heading text-lg font-bold text-[#F57C00]">
                मिशन
              </h3>
              <p className="font-body text-[15px] leading-[1.9] text-gray-600">
                समाज के हर वर्ग को जोड़कर उन्हें अवसर, सहयोग और मार्गदर्शन प्रदान करना।
              </p>
              <p className="mt-3 font-body text-[15px] leading-[1.9] text-gray-600">
                हम शिक्षा, रोजगार, स्वास्थ्य और सामाजिक कार्यक्रमों के माध्यम से समाज को आगे बढ़ाने का कार्य करते हैं।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Leadership — same LeadershipCmsSliderSection + leadershipCardsFromContent as homepage (`embedded` = title/description stay on this page) */}
      <section
        id="who-we-are-leadership"
        className="border-b border-gray-200 bg-gray-50 py-20 px-6 lg:px-16"
        aria-labelledby="who-we-are-leadership-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-left">
            <h2
              id="who-we-are-leadership-heading"
              className="font-heading text-2xl font-bold text-gray-800 md:text-3xl"
            >
              हमारे नेतृत्वकर्ता
            </h2>
            <p className="mt-4 max-w-2xl font-body text-[15px] leading-[1.85] text-gray-600">
              हमारे अनुभवी नेतृत्वकर्ता समाज के विकास के लिए निरंतर कार्यरत हैं।
            </p>
          </div>
          <LeadershipCmsSliderSection cmsCards={leadershipCms} embedded />
        </div>
      </section>

      {/* 5. Organizational Structure */}
      <section className="border-b border-gray-200 bg-white py-20 px-6 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-left">
            <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-[#F57C00]">
              Structure
            </p>
            <h2 className="font-heading text-2xl font-bold text-gray-800 md:text-3xl">
              संगठनात्मक संरचना
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ORG_LEVELS.map((level, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left shadow-sm"
              >
                <h3 className="font-heading text-lg font-bold text-gray-800">
                  {level.title}
                </h3>
                <p className="mt-3 font-body text-[15px] leading-[1.85] text-gray-600">
                  {level.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Key Initiatives — anchor for nav "सेवाएं" (homepage CMS services section removed) */}
      <section
        id="services"
        className="border-b border-gray-200 bg-gray-50 py-20 px-6 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-left">
            <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-[#F57C00]">
              Our Work
            </p>
            <h2 className="font-heading text-2xl font-bold text-gray-800 md:text-3xl">
              प्रमुख पहल
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_INITIATIVES.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group block cursor-pointer rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2"
              >
                <span className="text-2xl transition-transform duration-200 ease-out group-hover:scale-105" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-3 font-heading text-lg font-semibold text-gray-800 group-hover:text-[#F57C00]">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-[15px] leading-[1.85] text-gray-600">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Stats — client fetch /api/stats */}
      <ImpactStatsSection />

      {/* 8. Sankalp */}
      <section className="border-b border-gray-200 bg-white py-20 px-6 lg:px-16">
        <div className="mx-auto max-w-4xl text-left">
          <h3 className="mb-6 font-heading text-2xl font-bold text-gray-800 md:text-3xl">
            हमारा संकल्प
          </h3>
          <div className="space-y-5 font-body text-[15px] leading-[1.9] text-gray-600">
            <p>
              हमारा संकल्प है कि समाज के हर व्यक्ति को शिक्षा, स्वास्थ्य और सम्मान के साथ एक बेहतर जीवन प्रदान किया जाए। हम निरंतर प्रयास करते हैं कि आने वाली पीढ़ियों के लिए एक सशक्त और समृद्ध समाज का निर्माण हो।
            </p>
          </div>
          <blockquote className="mt-8 border-l-4 border-[#F57C00] bg-gray-50 py-4 pl-6 pr-4 font-body text-lg font-medium leading-[1.85] text-gray-800">
            &quot;शिक्षा, स्वास्थ्य और सम्मान — कुशवाहा समाज की पहचान&quot;
          </blockquote>
        </div>
      </section>

      <Footer />
    </main>
  );
}
