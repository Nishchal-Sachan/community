import { Container } from "@/components/ui/Container";
import { MatrimonyPostForm } from "./_components/MatrimonyPostForm";

export default function MatrimonyPostPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">
            Create Matrimony Profile
          </h1>
          <p className="mb-8 font-body text-gray-600">
            Share your profile with the ABKM community to find your match.
          </p>
          <MatrimonyPostForm />
        </div>
      </Container>
    </main>
  );
}
