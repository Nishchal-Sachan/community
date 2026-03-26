/** Minimal user shape for ownership checks (matches `/api/auth/me` + common variants). */
export type JobOwnerUserLike = {
  id?: string;
  _id?: string;
};

/** Normalize `createdBy` from API/DB (string id, ObjectId, or `{ _id }`). */
export function normalizeJobCreatorId(createdBy: unknown): string {
  if (createdBy == null) return "";
  if (typeof createdBy === "string") return createdBy;
  if (typeof createdBy === "object" && createdBy !== null && "_id" in createdBy) {
    const id = (createdBy as { _id?: unknown })._id;
    return id != null ? String(id) : "";
  }
  if (
    typeof createdBy === "object" &&
    createdBy !== null &&
    typeof (createdBy as { toString?: () => string }).toString === "function"
  ) {
    return String((createdBy as { toString(): string }).toString());
  }
  return String(createdBy);
}

export function isJobOwner(
  user: JobOwnerUserLike | null | undefined,
  job: { createdBy?: unknown }
): boolean {
  const userId = user?.id ?? user?._id;
  if (!userId) return false;
  const creatorId = normalizeJobCreatorId(job.createdBy);
  return creatorId !== "" && creatorId === userId;
}
