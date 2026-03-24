import JoinForm from "./JoinForm";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/sections/Section";

export default function JoinSection() {
  return (
    <Section id="join-community" className="bg-gray-50">
      <Container>
        <div className="mx-auto max-w-xl">
          <div className="section-stack rounded-xl border border-gray-200 bg-white p-6 sm:p-8 md:p-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="type-h2">हमारे समुदाय से जुड़ें</h2>
              <p className="type-body max-w-lg">
                कुछ बड़े का हिस्सा बनें। अपने समुदाय को मजबूत बनाने के लिए प्रतिबद्ध अपने बढ़ते नेटवर्क में अपना नाम जोड़ें।
              </p>
            </div>
            <JoinForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
