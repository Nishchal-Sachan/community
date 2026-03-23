const GOAL_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop&q=80";

const GOAL_CONTENT = `Our foremost goal is the empowerment of every member—women, youth, workers, and entrepreneurs alike—so that they can participate fully in the economic and social life of the nation. We believe that dignity grows when people have access to information, representation, and opportunities that match their aspirations, whether they live in a village, a small town, or a growing city.

In step with the vision of Digital India, we strive to narrow the technology gap through digital literacy, online service awareness, and safe use of government portals and banking platforms. By building confidence with tools that are already reshaping work and governance, we help communities move from passive beneficiaries to active citizens who can verify schemes, apply for benefits, and connect with markets beyond their immediate geography.

Skill development sits at the centre of our roadmap: vocational training, apprenticeship-style learning, and continuous upskilling so that traditional occupations and new sectors both remain open to our people.`;

function GoalIcon() {
  return (
    <div
      className="mb-[15px] flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[#F57C00] text-white"
      aria-hidden
    >
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  );
}

export default function OurGoalSection() {
  return (
    <section
      id="our-goal"
      className="relative h-[650px] w-full overflow-hidden"
      aria-labelledby="our-goal-title"
    >
      {/* Step 3: Background image — absolute, true background, NOT in container */}
      <img
        src={GOAL_IMAGE}
        alt=""
        className="absolute left-0 top-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Step 4: Dark overlay — gradient left-to-right for better depth */}
      <div
        className="absolute left-0 top-0 h-full w-full"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.4))",
        }}
        aria-hidden
      />

      {/* Step 5: Content wrapper — flex, right-aligned, no max-width constraint */}
      <div
        className="relative flex h-full items-center justify-end pr-20"
        style={{ zIndex: 2 }}
      >
        {/* Step 6: Floating card */}
        <div
          className="w-[520px] shrink-0 rounded-[10px] bg-white p-10"
          style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}
          id="our-goal-card"
        >
          <GoalIcon />
          <h2
            id="our-goal-title"
            className="mb-[15px] font-heading text-[28px] font-bold text-[#222222]"
          >
            Our Goal
          </h2>
          <div className="space-y-4 font-body text-[15px] leading-[1.8] text-[#555555]">
            {GOAL_CONTENT.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
