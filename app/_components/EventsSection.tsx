import { connectDB } from "@/lib/db";
import Event from "@/lib/models/Event";

interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
}

async function getUpcomingEvents(): Promise<IEvent[]> {
  try {
    await connectDB();
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(4)
      .select("title description date imageUrl")
      .lean();

    return events.map((e) => ({
      _id: (e._id as { toString(): string }).toString(),
      title: e.title,
      description: e.description,
      date: e.date.toISOString(),
      imageUrl: e.imageUrl,
    }));
  } catch {
    return [];
  }
}

function EventCard({ event }: { event: IEvent }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
          </svg>
          {formattedDate}
        </span>
        <h3 className="mt-3 text-base font-semibold text-slate-900 line-clamp-2 sm:text-lg">{event.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
          {event.description}
        </p>
        <button
          type="button"
          className="mt-4 min-h-[44px] min-w-[44px] w-fit rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-6 py-14 text-center sm:px-8 sm:py-16">
      <p className="text-base text-slate-600 sm:text-lg">
        No upcoming events at the moment. Stay connected for updates.
      </p>
    </div>
  );
}

export default async function EventsSection() {
  const events = await getUpcomingEvents();

  return (
    <section id="upcoming-events" className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Upcoming Events
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Don&apos;t miss out—here&apos;s what&apos;s happening in our community.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState />
          </div>
        )}
      </div>
    </section>
  );
}
