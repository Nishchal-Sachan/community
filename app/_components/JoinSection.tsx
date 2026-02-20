import JoinForm from "./JoinForm";

export default function JoinSection() {
  return (
    <section id="join-community" className="overflow-hidden bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-6">
        <div className="mx-auto min-w-0 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Join Our Community
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-slate-600 sm:text-lg">
              Be part of something bigger. Add your name to our growing network of neighbors
              committed to making our community stronger.
            </p>
          </div>
          <div className="mt-8">
            <JoinForm />
          </div>
        </div>
      </div>
    </section>
  );
}
