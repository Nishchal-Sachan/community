"use client";

import { useCallback, useEffect, useState } from "react";
import { MatrimonyPostForm } from "../post/_components/MatrimonyPostForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface MatrimonyProfile {
  id: string;
  createdBy: string;
  fullName: string;
  age: number;
  gender: string;
  profilePhotoUrl: string;
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  education: string;
  profession: string;
  income: string;
  location: string;
  about: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
}

const ABOUT_MAX_LENGTH = 120;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

export function MatrimonyListing() {
  const { user } = useCurrentUser();
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<MatrimonyProfile | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matrimony/list");
      const data = await res.json();
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
    fetchProfiles();
  }

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="rounded-[12px] border border-[#eeeeee] bg-white px-6 py-12 text-center font-body text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          Loading...
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-[12px] border border-[#eeeeee] bg-white px-6 py-12 text-center font-body text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          No profiles found.
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
          {profiles.map((profile) => (
            <article
              key={profile.id}
              className="rounded-[12px] border border-[#eeeeee] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden"
            >
              <div className="aspect-[4/3] w-full bg-gray-100">
                {profile.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-gray-400">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="mb-1 font-heading text-[18px] font-semibold text-gray-900">
                  {profile.fullName}, {profile.age}
                </h3>
                <p className="mb-2 font-body text-[14px] text-gray-500">
                  {profile.profession}
                  {profile.location ? ` · ${profile.location}` : ""}
                </p>
                <p className="mb-4 font-body text-[14px] leading-[1.7] text-[#555555]">
                  {truncate(profile.about, ABOUT_MAX_LENGTH)}
                </p>
                <div className="space-y-1.5 border-t border-gray-100 pt-4 font-body text-[14px] text-[#555555]">
                  <a
                    href={`tel:${profile.contactPhone.replace(/\s/g, "")}`}
                    className="block text-[#F57C00] hover:underline"
                  >
                    {profile.contactPhone}
                  </a>
                  <a
                    href={`mailto:${profile.contactEmail}`}
                    className="block text-[#F57C00] hover:underline"
                  >
                    {profile.contactEmail}
                  </a>
                </div>
                {user && profile.createdBy === user.id && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(profile)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 font-body text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-offset-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProfileId(profile.id)}
                      className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingProfile(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-gray-900">
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <MatrimonyPostForm
              profileId={editingProfile.id}
              initialData={{
                fullName: editingProfile.fullName,
                age: editingProfile.age,
                gender: editingProfile.gender as "male" | "female",
                profilePhotoUrl: editingProfile.profilePhotoUrl,
                height: editingProfile.height,
                maritalStatus: editingProfile.maritalStatus,
                religion: editingProfile.religion,
                caste: editingProfile.caste,
                education: editingProfile.education,
                profession: editingProfile.profession,
                income: editingProfile.income,
                location: editingProfile.location,
                about: editingProfile.about,
                contactName: editingProfile.contactName,
                contactPhone: editingProfile.contactPhone,
                contactEmail: editingProfile.contactEmail,
              }}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deletingProfileId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeletingProfileId(null)}
        >
          <div
            className="w-full max-w-sm rounded-[12px] border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 font-body text-gray-700">
              Are you sure you want to remove this profile?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProfileId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 font-body text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingProfileId)}
                disabled={deleteLoading}
                className="rounded-md bg-red-600 px-4 py-2 font-body text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
