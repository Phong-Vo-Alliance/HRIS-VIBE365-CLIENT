import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { token } = useAuthStore();
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}
