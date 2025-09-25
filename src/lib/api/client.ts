import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth.store";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, logout, refresh } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await refresh();
    if (refreshed) {
      return http<T>(path, init);
    }
    logout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => http<T>(path),
  post: <T>(path: string, body?: unknown) =>
    http<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    http<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    http<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => http<T>(path, { method: "DELETE" }),
};
