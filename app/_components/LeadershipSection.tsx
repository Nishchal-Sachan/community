const LEADER_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop&q=80";

const GRADIENT_OVERLAY =
  "linear-gradient(to bottom, rgba(255,165,0,0.6), rgba(0,128,0,0.8))";

const SERVICE_CARDS = [
  {
    title: "Market Research & Analysis",
    points: [
      "Industry Trends & Analysis",
      "Competitive Landscape Analysis",
      "Customer Segmentation",
      "Demand Forecasting",
      "SWOT Analysis",
    ],
  },
  {
    title: "Business Model Consulting",
    points: [
      "Business Model Canvas Design",
      "Revenue Stream Development",
      "Cost Structure & Budgeting",
      "Feasibility Studies",
      "Value Proposition Design",
    ],
  },
  {
    title: "Idea Validation",
    points: [
      "Proof of Concept (PoC)",
      "Expert Feedback & Advisory",
      "Market Testing",
      "Customer Discovery Programs",
      "Product-Market Fit Analysis",
      "New Innovative Technologies",
    ],
  },
  {
    title: "Financial Modeling & Forecasting",
    points: [
      "Cost-Benefit Analysis",
      "Cash Flow Projections",
      "Break-even Analysis",
      "Profit & Loss Forecasting",
      "Risk Assessment",
    ],
  },
  {
    title: "Pitch Deck",
    points: [
      "Investor-ready pitch decks",
      "Vision & mission articulation",
    ],
  },
  {
    title: "Business Plan Development",
    points: [
      "Comprehensive business plans",
      "Market research & analysis",
      "Financial forecasting",
      "Operational strategies",
    ],
  },
] as const;

function QuoteIcon() {
  return (
    <svg
      className="size-20 text-white opacity-80 sm:size-24"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function DividerWithDots() {
  return (
    <div className="relative mx-auto mt-[30px] w-[100px]" aria-hidden="true">
      <div className="h-[1px] w-full bg-[#cccccc]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 bg-white px-0.5">
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
        <span className="size-2 shrink-0 rounded-full bg-[#2E7D32]" />
      </div>
    </div>
  );
}

export default function LeadershipSection() {
  return (
    <section
      id="leadership"
      className="bg-[#ffffff] pb-[100px] pt-[100px]"
      aria-labelledby="leadership-heading"
    >
      <div className="px-4 sm:px-6">
        <p className="text-center font-body text-[12px] uppercase tracking-[3px] text-[#F57C00]">
          VISION MISSION BHARAT
        </p>

        <h2
          id="leadership-heading"
          className="mt-[10px] text-center font-heading text-[42px] font-bold leading-tight text-[#222222]"
        >
          Leadership by Shri Manoj Kushwaha
        </h2>

        <p className="mx-auto my-5 max-w-[900px] text-center font-body text-[15px] leading-[1.9] text-[#555555]">
          Under the dynamic leadership of Akhil Bhartiya Kushwaha Mahasabha, the organization is driving transformative change by empowering rural and urban communities. With a strong network across villages, towns, and metropolitan regions, ABKM is connecting thousands of members and creating opportunities for inclusive growth.
        </p>

        <div className="mb-[60px]">
          <DividerWithDots />
        </div>

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-[1fr_2fr] md:gap-[40px]">
          {/* Left: Leader image card */}
          <div className="relative min-h-[400px] overflow-hidden rounded-[12px] md:min-h-[520px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LEADER_IMAGE}
              alt="Leadership"
              className="h-full w-full object-cover object-top"
            />
            <div
              className="absolute inset-0"
              style={{ background: GRADIENT_OVERLAY }}
              aria-hidden
            />
            <div className="absolute left-5 top-5 opacity-80">
              <QuoteIcon />
            </div>
            <div className="absolute bottom-[30px] left-5 right-5 max-w-[80%]">
              <p className="font-body text-[22px] font-medium leading-snug text-white">
                Economic empowerment for all, ensuring no one is left behind.
              </p>
              <p className="mt-2 font-body text-sm text-white/90">Sanjay Agarwal</p>
            </div>
          </div>

          {/* Right: Service cards grid */}
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-[24px]">
            {SERVICE_CARDS.map((card) => (
              <article
                key={card.title}
                className="rounded-[10px] border border-[#eeeeee] bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:p-[24px]"
              >
                <h3 className="mb-[10px] font-heading text-[18px] font-semibold text-gray-900">
                  {card.title}
                </h3>
                <ul className="list-outside list-disc space-y-1 pl-5 font-body text-[14px] leading-[1.7] text-[#555555] marker:text-[#999]">
                  {card.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
