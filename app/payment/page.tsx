import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PaymentButton } from "./_components/PaymentButton";

const JOIN_FORM_COOKIE = "join_form_data";

export default async function PaymentPage() {
  const cookieStore = await cookies();
  const formDataCookie = cookieStore.get(JOIN_FORM_COOKIE)?.value;

  if (!formDataCookie) {
    redirect("/join");
  }

  let formData: { fullName?: string; phone?: string; city?: string; state?: string; occupation?: string };
  try {
    formData = JSON.parse(formDataCookie) as typeof formData;
  } catch {
    redirect("/join");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <Container className="max-w-lg">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 font-heading text-2xl font-bold text-gray-900">
            Payment
          </h1>
          <p className="mb-8 font-body text-gray-600">
            Review your details and complete payment to finish membership.
          </p>

          <dl className="space-y-3 font-body">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="text-gray-900">{formData.fullName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-gray-900">{formData.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="text-gray-900">{formData.city ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">State</dt>
              <dd className="text-gray-900">{formData.state ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Occupation</dt>
              <dd className="text-gray-900">{formData.occupation ?? "—"}</dd>
            </div>
          </dl>

          <PaymentButton />
        </div>
      </Container>
    </main>
  );
}
