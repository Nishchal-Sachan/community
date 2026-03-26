import { FormPageShell } from "@/components/layout/FormPageShell";
import { HelpdeskForm } from "./_components/HelpdeskForm";

export const metadata = {
  title: "सहायता अनुरोध | ABKM",
  description: "समुदाय से संपर्क करें — सहायता अनुरोध फॉर्म",
};

export default function HelpdeskPage() {
  return (
    <main>
      <FormPageShell>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white shadow-md rounded-2xl p-6 space-y-5">
            <h2 className="text-2xl font-semibold text-gray-900">सहायता अनुरोध</h2>
            <p className="font-body text-sm text-gray-600">
              नीचे फॉर्म भरें। हमारी टीम जल्द संपर्क करेगी।
            </p>
            <HelpdeskForm />
          </div>
        </div>
      </FormPageShell>
    </main>
  );
}
