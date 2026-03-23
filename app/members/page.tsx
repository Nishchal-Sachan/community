import { Suspense } from "react";
import { JoinLink } from "@/components/JoinLink";
import PaginationControls from "@/app/_components/PaginationControls";
import { Container } from "@/components/ui/Container";
import { getAppBaseUrl } from "@/lib/get-app-base-url";

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
  const baseUrl = await getAppBaseUrl();
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
    <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white px-5 py-4">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-gray-900">{member.name}</p>
        <p className="text-sm text-gray-500">{member.area}</p>
        <p className="text-xs text-gray-400">Joined {joined}</p>
      </div>
    </div>
  );
}

async function MembersList({ page }: { page: number }) {
  let data: ApiResponse;

  try {
    data = await fetchMembers(page);
  } catch {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-600">
        Failed to load members. Please try again later.
      </div>
    );
  }

  const { members, pagination } = data;

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
        <p className="type-body">No members yet. Be the first to join.</p>
        <JoinLink
          className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Join our community
        </JoinLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-700">
          {(pagination.page - 1) * pagination.pageSize + 1}–
          {Math.min(pagination.page * pagination.pageSize, pagination.total)}
        </span>{" "}
        of <span className="font-medium text-gray-700">{pagination.total}</span> members
      </p>

      <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
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
    <main className="min-h-screen overflow-x-hidden bg-gray-50">
      <Container className="flex flex-col gap-8 py-16">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="type-h1">Community Members</h1>
            <p className="font-body text-sm leading-relaxed text-gray-600">
              People who have joined our community
            </p>
          </div>
          <JoinLink
            className="flex min-h-[44px] items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Join now
          </JoinLink>
        </div>

        <Suspense
          key={page}
          fallback={
            <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          }
        >
          <MembersList page={page} />
        </Suspense>
      </Container>
    </main>
  );
}
