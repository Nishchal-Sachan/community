import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getUserFromCookie } from "@/lib/user-auth";
import { getMatrimonyViewerContext } from "@/lib/matrimony-access";
import { MatrimonyListing } from "./_components/MatrimonyListing";

export default async function MatrimonyPage() {
  const payload = await getUserFromCookie();
  const viewer = await getMatrimonyViewerContext(payload);

  if (!viewer?.isActiveMember) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="max-w-2xl">
          <div className="rounded-lg border border-gray-300 bg-white px-8 py-14 text-center shadow-sm">
            <h1 className="font-heading text-2xl font-bold text-gray-900">वैवाहिक</h1>
            <p className="mt-6 font-body text-lg text-gray-800">
              यह सुविधा केवल सदस्यों के लिए उपलब्ध है
            </p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">वैवाहिक</h1>
            <p className="mt-1 font-body text-gray-600">
              ABKM समुदाय के भीतर अपना जीवनसाथी खोजें।
            </p>
          </div>
          <Link
            href="/matrimony/post"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
          >
            प्रोफाइल बनाएं
          </Link>
        </div>
        <MatrimonyListing marriageSubscriptionActive={viewer.hasMarriageSubscription} />
      </Container>
    </main>
  );
}
