import type { Profile } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_SYNC_API_URL ?? "https://ffxiv-tc-profile-api.z54981220.workers.dev";

export async function getProfile(id: string): Promise<Profile | null> {
  const res = await fetch(`${API_BASE}/profiles/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /profiles/${id} failed: ${res.status}`);
  return res.json();
}

export async function putProfile(profile: Profile): Promise<boolean> {
  const res = await fetch(`${API_BASE}/profiles/${profile.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return res.ok;
}

export async function deleteProfile(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/profiles/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}
