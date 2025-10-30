import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ReactNode } from "react";
import { toast } from "sonner";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, user, logout } = useAuthStore();
  const loc = useLocation();
  if (user?.expires_in && Date.now() >= user.expires_in) {
    //Logout if token expired
    logout(); // xóa auth store
    toast.success("You have been logged out");
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}
