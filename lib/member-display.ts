/** Safe substring for MongoDB $regex */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function deriveCityStateFromArea(area: string | undefined): { city: string; state: string } {
  const a = (area ?? "").trim();
  if (!a) return { city: "—", state: "—" };
  const i = a.indexOf(",");
  if (i === -1) return { city: a, state: "—" };
  return {
    city: a.slice(0, i).trim() || "—",
    state: a.slice(i + 1).trim() || "—",
  };
}

export function displayFullName(m: { fullName?: string; name: string }): string {
  const fn = (m.fullName ?? "").trim();
  return fn || m.name;
}
