import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";

// function readAuthFromStorages() {
//   // Ưu tiên sessionStorage (phiên hiện tại), fallback localStorage
//   const ss = sessionStorage.getItem("auth");
//   if (ss) return JSON.parse(ss);
//   const ls = localStorage.getItem("auth");
//   if (ls) return JSON.parse(ls);
//   return null;
// }

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const markHydrated = useAuthStore((s) => s.markHydrated);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    try {
      // const saved = readAuthFromStorages();
      // if (saved?.user && saved?.token) {
      //   setAuth({ user: saved.user, token: saved.token, remember: saved.remember ?? true });
      // }
    } catch (err) {
      // ignore
      if (import.meta.env.DEV) {
        console.warn("Failed to parse auth storage", err);
      }
    }
    markHydrated(); // báo cho Guard biết đã xong
    setBootstrapped(true);
  }, [setAuth, markHydrated]);

  if (!bootstrapped) {
    // Có thể render skeleton nhẹ để tránh cảm giác giật trang
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }
  return <>{children}</>;
}
