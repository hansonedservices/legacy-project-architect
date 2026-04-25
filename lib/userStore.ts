export type UserRole = "student" | "teacher" | "administrator";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface DebateRecord {
  id: string;
  date: string;
  figureIcon: string;
  figureName: string;
  dilemma: string;
  mode: "solo" | "debate" | "dual";
  messageCount: number;
  grounded: boolean;
}

const USER_ID_KEY = "legacy_user_id";

// ── Local ID persistence ───────────────────────────────────────────────────

export function getLocalUserId(): string | null {
  try { return localStorage.getItem(USER_ID_KEY); } catch { return null; }
}

function setLocalUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_ID_KEY);
}

// ── Remote API calls ───────────────────────────────────────────────────────

export async function createProfile(name: string, role: UserRole): Promise<UserProfile> {
  const res = await fetch("/api/user/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role }),
  });
  if (!res.ok) throw new Error("Failed to create profile");
  const profile: UserProfile = await res.json();
  setLocalUserId(profile.id);
  return profile;
}

export async function fetchProfile(id: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/user/profile?id=${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function fetchHistory(profileId: string): Promise<DebateRecord[]> {
  try {
    const res = await fetch(`/api/user/history?profileId=${profileId}`);
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function saveDebateSession(
  profileId: string,
  record: Omit<DebateRecord, "id" | "date">
): Promise<void> {
  try {
    await fetch("/api/user/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...record }),
    });
  } catch { /* non-blocking */ }
}
