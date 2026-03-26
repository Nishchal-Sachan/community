"use client";

import FormBackButton from "@/components/layout/FormBackButton";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { MatrimonyPostForm, type MatrimonyFormData } from "../post/_components/MatrimonyPostForm";
import { MarriageSubscribeButton } from "./MarriageSubscribeButton";

interface ListProfile {
  id: string;
  fullName: string;
  profession: string;
  profilePhotoUrl: string;
  isOwner: boolean;
  age?: number;
  location?: string;
}

interface FullProfileResponse {
  restricted: boolean;
  profile: Record<string, unknown>;
}

function toFormDataFromApi(p: Record<string, unknown>): MatrimonyFormData {
  const gallery =
    Array.isArray(p.galleryUrls) && p.galleryUrls.length > 0
      ? (p.galleryUrls as string[]).filter(Boolean).slice(0, 4)
      : typeof p.profilePhotoUrl === "string" && p.profilePhotoUrl
        ? [p.profilePhotoUrl]
        : [];

  return {
    fullName: String(p.fullName ?? ""),
    age: typeof p.age === "number" ? p.age : parseInt(String(p.age ?? ""), 10) || 18,
    gender: p.gender === "female" ? "female" : "male",
    galleryUrls: gallery,
    height: String(p.height ?? ""),
    maritalStatus: String(p.maritalStatus ?? ""),
    religion: String(p.religion ?? ""),
    caste: String(p.caste ?? ""),
    education: String(p.education ?? ""),
    profession: String(p.profession ?? ""),
    income: String(p.income ?? ""),
    location: String(p.location ?? ""),
    about: String(p.about ?? ""),
    contactName: String(p.contactName ?? ""),
    contactPhone: String(p.contactPhone ?? ""),
    contactEmail: String(p.contactEmail ?? ""),
  };
}

