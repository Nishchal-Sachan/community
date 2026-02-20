import { Suspense } from "react";
import Link from "next/link";
import PaginationControls from "@/app/_components/PaginationControls";

interface Member {
  _id: string;
  name: string;
  area: string;
  joinedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  members: Member[];
  pagination: Pagination;
}

async function fetchMembers(page: number): Promise<ApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/members?page=${page}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}

function MemberCard({ member }: { member: Member }) {
  const joined = new Date(member.joinedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
      <p className="font-medium text-slate-900">{member.name}</p>
      <p className="mt-0.5 text-sm text-slate-500">{member.area}</p>
      <p className="mt-1 text-xs text-slate-400">Joined {joined}</p>
    </div>
  );
}

async function MembersList({ page }: { page: number }) {
  let data: ApiResponse;

  try {
    data = await fetchMembers(page);
  } catch {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-600">
        Failed to load members. Please try again later.
      </div>
    );
  }

  const { members, pagination } = data;

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-slate-600">No members yet. Be the first to join.</p>
        <Link
          href="/#join-community"
          className="mt-4 inline-block rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Join our community
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">
          {(pagination.page - 1) * pagination.pageSize + 1}–
          {Math.min(pagination.page * pagination.pageSize, pagination.total)}
        </span>{" "}
        of <span className="font-medium text-slate-700">{pagination.total}</span> members
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <MemberCard key={member._id} member={member} />
        ))}
      </div>

      <Suspense>
        <PaginationControls
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      </Suspense>
    </>
  );
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Community Members</h1>
            <p className="mt-1 text-sm text-slate-500">People who have joined our community</p>
          </div>
          <Link
            href="/#join-community"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Join now
          </Link>
        </div>

        <Suspense
          key={page}
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          }
        >
          <MembersList page={page} />
        </Suspense>
      </div>
    </main>
  );
}
