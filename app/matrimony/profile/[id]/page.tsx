import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/Container";
import { getAppBaseUrl } from "@/lib/get-app-base-url";
import { MarriageSubscribeButton } from "../../_components/MarriageSubscribeButton";

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
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="max-w-2xl">
          <div className="border border-gray-300 bg-white px-8 py-12 text-center font-body text-gray-800 shadow-sm">
            <p className="text-lg">{msg}</p>
            <Link
              href="/matrimony"
              className="mt-6 inline-block text-[#b45309] underline hover:no-underline"
            >
              वैवाहिक पोर्टल पर वापस जाएं
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  if (result.status === 404) {
    notFound();
  }

  if (!result.ok || !result.data || typeof result.data !== "object") {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="max-w-2xl">
          <p className="font-body text-gray-700">प्रोफ़ाइल लोड नहीं हो सकी।</p>
        </Container>
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
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="max-w-3xl">
          <Link
            href="/matrimony"
            className="mb-6 inline-block font-body text-sm text-[#b45309] hover:underline"
          >
            ← सूची पर वापस
          </Link>
          <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <div className="grid gap-6 border-b border-gray-100 p-6 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-start">
              <div className="aspect-square w-full max-w-[200px] overflow-hidden rounded-md bg-gray-100">
                {p.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.profilePhotoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                    {p.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900">{p.fullName}</h1>
                <p className="mt-1 font-body text-gray-600">{p.profession}</p>
              </div>
            </div>
            <div className="relative min-h-[220px] px-6 py-10">
              <div
                className="pointer-events-none select-none space-y-2 blur-sm"
                aria-hidden
              >
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-5/6 rounded bg-gray-100" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 px-4 text-center">
                <p className="max-w-md font-body text-sm leading-relaxed text-gray-800">
                  विवाह प्रोफ़ाइल की पूरी जानकारी देखने के लिए सदस्यता लें
                </p>
                <MarriageSubscribeButton />
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const full = profile as FullProfile;
  const gallery =
    full.galleryUrls?.length > 0
      ? full.galleryUrls
      : full.profilePhotoUrl
        ? [full.profilePhotoUrl]
        : [];

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-4xl">
        <Link
          href="/matrimony"
          className="mb-6 inline-block font-body text-sm text-[#b45309] hover:underline"
        >
          ← सूची पर वापस
        </Link>

        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
          {gallery.length > 0 && (
            <div className="grid grid-cols-2 gap-1 border-b border-gray-200 sm:grid-cols-4">
              {gallery.slice(0, 4).map((url, i) => (
                <div key={`${url}-${i}`} className="aspect-square bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="p-6 sm:p-8">
            <h1 className="font-heading text-2xl font-bold text-gray-900">{full.fullName}</h1>
            <p className="mt-1 font-body text-gray-600">
              {full.profession}
              {full.age ? ` · ${full.age} वर्ष` : ""}
            </p>

            <dl className="mt-8 grid gap-4 border-t border-gray-200 pt-6 font-body text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-500">लिंग</dt>
                <dd className="mt-0.5 text-gray-900">
                  {full.gender === "male" ? "पुरुष" : full.gender === "female" ? "महिला" : full.gender}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">ऊँचाई</dt>
                <dd className="mt-0.5 text-gray-900">{full.height}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">वैवाहिक स्थिति</dt>
                <dd className="mt-0.5 text-gray-900">{full.maritalStatus}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">धर्म / जाति</dt>
                <dd className="mt-0.5 text-gray-900">
                  {full.religion}
                  {full.caste ? ` · ${full.caste}` : ""}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">शिक्षा</dt>
                <dd className="mt-0.5 text-gray-900">{full.education}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">आय</dt>
                <dd className="mt-0.5 text-gray-900">{full.income}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-500">पता / स्थान</dt>
                <dd className="mt-0.5 text-gray-900">{full.location}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-500">परिचय</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-gray-800">{full.about}</dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="font-body text-sm font-semibold text-gray-900">संपर्क</h2>
              <ul className="mt-3 space-y-2 font-body text-sm">
                <li>
                  <span className="text-gray-500">नाम: </span>
                  <span className="text-gray-900">{full.contactName}</span>
                </li>
                <li>
                  <a
                    href={`tel:${full.contactPhone.replace(/\s/g, "")}`}
                    className="text-[#b45309] hover:underline"
                  >
                    {full.contactPhone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${full.contactEmail}`} className="text-[#b45309] hover:underline">
                    {full.contactEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
