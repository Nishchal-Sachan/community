import Image from "next/image";

export default function OurGoalSection() {
  return (
    <section
      id="our-goal"
      className="bg-white py-20 px-6 lg:px-16"
      aria-labelledby="our-goal-title"
    >
      <div className="mx-auto grid max-w-300 grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left: Image */}
        <div className="relative h-100 overflow-hidden rounded-2xl lg:h-125">
          <Image
            src="/images/leaders/rakesh-mahto.jpeg"
            alt="हमारा लक्ष्य"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-black/20" aria-hidden />
        </div>

        {/* Right: Card content */}
        <div
          className="rounded-2xl bg-white p-8 shadow-lg lg:p-10"
          id="our-goal-card"
        >
          <h2
            id="our-goal-title"
            className="mb-4 font-heading text-2xl font-bold lg:text-3xl"
          >
            🎯 हमारा लक्ष्य
          </h2>

          <p className="mb-4 font-body leading-relaxed text-gray-600">
            अखिल भारतीय कुशवाहा महासभा का उद्देश्य समाज को शिक्षा, स्वास्थ्य और सम्मान के मार्ग पर अग्रसर करते हुए एक सशक्त, जागरूक और आत्मनिर्भर समुदाय का निर्माण करना है।
          </p>

          <p className="mb-6 font-body leading-relaxed text-gray-600">
            हमारा लक्ष्य है कि समाज का प्रत्येक व्यक्ति गुणवत्तापूर्ण शिक्षा प्राप्त करे, स्वस्थ जीवनशैली अपनाए और उसे हर स्तर पर उचित सम्मान मिले।
          </p>

          <ul className="mb-6 space-y-2 font-body text-gray-700">
            <li>✔️ युवाओं को रोजगार और अवसर</li>
            <li>✔️ महिलाओं का सशक्तिकरण</li>
            <li>✔️ सामाजिक एकता और विकास</li>
          </ul>

          <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 font-body font-medium text-gray-800">
            👉 &quot;शिक्षा, स्वास्थ्य और सम्मान — कुशवाहा समाज की यही पहचान&quot;
          </div>
        </div>
      </div>
    </section>
  );
}
