"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import slugify from "slugify";
import { transliterate } from "transliteration";

export type BlogFormInitial = {
  title: string;
  slug?: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  published: boolean;
};

function excerptFromContent(s: string): string {
  const plain = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.slice(0, 500);
}

function parseTagsInput(s: string): string[] {
  return s
    .split(/[,，\n]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 50);
}

type Props = {
  mode: "create" | "edit";
  blogId?: string;
  initial?: BlogFormInitial;
  submitUrl?: string;
  redirectUrl?: string;
  uploadUrl?: string;
};

export default function BlogForm({ mode, blogId, initial, submitUrl = "/api/admin/blogs", redirectUrl = "/admin/blogs", uploadUrl = "/api/admin/blogs/upload" }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tagsInput, setTagsInput] = useState(
    (initial?.tags ?? []).join(", "),
  );
  const [published, setPublished] = useState(initial?.published ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const slug = initial?.slug;

  const onCoverFile = useCallback(async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const j = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) throw new Error(j.error ?? "Upload failed");
      if (j.url) setCoverImage(j.url);
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const tags = parseTagsInput(tagsInput);
    const excerpt = excerptFromContent(content);
    const payload = {
      title: title.trim(),
      content: content.trim(),
      excerpt,
      coverImage: coverImage.trim(),
      category: category.trim(),
      tags,
      published,
    };

    if (!payload.title || !payload.content) {
      setMessage({ type: "err", text: "Title and content are required." });
      setSaving(false);
      return;
    }

    try {
      if (mode === "create") {
        const res = await fetch(submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const j = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? "Save failed");
        router.push(redirectUrl);
        router.refresh();
        return;
      }

      if (!blogId) throw new Error("Missing id");
      const res = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Save failed");
      setMessage({ type: "ok", text: "Saved." });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      {message ? (
        <p
          className={
            message.type === "ok"
              ? "text-sm text-green-800"
              : "text-sm text-red-700"
          }
        >
          {message.text}
        </p>
      ) : null}

      {mode === "edit" && slug ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL slug
          </label>
          <p className="mt-1 font-mono text-sm text-gray-600">{slug}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Public URL: /blog/{slug}
          </p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="blog-title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          id="blog-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm"
          required
          maxLength={300}
        />
        {mode === "create" && title && (
          <p className="mt-1 font-mono text-xs text-green-700">
            Preview URL: /blog/{slugify(transliterate(title), { replacement: "-", remove: /[^a-zA-Z0-9\s-]/g, lower: true, strict: true, trim: true }) || "post-..."}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="blog-category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <input
          id="blog-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm"
          maxLength={120}
        />
      </div>

      <div>
        <label
          htmlFor="blog-tags"
          className="block text-sm font-medium text-gray-700"
        >
          Tags
        </label>
        <input
          id="blog-tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="comma separated"
          className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700">
          Cover image
        </span>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt=""
              className="h-32 max-w-full rounded border border-gray-200 object-cover"
            />
          ) : null}
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(e) => void onCoverFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {uploading ? (
              <p className="mt-1 text-xs text-gray-500">Uploading…</p>
            ) : null}
          </div>
        </div>
        <label htmlFor="blog-cover-url" className="mt-3 block text-xs text-gray-500">
          Or paste image URL
        </label>
        <input
          id="blog-cover-url"
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://…"
          className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="blog-content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <p className="mt-0.5 text-xs text-gray-500">
          Plain text (paragraphs separated by a blank line) or HTML. HTML is
          sanitized on the public page.
        </p>
        <textarea
          id="blog-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="mt-1 w-full border border-gray-300 px-3 py-2 font-mono text-sm"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Published
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
        </button>
        <Link
          href={redirectUrl}
          className="inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
