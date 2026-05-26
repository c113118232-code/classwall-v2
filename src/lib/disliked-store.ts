// 反對紀錄：跨 tab/重開仍生效，與 DB 端 question_dislikes 去重對齊
const KEY = "classwall:disliked";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage 不可用時靜默
  }
}

export function hasDisliked(id: string): boolean {
  return read().has(id);
}

export function addDisliked(id: string): void {
  const set = read();
  set.add(id);
  write(set);
}
