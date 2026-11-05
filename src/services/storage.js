import { normalizeAccess } from "../domain/library";
export const KEY = "smartfitness.v1";
export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      ...normalizeAccess(raw),
      history: Array.isArray(raw.history) ? raw.history : [],
      settings: { overlay: true, speech: false, volume: 0.7, ...raw.settings },
    };
  } catch {
    return {
      ...normalizeAccess(),
      history: [],
      settings: { overlay: true, speech: false, volume: 0.7 },
    };
  }
}
export function persist(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
