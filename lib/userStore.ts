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

const USER_KEY = "legacy_user_profile";
const HISTORY_KEY = "legacy_debate_history";

// ── Local persistence (no server required) ────────────────────────────────

export function getLocalUserId(): string | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as UserProfile).id ?? null;
  } catch { return null; }
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(HISTORY_KEY);
}

export async function createProfile(name: string, role: UserRole): Promise<UserProfile> {
  const profile: UserProfile = {
    id: crypto.randomUUID(),
    name,
    role,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
  return profile;
}

export async function fetchProfile(id: string): Promise<UserProfile | null> {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as UserProfile;
    return profile.id === id ? profile : null;
  } catch { return null; }
}

export async function fetchHistory(_profileId: string): Promise<DebateRecord[]> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DebateRecord[];
  } catch { return []; }
}

export async function saveDebateSession(
  _profileId: string,
  record: Omit<DebateRecord, "id" | "date">
): Promise<void> {
  try {
    const existing = await fetchHistory("");
    const newRecord: DebateRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    const updated = [newRecord, ...existing].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch { /* non-blocking */ }
}
