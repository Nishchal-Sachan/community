import Link from "next/link";
import { Container } from "@/components/ui/Container";

const LINKS = [
  { href: "/members", label: "समुदाय सदस्य" },
  { href: "/jobs", label: "रोजगार पोर्टल" },
  { href: "/matrimony", label: "वैवाहिक" },
] as const;

export default function MemberPortalPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-2xl">
        <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">
          मेम्बर पोर्टल
        </h1>
        <p className="mb-8 font-body text-gray-600">
          सदस्य सेवाओं तक पहुँचने के लिए नीचे एक विकल्प चुनें।
        </p>
        <ul className="flex flex-col gap-3">
          {LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg border border-gray-200 bg-white px-5 py-4 font-body text-[15px] font-medium text-gray-900 shadow-sm transition-colors hover:border-[#F57C00] hover:text-[#F57C00]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
