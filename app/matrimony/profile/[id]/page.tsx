import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { Container } from "@/components/ui/Container";
import { getAppBaseUrl } from "@/lib/get-app-base-url";
import { MarriageSubscribeButton } from "../../_components/MarriageSubscribeButton";
import { MatrimonyProfileHeroCarousel } from "./_components/MatrimonyProfileHeroCarousel";
import { MatrimonyProfileDetails } from "./_components/MatrimonyProfileDetails";

type RestrictedProfile = {
  id: string;
  fullName: string;
  profession: string;
  profilePhotoUrl: string;
};

type FullProfile = RestrictedProfile & {
  age: number;
  gender: string;
  galleryUrls: string[];
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  education: string;
  income: string;
  location: string;
  about: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
};

function profileHeroImages(profile: FullProfile | RestrictedProfile): string[] {
  const full = profile as FullProfile;
  if (Array.isArray(full.galleryUrls) && full.galleryUrls.length > 0) {
    return full.galleryUrls.filter((u): u is string => typeof u === "string" && Boolean(u.trim()));
  }
  if (typeof profile.profilePhotoUrl === "string" && profile.profilePhotoUrl.trim()) {
    return [profile.profilePhotoUrl];
  }
  return [];
}

function splitLocationForProfile(location: string): { city: string; state: string } {
  const t = location.trim();
  if (!t) return { city: "—", state: "—" };
  const parts = t
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return {
      city: parts[0]!,
      state: parts.slice(1).join(", "),
    };
  }
  return { city: t, state: "—" };
}

async function fetchProfileJson(
  id: string,
  cookieHeader: string
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const baseUrl = await getAppBaseUrl();
  const res = await fetch(`${baseUrl}/api/matrimony/profile/${id}`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export default async function MatrimonyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const result = await fetchProfileJson(id, cookieHeader);

  if (result.status === 403) {
    const msg =
      typeof (result.data as { error?: string })?.error === "string"
        ? (result.data as { error: string }).error
        : "यह सुविधा केवल सदस्यों के लिए उपलब्ध है";
    return (
      <main>
        <FormPageShell className="!pt-4 sm:!pt-6">
          <Container className="!max-w-2xl !px-4 sm:!px-6">
            <div className="border border-gray-300 bg-white px-5 py-8 text-center font-body text-gray-800 shadow-sm sm:px-6 sm:py-10">
            <p className="text-lg">{msg}</p>
            <Link
              href="/matrimony"
              className="mt-6 inline-block text-[#b45309] underline hover:no-underline"
            >
              वैवाहिक पोर्टल पर वापस जाएं
            </Link>
          </div>
        </Container>
        </FormPageShell>
      </main>
    );
  }

  if (result.status === 404) {
    notFound();
  }

  if (!result.ok || !result.data || typeof result.data !== "object") {
    return (
      <main>
        <FormPageShell className="!pt-4 sm:!pt-6">
          <Container className="!max-w-2xl !px-4 sm:!px-6">
            <p className="font-body text-gray-700">प्रोफ़ाइल लोड नहीं हो सकी।</p>
          </Container>
        </FormPageShell>
      </main>
    );
  }

  const payload = result.data as {
    restricted?: boolean;
    profile?: FullProfile | RestrictedProfile;
  };
  const profile = payload.profile;
  if (!profile) notFound();

  if (payload.restricted) {
    const p = profile as RestrictedProfile;
    const heroImages = profileHeroImages(p);
    return (
      <main>
        <FormPageShell className="!pt-4 sm:!pt-6">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="space-y-6">
              <Link
                href="/matrimony"
                className="inline-block font-body text-sm text-[#b45309] hover:underline"
              >
                ← सूची पर वापस
              </Link>
              <MatrimonyProfileHeroCarousel images={heroImages} />
              <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md">
                <div className="p-5 sm:p-6">
                  <div>
                    <h1 className="font-heading text-3xl font-bold text-gray-900">{p.fullName}</h1>
                    <p className="mt-1 font-body text-gray-600">{p.profession}</p>
                  </div>
                </div>
                <section
                  className="border-t border-gray-200 bg-gradient-to-b from-slate-50 via-gray-50 to-slate-50/90 px-4 py-6 sm:px-6 sm:py-8"
                  aria-labelledby="marriage-lock-heading"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <h2
                      id="marriage-lock-heading"
                      className="font-body text-[15px] font-medium leading-relaxed text-gray-800"
                    >
                      विवाह प्रोफाइल की पूरी जानकारी देखने के लिए सदस्यता लें
                    </h2>
                    <div className="mt-4 w-full sm:w-auto">
                      <MarriageSubscribeButton
                        showFeeHint
                        className="inline-flex w-full min-h-[46px] items-center justify-center rounded-lg bg-[#F57C00] px-8 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition-[background-color,box-shadow] hover:bg-[#E65100] hover:shadow-md disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-auto sm:min-w-[240px]"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </FormPageShell>
      </main>
    );
  }

  const full = profile as FullProfile;
  const heroImages = profileHeroImages(full);

  const { city, state } = splitLocationForProfile(full.location ?? "");

  const profileSummaryItems: { label: string; value: string }[] = [
    { label: "आयु", value: full.age != null ? `${full.age} वर्ष` : "—" },
    { label: "शहर", value: city },
    { label: "राज्य", value: state },
    { label: "व्यवसाय", value: full.profession?.trim() || "—" },
    { label: "शिक्षा", value: full.education?.trim() || "—" },
  ];

  const headerSubtitle =
    city !== "—"
      ? state !== "—"
        ? `${city}, ${state}`
        : city
      : (full.location?.trim() || "—");

  const genderLabel =
    full.gender === "male" ? "पुरुष" : full.gender === "female" ? "महिला" : full.gender;

  return (
    <main>
      <FormPageShell className="!pt-4 sm:!pt-6">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="space-y-6">
            <Link
              href="/matrimony"
              className="inline-block font-body text-sm text-[#b45309] hover:underline"
            >
              ← सूची पर वापस
            </Link>

            <MatrimonyProfileHeroCarousel images={heroImages} />

            <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-md sm:p-6">
              <h1 className="font-heading text-3xl font-bold text-gray-900">{full.fullName}</h1>
              <p className="mt-1 font-body text-gray-600">{headerSubtitle}</p>
            </div>

            <MatrimonyProfileDetails
              profileSummaryItems={profileSummaryItems}
              genderLabel={genderLabel}
              height={full.height}
              maritalStatus={full.maritalStatus}
              religion={full.religion}
              caste={full.caste}
              income={full.income}
              location={full.location}
              about={full.about}
              contactName={full.contactName}
              contactPhone={full.contactPhone}
              contactEmail={full.contactEmail}
            />
          </div>
        </div>
      </FormPageShell>
    </main>
  );
}
