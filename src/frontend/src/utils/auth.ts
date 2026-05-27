export interface AuthUser {
  role: "citizen" | "worker" | "admin";
  id: bigint;
  name: string;
  username: string;
  address?: string;
  skill?: string;
}

const STORAGE_KEY = "knot_user";
const TOKEN_KEY = "knot_jwt_token";

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      role: "citizen" | "worker" | "admin";
      id: string;
      name: string;
      username?: string;
      address?: string;
      skill?: string;
    };
    return {
      ...parsed,
      id: BigInt(parsed.id),
      username: parsed.username ?? parsed.name ?? "",
    };
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  const serializable = {
    ...user,
    id: user.id.toString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function clearAuthUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/** Store a JWT token in localStorage. */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Retrieve the stored JWT token (or null if not present). */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
