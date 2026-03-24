/**
 * States and Union Territories of India (English names) — for standardized storage.
 */
export const INDIA_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

const STATE_SET = new Set<string>(
  INDIA_STATES_AND_UTS.map((s) => s.toLowerCase())
);

export function isValidIndiaState(state: string): boolean {
  return STATE_SET.has(state.trim().toLowerCase());
}

export function normalizeIndiaState(state: string): string | null {
  const t = state.trim();
  if (!t) return null;
  const found = INDIA_STATES_AND_UTS.find((s) => s.toLowerCase() === t.toLowerCase());
  return found ?? null;
}
