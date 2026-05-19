// 一個瀏覽器設定檔一個 UUID，存 localStorage 跨 tab/重開仍有效
// 隱私模式 / 清快取會重新產生；對教學情境可接受
const KEY = "classwall:anon-id";

export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    // 隱私模式 storage 不可用：回傳一次性 id
    return crypto.randomUUID();
  }
}
