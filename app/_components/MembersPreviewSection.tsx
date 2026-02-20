import Link from "next/link";
import { connectDB } from "@/lib/db";
import Member from "@/lib/models/Member";

interface IMember {
  _id: string;
  name: string;
  area: string;
}

async function getLatestMembers(): Promise<IMember[]> {
  try {
    await connectDB();
    const members = await Member.find({ isPublic: true })
      .sort({ joinedAt: -1 })
      .limit(6)
      .select("name area")
      .lean();

    return members.map((m) => ({
      _id: (m._id as { toString(): string }).toString(),
      name: m.name,
      area: m.area,
    }));
  } catch {
    return [];
  }
}

function MemberCard({ member }: { member: IMember }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
      <p className="font-medium text-slate-900">{member.name}</p>
      <p className="mt-0.5 text-sm text-slate-500">{member.area}</p>
    </div>
  );
}

export default async function MembersPreviewSection() {
  const members = await getLatestMembers();

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Community Members
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Neighbors who have joined our community.
          </p>
        </div>

        {members.length > 0 ? (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {members.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/members"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View All Members
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50/50 px-6 py-12 text-center sm:px-8">
            <p className="text-slate-600">No members yet. Be the first to join.</p>
            <Link
              href="#join-community"
              className="mt-4 inline-block text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
            >
              Join our community
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
