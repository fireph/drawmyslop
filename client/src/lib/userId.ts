const COOKIE_KEY = "user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function getOrCreateUserId(): string {
  const existing = getCookie(COOKIE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  setCookie(COOKIE_KEY, id, COOKIE_MAX_AGE);
  return id;
}
