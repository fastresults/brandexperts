export type HeroBgList = { urls: string[]; expiresAt: number };

const KEY = "heroBgList";

export function loadCachedList(): HeroBgList | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HeroBgList;
    if (!parsed?.urls?.length || !parsed.expiresAt) return null;
    if (parsed.expiresAt <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCachedList(list: HeroBgList): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
}

export function warmImages(urls: string[]): void {
  if (typeof window === "undefined") return;
  for (const url of urls) {
    const img = new Image();
    img.src = url;
  }
}

export function pickRandom(urls: string[]): string | null {
  if (!urls.length) return null;
  return urls[Math.floor(Math.random() * urls.length)];
}
