import { Link, useNavigate } from "react-router-dom";
import logoUrl from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStatusStore } from "@/stores/status.store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, UserRound, KeyRound, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

function getAvatarUrl(u: unknown): string | undefined {
  if (typeof u === "object" && u !== null && "avatarUrl" in u) {
    const v = (u as Record<string, unknown>).avatarUrl;
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}

export default function Header() {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  const addLogoutEntry = useStatusStore((s) => s.addLogoutEntry);

  const onLogout = () => {
    addLogoutEntry(); // ghi lịch sử "Logout"
    logout(); // xóa auth store
    toast.success("You have been logged out");
    nav("/login", { replace: true }); // điều hướng về trang login
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.img
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            src={logoUrl}
            alt="Logo"
            className="h-10 w-auto"
          />
          <span className="font-semibold text-xl text-primary tracking-tight">
            Time Tracking Sytem
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-2 hover:bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getAvatarUrl(user)} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user.name ?? "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 data-[state=open]:animate-in data-[state=closed]:animate-out data-[side=bottom]:slide-in-from-top-2"
              >
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(user)} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(user.name ?? "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />

                <Dialog open={openProfile} onOpenChange={setOpenProfile}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer"
                    >
                      <UserRound className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update profile</DialogTitle>
                    </DialogHeader>
                    <ProfileForm onClose={() => setOpenProfile(false)} />
                  </DialogContent>
                </Dialog>

                <Dialog open={openPassword} onOpenChange={setOpenPassword}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer"
                    >
                      <KeyRound className="mr-2 h-4 w-4" /> Change password
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change password</DialogTitle>
                    </DialogHeader>
                    <ChangePasswordForm onClose={() => setOpenPassword(false)} />
                  </DialogContent>
                </Dialog>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button>Sign in</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function ProfileForm({ onClose }: { onClose: () => void }) {
  const { user, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // only update local store for now
        setAuth({ token: useAuthStore.getState().token!, user: { id: user!.id, name, email } });
        toast.success("Profile updated");
        onClose();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
}

// Change password form
function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (next !== confirm) {
          toast.error("New passwords do not match");
          return;
        }
        // call backend here later
        toast.success("Password changed");
        onClose();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="current">Current password</Label>
        <Input
          id="current"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="next">New password</Label>
        <Input
          id="next"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit">Update password</Button>
      </DialogFooter>
    </form>
  );
}
