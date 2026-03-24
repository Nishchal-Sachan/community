import { Container } from "@/components/ui/Container";
import { getUserFromCookie } from "@/lib/user-auth";
import { hasActiveMembership } from "@/lib/member-access";
import { JobsPortalRestricted } from "../_components/JobsPortalRestricted";
import { JobPostForm } from "./_components/JobPostForm";

export default async function JobPostPage() {
  const payload = await getUserFromCookie();
  const canAccess = await hasActiveMembership(payload);

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-2xl">
        {canAccess ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">नौकरी पोस्ट करें</h1>
            <p className="mb-8 font-body text-gray-600">
              ABKM समुदाय के साथ अवसर या अपना प्रोफाइल साझा करें।
            </p>
            <JobPostForm />
          </div>
        ) : (
          <JobsPortalRestricted />
        )}
      </Container>
    </main>
  );
}
