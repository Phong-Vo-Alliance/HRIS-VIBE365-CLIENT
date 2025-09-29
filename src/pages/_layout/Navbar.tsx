import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  return (
    <header className="border-b">
      <div className="container mx-auto max-w-5xl p-4 flex items-center justify-between">
        <Link to="/" className="font-semibold">
          Starter
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm">Hi, {user.name}</span>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
