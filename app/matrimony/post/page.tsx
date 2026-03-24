import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getUserFromCookie } from "@/lib/user-auth";
import { getMatrimonyViewerContext } from "@/lib/matrimony-access";
import { MatrimonyPostForm } from "./_components/MatrimonyPostForm";
import { MarriageSubscribeButton } from "../_components/MarriageSubscribeButton";

export default async function MatrimonyPostPage() {
  const payload = await getUserFromCookie();
  const viewer = await getMatrimonyViewerContext(payload);

  if (!viewer?.isActiveMember) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="max-w-2xl">
          <div className="rounded-lg border border-gray-300 bg-white px-8 py-14 text-center shadow-sm">
            <p className="font-body text-lg text-gray-800">
              यह सुविधा केवल सदस्यों के लिए उपलब्ध है
            </p>
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

  if (!viewer.hasMarriageSubscription) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <Container className="max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">
              वैवाहिक प्रोफाइल बनाएं
            </h1>
            <p className="mb-6 font-body text-gray-700">
              प्रोफ़ाइल बनाने के लिए विवाह सदस्यता लें
            </p>
            <MarriageSubscribeButton />
            <Link
              href="/matrimony"
              className="mt-8 inline-block font-body text-sm text-[#b45309] hover:underline"
            >
              ← वापस
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">
            वैवाहिक प्रोफाइल बनाएं
          </h1>
          <p className="mb-8 font-body text-gray-600">
            अपना जीवनसाथी खोजने के लिए ABKM समुदाय के साथ अपना प्रोफाइल साझा करें।
          </p>
          <MatrimonyPostForm />
        </div>
      </Container>
    </main>
  );
}
