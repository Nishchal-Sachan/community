import { FormPageShell } from "@/components/layout/FormPageShell";
import { Container } from "@/components/ui/Container";
import { getUserFromCookie } from "@/lib/user-auth";
import { hasActiveMembership } from "@/lib/member-access";
import { JobsPortalRestricted } from "../_components/JobsPortalRestricted";
import { JobDetailContent } from "./JobDetailContent";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payload = await getUserFromCookie();
  const canAccess = await hasActiveMembership(payload);

  return (
    <main>
      <FormPageShell>
        <Container className="max-w-3xl">
          {canAccess ? <JobDetailContent jobId={id} /> : <JobsPortalRestricted />}
        </Container>
      </FormPageShell>
    </main>
  );
}
