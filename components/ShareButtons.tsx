"use client";

import { useEffect, useState } from "react";
import { Share2, Facebook, Twitter, Linkedin, Copy, MessageCircle } from "lucide-react";

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="mt-10 border-t pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">इस पोस्ट को शेयर करें</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1ebd57] transition-colors text-white rounded-lg text-sm font-medium shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] transition-colors text-white rounded-lg text-sm font-medium shadow-sm"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </a>

        {/* Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 transition-colors text-white rounded-lg text-sm font-medium shadow-sm"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#0958a8] transition-colors text-white rounded-lg text-sm font-medium shadow-sm"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </a>

        {/* Copy Link */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            alert("Link copied!");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 transition-colors text-white rounded-lg text-sm font-medium shadow-sm"
        >
          <Copy className="w-4 h-4" />
          Copy Link
        </button>
      </div>
    </div>
  );
}
