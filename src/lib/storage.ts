// Minimal safe storage helpers if needed later.
export const storage = {
  get: (k: string) => window.localStorage.getItem(k),
  set: (k: string, v: string) => window.localStorage.setItem(k, v),
  remove: (k: string) => window.localStorage.removeItem(k),
};
