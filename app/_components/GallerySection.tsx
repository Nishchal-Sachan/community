interface Props {
  images: string[];
}

export default function GallerySection({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <section
      className="border-b border-gray-200 bg-white py-12"
      aria-labelledby="site-gallery-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="site-gallery-heading"
          className="mb-6 font-heading text-xl font-semibold text-gray-900"
        >
          गैलरी
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="aspect-square overflow-hidden border border-gray-300 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
