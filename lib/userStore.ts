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

const USER_KEY = "legacy_user";
const HISTORY_KEY = "legacy_history";

export function getUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(profile: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(HISTORY_KEY);
}

export function getHistory(): DebateRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryRecord(record: Omit<DebateRecord, "id" | "date">): void {
  const history = getHistory();
  const newRecord: DebateRecord = {
    ...record,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([newRecord, ...history].slice(0, 50)));
}
