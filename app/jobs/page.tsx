import { Container } from "@/components/ui/Container";
import { getUserFromCookie } from "@/lib/user-auth";
import { hasActiveMembership } from "@/lib/member-access";
import { JobsPortalRestricted } from "./_components/JobsPortalRestricted";
import { JobsPageContent } from "./_components/JobsPageContent";

export default async function JobsPage() {
  const payload = await getUserFromCookie();
  const canAccess = await hasActiveMembership(payload);

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-4xl">
        {canAccess ? <JobsPageContent /> : <JobsPortalRestricted />}
      </Container>
    </main>
  );
}
