import { LoginResponse } from "@/features/auth/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthState = {
  user: LoginResponse | null;
  token: string | null;
  hydrated: boolean;
  remember: boolean;
  setAuth: (
    t: string,
    user_name: string | undefined,
    user_id: string | undefined,
    res: LoginResponse | null,
    remember: boolean,
  ) => void;
  logout: () => void;
  markHydrated: () => void; // set hydrated = true
  refresh: () => Promise<string | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      remember: true,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      setAuth: (token, user_name, user_id, res, remember = true) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_name", user_name ?? "");
        localStorage.setItem("user_id", user_id ?? "");
        let user;
        if (res) {
          localStorage.setItem("auth_response", JSON.stringify(res));
          user = JSON.parse(localStorage.getItem("auth_response") || "null");
        } else {
          user = null;
        }
        // set({ token, user_name, user_id });
        set({ user, token, remember });
      },
      logout: () => {
        set({ user: null, token: null });
        // nếu bạn có lưu storage, có thể cleanup luôn:
        try {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_name");
          localStorage.removeItem("user_id");
          localStorage.removeItem("auth_response");
          localStorage.removeItem("auth");
          sessionStorage.removeItem("auth");
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn("Failed to clear auth storage", err);
          }
        }
      },
      refresh: async () => {
        const current = get().token;
        if (current) return current;
        try {
          const raw = sessionStorage.getItem("auth") ?? localStorage.getItem("auth");
          if (raw) {
            const saved = JSON.parse(raw);
            if (saved?.token && saved?.user) {
              set({ token: saved.token, user: saved.user, remember: !!saved.remember });
              return saved.token as string;
            }
          }
        } catch (err) {
          // ignore
          if (import.meta.env.DEV) {
            console.warn("Failed to parse auth storage", err);
          }
        }
        return null;
      },
    }),
    {
      name: "auth",
      // Tip: vẫn dùng localStorage cho persist; phần "remember" sẽ xử lý ở Bootstrap (mục 2)
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, token: s.token, remember: s.remember }),
      onRehydrateStorage: () => (state) => {
        // Được gọi sau khi state được load từ storage
        state?.markHydrated();
      },
    },
  ),
);

// type AuthState = {
//   token: string | null;
//   user: User | null;
//   setAuth: (t: string, u: User) => void;
//   logout: () => void;
//   refresh: () => Promise<boolean>;
// };

// export const useAuthStore = create<AuthState>((set) => ({
//   token: null,
//   user: null,
//   setAuth: (token, user) => set({ token, user }),
//   logout: () => set({ token: null, user: null }),
//   refresh: async () => {
//     try {
//       // TODO: call /auth/refresh to renew access token via cookie/session
//       return false;
//     } catch {
//       return false;
//     }
//   },
// }));
