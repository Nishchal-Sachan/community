"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MatrimonyPostForm, type MatrimonyFormData } from "../post/_components/MatrimonyPostForm";
import { MarriageSubscribeButton } from "./MarriageSubscribeButton";

interface ListProfile {
  id: string;
  fullName: string;
  profession: string;
  profilePhotoUrl: string;
  isOwner: boolean;
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
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm"
            >
              <div className="flex h-28 shrink-0 bg-gray-100">
                {profile.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profilePhotoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-heading text-2xl text-gray-400">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <h3 className="font-heading text-base font-semibold leading-snug text-gray-900 line-clamp-2">
                  {profile.fullName}
                </h3>
                <p className="font-body text-sm text-gray-600 line-clamp-2">{profile.profession}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Link
                    href={`/matrimony/profile/${profile.id}`}
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded border border-gray-400 bg-white px-3 py-2 text-center font-body text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    विवरण देखें
                  </Link>
                  {marriageSubscriptionActive && profile.isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(profile)}
                        className="rounded border border-gray-300 px-3 py-2 font-body text-sm text-gray-700 hover:bg-gray-50"
                      >
                        संपादित करें
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProfileId(profile.id)}
                        className="rounded border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-800 hover:bg-red-100"
                      >
                        हटाएं
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
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