export function MatrimonyListing({
  marriageSubscriptionActive,
}: {
  marriageSubscriptionActive: boolean;
}) {
  const [profiles, setProfiles] = useState<ListProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersOnly, setMembersOnly] = useState(false);
  const [editingProfile, setEditingProfile] = useState<MatrimonyFormData | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setMembersOnly(false);
    try {
      const res = await fetch("/api/matrimony/list", { credentials: "include" });
      const data = await res.json();
      if (res.status === 403 && data.code === "MEMBERS_ONLY") {
        setMembersOnly(true);
        setProfiles([]);
        return;
      }
      setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
    } catch {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  async function openEdit(listItem: ListProfile) {
    if (!marriageSubscriptionActive || !listItem.isOwner) return;
    try {
      const res = await fetch(`/api/matrimony/profile/${listItem.id}`, {
        credentials: "include",
      });
      const data = (await res.json()) as FullProfileResponse;
      if (!res.ok || data.restricted || !data.profile) return;
      setEditingProfileId(listItem.id);
      setEditingProfile(toFormDataFromApi(data.profile));
    } catch {
      /* ignore */
    }
  }

  async function handleDelete(profileId: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/matrimony/delete/${profileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDeletingProfileId(null);
        fetchProfiles();
      }
    } catch {
      setDeletingProfileId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleEditSuccess() {
    setEditingProfile(null);
    setEditingProfileId(null);
    fetchProfiles();
  }

  if (membersOnly) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white px-6 py-12 text-center font-body text-gray-800 shadow-sm">
        <p className="text-lg">यह सुविधा केवल सदस्यों के लिए उपलब्ध है</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!marriageSubscriptionActive && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
          <p className="font-medium">पूर्ण प्रोफ़ाइल देखने के लिए विवाह सदस्यता आवश्यक है</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-300 bg-white px-6 py-12 text-center font-body text-gray-500 shadow-sm">
          लोड हो रहा है...
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-lg border border-gray-300 bg-white px-6 py-12 text-center font-body text-gray-500 shadow-sm">
          कोई प्रोफाइल नहीं मिली।
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {profiles.map((profile) => {
            const prof = profile.profession?.trim();
            const showExtra = marriageSubscriptionActive;
            const loc = showExtra ? profile.location?.trim() : "";
            const showAge =
              showExtra &&
              profile.age !== undefined &&
              Number.isFinite(profile.age);
            return (
            <li
              key={profile.id}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
            >
              {/* Image section — fixed frame, premium crop */}
              <div className="flex shrink-0 justify-center border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-gray-50 py-5">
                <div className="relative h-[300px] w-[250px] shrink-0 overflow-hidden rounded-[12px] border border-gray-200/90 bg-gray-100 shadow-md ring-1 ring-gray-900/[0.06]">
                  {profile.profilePhotoUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.profilePhotoUrl}
                        alt=""
                        className="h-full w-full object-cover object-[center_20%]"
                      />
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 to-transparent"
                        aria-hidden
                      />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-heading text-4xl text-gray-400">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                {/* Info section */}
                <div className="flex-1 px-5 py-4 text-left">
                  <h3 className="font-heading text-lg font-bold leading-snug tracking-tight text-gray-900 line-clamp-2">
                    {profile.fullName}
                  </h3>
                  {(prof || showAge || loc) && (
                    <div className="mt-2.5 space-y-1.5">
                      {prof ? (
                        <p className="flex items-start gap-2 font-body text-sm leading-snug text-gray-700">
                          <Briefcase
                            className="mt-0.5 size-3.5 shrink-0 text-[#F57C00]/80"
                            strokeWidth={2}
                            aria-hidden
                          />
                          <span className="min-w-0 line-clamp-2">{prof}</span>
                        </p>
                      ) : null}
                      {showAge ? (
                        <p className="font-body text-sm leading-snug text-gray-600">
                          {profile.age} वर्ष
                        </p>
                      ) : null}
                      {loc ? (
                        <p className="font-body text-sm leading-snug text-gray-600 line-clamp-2">
                          {loc}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Action section */}
                <div className="shrink-0 border-t border-gray-200/90 bg-gray-50/40 px-5 pb-5 pt-4">
                  <Link
                    href={`/matrimony/profile/${profile.id}`}
                    prefetch={marriageSubscriptionActive}
                    className="inline-flex w-full min-h-[42px] items-center justify-center rounded-lg bg-[#F57C00] px-5 py-2 text-center font-body text-sm font-semibold text-white shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-[#E65100] hover:text-white hover:shadow-md active:bg-[#D84315] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
                  >
                    विवरण देखें
                  </Link>
                  {marriageSubscriptionActive && profile.isOwner && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(profile)}
                        className="h-9 flex-1 rounded-lg border border-gray-300 bg-white px-3 font-body text-xs font-medium text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50"
                      >
                        संपादित करें
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProfileId(profile.id)}
                        className="h-9 flex-1 rounded-lg border border-red-200 bg-white px-3 font-body text-xs font-medium text-red-800 transition-colors hover:bg-red-50"
                      >
                        हटाएं
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}

      {!marriageSubscriptionActive && (
        <div className="rounded-lg border border-gray-300 bg-white p-6 text-center shadow-sm">
          <p className="mb-4 font-body text-sm text-gray-800">
            विवाह प्रोफ़ाइल की पूरी जानकारी देखने के लिए सदस्यता लें
          </p>
          <MarriageSubscribeButton />
        </div>
      )}

      {editingProfile && editingProfileId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setEditingProfile(null);
            setEditingProfileId(null);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FormBackButton />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-gray-900">
                प्रोफाइल संपादित करें
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(null);
                  setEditingProfileId(null);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="बंद करें"
              >
                ×
              </button>
            </div>
            <MatrimonyPostForm
              key={editingProfileId}
              profileId={editingProfileId}
              initialData={editingProfile}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}

      {deletingProfileId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeletingProfileId(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 font-body text-gray-700">
              क्या आप वाकई इस प्रोफाइल को हटाना चाहते हैं?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProfileId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 font-body text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingProfileId)}
                disabled={deleteLoading}
                className="rounded-md bg-red-600 px-4 py-2 font-body text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleteLoading ? "हटाया जा रहा है..." : "हटाएं"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
