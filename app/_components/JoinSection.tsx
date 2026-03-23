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
              <h2 className="type-h2">Join Our Community</h2>
              <p className="type-body max-w-lg">
                Be part of something bigger. Add your name to our growing network of neighbors
                committed to making our community stronger.
              </p>
            </div>
            <JoinForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
