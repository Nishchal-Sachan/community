interface Props {
  images: string[];
}

export default function HomeImagesSection({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <section
      className="border-b border-gray-200 bg-gray-50 py-12"
      aria-labelledby="home-images-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="home-images-heading"
          className="mb-6 font-heading text-xl font-semibold text-gray-900"
        >
          चित्र
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="overflow-hidden border border-gray-300 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-video w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
