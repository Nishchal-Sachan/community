import Link from "next/link";
import { JoinLink } from "@/components/JoinLink";
import { connectDB } from "@/lib/db";
import Member from "@/lib/models/Member";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/sections/Section";

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
    <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white px-5 py-4">
      <p className="font-medium text-gray-900">{member.name}</p>
      <p className="type-body text-sm">{member.area}</p>
    </div>
  );
}

export default async function MembersPreviewSection() {
  const members = await getLatestMembers();

  return (
    <Section className="bg-white">
      <Container>
        <div className="section-stack">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="type-h2">Community Members</h2>
            <p className="type-body max-w-2xl">
              Neighbors who have joined our community.
            </p>
          </div>

          {members.length > 0 ? (
            <>
              <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <MemberCard key={member._id} member={member} />
                ))}
              </div>

              <div className="flex justify-center">
                <Link
                  href="/members"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  View All Members
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center sm:px-8">
              <p className="type-body">No members yet. Be the first to join.</p>
              <JoinLink
                className="inline-block text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
              >
                Join our community
              </JoinLink>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
