import { Container } from "@/components/ui/Container";
import { JoinMembershipForm } from "./_components/JoinMembershipForm";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-lg">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">
            Join Membership
          </h1>
          <p className="mb-8 font-body text-gray-600">
            Complete the form below to proceed to payment and become an ABKM member.
          </p>
          <JoinMembershipForm />
        </div>
      </Container>
    </main>
  );
}
