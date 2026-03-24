import { Suspense } from "react";
import { cookies } from "next/headers";
import { JoinLink } from "@/components/JoinLink";
import PaginationControls from "@/app/_components/PaginationControls";
import EventsSection from "@/app/_components/EventsSection";
import { Container } from "@/components/ui/Container";
import { getAppBaseUrl } from "@/lib/get-app-base-url";
import { getUserFromCookie } from "@/lib/user-auth";
import { hasFullMemberAccess } from "@/lib/member-access";
import { MembersPortalContent } from "./_components/MembersPortalContent";
import { MembersFilters } from "./_components/MembersFilters";

interface MemberRow {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  occupation?: string;
  membershipDate?: string;
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
  members: MemberRow[];
  restricted?: boolean;
  pagination: Pagination;
}

function formatMembershipDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

async function fetchMembers(
  page: number,
  cookieHeader: string,
  q: string,
  state: string,
  city: string
): Promise<ApiResponse> {
  const baseUrl = await getAppBaseUrl();
  const params = new URLSearchParams({ page: String(page) });
  if (q.trim()) params.set("q", q.trim());
  if (state.trim()) params.set("state", state.trim());
  if (city.trim()) params.set("city", city.trim());

  const res = await fetch(`${baseUrl}/api/members?${params.toString()}`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });

  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}

async function MembersList({
  page,
  cookieHeader,
  q,
  state,
  city,
}: {
  page: number;
  cookieHeader: string;
  q: string;
  state: string;
  city: string;
}) {
  let data: ApiResponse;

  try {
    data = await fetchMembers(page, cookieHeader, q, state, city);
  } catch {
    return (
      <div className="border border-gray-300 bg-white px-6 py-10 text-center font-body text-sm text-gray-600">
        सदस्य लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।
      </div>
    );
  }

  const { members, pagination, restricted = false } = data;

  if (pagination.total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-gray-300 bg-white px-6 py-16 text-center">
        <p className="font-body text-gray-700">कोई सदस्य उपलब्ध नहीं है</p>
        <JoinLink className="inline-flex min-h-[44px] items-center rounded border border-gray-400 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50">
          हमारे समुदाय से जुड़ें
        </JoinLink>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="border border-gray-300 bg-white px-6 py-12 text-center font-body text-sm text-gray-700">
        खोज से कोई सदस्य नहीं मिला। अन्य शब्द आज़माएँ।
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {restricted && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 font-body text-sm text-amber-900">
          <p className="font-medium">पूर्ण विवरण देखने के लिए सदस्यता आवश्यक है</p>
        </div>
      )}

      <p className="font-body text-sm text-gray-600">
        दिख रहा है {(pagination.page - 1) * pagination.pageSize + 1}–
        {Math.min(pagination.page * pagination.pageSize, pagination.total)} / {pagination.total} सदस्य
      </p>

      <div className="overflow-x-auto border border-gray-300 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left font-body text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-100">
              <th className="border-b border-gray-300 px-3 py-2.5 font-semibold text-gray-900">नाम</th>
              {!restricted && (
                <>
                  <th className="border-b border-gray-300 px-3 py-2.5 font-semibold text-gray-900">ईमेल</th>
                  <th className="border-b border-gray-300 px-3 py-2.5 font-semibold text-gray-900">
                    मोबाइल नंबर
                  </th>
                  <th className="border-b border-gray-300 px-3 py-2.5 font-semibold text-gray-900">शहर</th>
                  <th className="border-b border-gray-300 px-3 py-2.5 font-semibold text-gray-900">राज्य</th>
                  <th className="border-b border-gray-300 px-3 py-2.5 font-semibold text-gray-900">व्यवसाय</th>
                  <th className="border-b border-gray-300 px-3 py-2.5 font-semibold text-gray-900">
                    सदस्यता तिथि
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id} className="border-b border-gray-200 even:bg-gray-50/50">
                <td className="px-3 py-2.5 align-top text-gray-900">{m.fullName}</td>
                {!restricted && (
                  <>
                    <td className="px-3 py-2.5 align-top text-gray-800">
                      {m.email && m.email !== "—" ? (
                        <a href={`mailto:${m.email}`} className="break-all text-[#b45309] hover:underline">
                          {m.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top text-gray-800">
                      {m.phone && m.phone !== "—" ? (
                        <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="text-[#b45309] hover:underline">
                          {m.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top text-gray-800">{m.city ?? "—"}</td>
                    <td className="px-3 py-2.5 align-top text-gray-800">{m.state ?? "—"}</td>
                    <td className="px-3 py-2.5 align-top text-gray-800">{m.occupation ?? "—"}</td>
                    <td className="px-3 py-2.5 align-top text-gray-700">
                      {m.membershipDate ? formatMembershipDate(m.membershipDate) : "—"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
  searchParams: Promise<{ page?: string; q?: string; state?: string; city?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const q = (params.q ?? "").trim();
  const state = (params.state ?? "").trim();
  const city = (params.city ?? "").trim();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const payload = await getUserFromCookie();
  const isMember = await hasFullMemberAccess(payload);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50">
      <Container className="flex flex-col gap-8 py-16">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="type-h1">समुदाय के सदस्य</h1>
            <p className="font-body text-sm leading-relaxed text-gray-600">
              सार्वजनिक सदस्य निर्देशिका
            </p>
          </div>
          <MembersPortalContent isMember={isMember} />
        </div>

        <Suspense
          fallback={<div className="mb-4 h-10 max-w-xl animate-pulse rounded border border-gray-200 bg-gray-100" />}
        >
          <MembersFilters enabled={isMember} />
        </Suspense>

        <Suspense
          key={`${page}-${q}-${state}-${city}`}
          fallback={
            <div className="h-48 animate-pulse border border-gray-200 bg-gray-100" aria-hidden />
          }
        >
          <MembersList
            page={page}
            cookieHeader={cookieHeader}
            q={q}
            state={state}
            city={city}
          />
        </Suspense>

        <EventsSection />
      </Container>
    </main>
  );
}
