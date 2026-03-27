"use client";

import DOMPurify from "dompurify";

export default function SafeHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html || "");

  return (
    <div
      className="prose prose-neutral max-w-none"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
