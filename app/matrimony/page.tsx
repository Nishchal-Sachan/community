import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MatrimonyListing } from "./_components/MatrimonyListing";

export default function MatrimonyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              Matrimony
            </h1>
            <p className="mt-1 font-body text-gray-600">
              Find your match within the ABKM community.
            </p>
          </div>
          <Link
            href="/matrimony/post"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F57C00] px-6 py-3 font-body font-medium text-white transition-colors hover:bg-[#E65100] focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-2"
          >
            Create Profile
          </Link>
        </div>
        <MatrimonyListing />
      </Container>
    </main>
  );
}
