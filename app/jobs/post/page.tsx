import FormBackButton from "@/components/layout/FormBackButton";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { Container } from "@/components/ui/Container";
import { getUserFromCookie } from "@/lib/user-auth";
import { hasActiveMembership } from "@/lib/member-access";
import { JobsPortalRestricted } from "../_components/JobsPortalRestricted";
import { JobPostForm } from "./_components/JobPostForm";

export default async function JobPostPage() {
  const payload = await getUserFromCookie();
  const canAccess = await hasActiveMembership(payload);

  return (
    <main>
      <FormPageShell>
        <Container className="max-w-3xl">
          {canAccess ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <FormBackButton />
              <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">Job portal</h1>
              <p className="mb-6 font-body text-gray-600">
                Post a job opening (employer) or build a job seeker candidate profile — pick the flow that matches you.
              </p>
              <JobPostForm />
            </div>
          ) : (
            <JobsPortalRestricted />
          )}
        </Container>
      </FormPageShell>
    </main>
  );
}
