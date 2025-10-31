import { Link, useNavigate, useLocation } from "react-router-dom";
import logoUrl from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth.store";
import { motion } from "framer-motion";
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
import {
  LogOut,
  UserRound,
  KeyRound,
  ChevronDown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Camera,
  User,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { SingleItemResponseModel, UserProfile, Avatars_File } from "@/type/all_types";
import { LoginResponse } from "@/features/auth/types";
// function getAvatarUrl(u: unknown): string | undefined {
//   if (typeof u === "object" && u !== null && "avatarUrl" in u) {
//     const v = (u as Record<string, unknown>).avatarUrl;
//     return typeof v === "string" ? v : undefined;
//   }
//   return undefined;
// }

let user: LoginResponse;

export default function Header() {
  const { logout } = useAuthStore();
  user = JSON.parse(localStorage.getItem("auth_response") ?? "");
  const nav = useNavigate();
  const loc = useLocation();
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  const isActive = (path: string) => loc.pathname.startsWith(path);

  const onLogout = () => {
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
            Client Business Portal
          </span>
        </Link>

        <nav className="flex items-center gap-16">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden sm:flex items-center gap-6"
          >
            <Link
              to="/app/dashboard"
              className={`nav-link ${isActive("/app/dashboard") ? "text-primary" : ""}`}
            >
              Dashboard
            </Link>
            <Link
              to="/app/report"
              className={`nav-link ${isActive("/app/report") ? "text-primary" : ""}`}
            >
              Reports
            </Link>
          </motion.div>

          {user && (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto px-2 hover:bg-primary/5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url ?? ""} alt={user?.avatar_url ?? ""} />
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
                        <span className="text-xs text-muted-foreground">{user.user_name}</span>
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
                      <AvatarImage src={user?.avatar_url ?? ""} alt={user?.avatar_url ?? ""} />
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
                      <span className="text-xs text-muted-foreground">{user.user_name ?? ""}</span>
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
                    <DialogContent className="sm:max-w-[860px] w-[92vw]">
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
                      <DialogHeader className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <DialogTitle className="text-xl font-semibold tracking-tight">
                          Change Password
                        </DialogTitle>
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
          )}
        </nav>
      </div>
    </header>
  );
}

function ProfileForm({ onClose }: { onClose: () => void }) {
  const [firstNameErr, setfirstNameErr] = useState("");
  const [lastNameErr, setlastNameErr] = useState("");
  const [phoneNumberErr, setphoneNumberErr] = useState("");

  // tách tên hiện có -> first/last (best-effort)
  const [firstName, setFirstName] = useState(() => {
    const parts = (user?.name || "").split(" ");
    return parts[0];
  });
  const [lastName, setLastName] = useState(() => {
    const parts = (user?.name || "").split(" ");
    return parts[1];
  });
  const email = user?.user_name || "";
  const [mobile, setMobile] = useState(() => {
    return user?.user_mobile;
  });

  // avatar preview (ưu tiên localStorage để thấy ngay sau khi upload)
  // const [avatarPreview, setAvatarPreview] = useState<string | null>(
  //   typeof window !== "undefined" ? localStorage.getItem("avatarUrl") : null,
  // );
  const fileInputId = "profile-avatar-file";

  const onPickAvatar = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    document.getElementById("avatar_preview")?.setAttribute("src", url.toString());
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //
    // Upload avatar if a file is selected
    setfirstNameErr("");
    setlastNameErr("");
    setphoneNumberErr("");
    if (!firstName) {
      setfirstNameErr(
        import.meta.env.PROFILE_NAME_FIRST_NAME_REQUIRED ?? "First name is required.",
      );
      return;
    }
    if (firstName.length > 100) {
      setfirstNameErr(
        import.meta.env.PROFILE_NAME_FIRST_NAME_LENGTH ??
          "First name must not exceed 100 characters.",
      );
      return;
    }
    if (lastName.length > 100) {
      setlastNameErr(
        import.meta.env.PROFILE_NAME_LAST_NAME_LENGTH ??
          "Last name must not exceed 100 characters.",
      );
      return;
    }
    if ((mobile ?? []).length > 0 /*&& !/[+]?[(]?[0-9]{1,4}[)]?[-\s.1/0-9]*$/.test(mobile)*/) {
      setphoneNumberErr(
        import.meta.env.PROFILE_MOBILE_INVALID_FORMAT ??
          "Mobile number format is invalid. Allowed characters: digits, +, -, space, dot. Example: +61 412 345 678.",
      );
      return;
    }

    api
      .post<SingleItemResponseModel<UserProfile>>("/api/v1/Account/UpdateFields", {
        Id: user?.user_id,
        Values: [
          { FieldName: "LastName", NewValue: lastName },
          { FieldName: "FirstName", NewValue: firstName },
          { FieldName: "PhoneNumber", NewValue: mobile },
          { FieldName: "DisplayName", NewValue: firstName + " " + lastName },
        ],
      })
      .then((res) => {
        const fileInput = document.getElementById(fileInputId) as HTMLInputElement | null;
        const file = fileInput?.files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          api
            .postFormFormData<SingleItemResponseModel<Avatars_File>>(
              "/api/v1/Upload/User/MyAvatar",
              formData,
            )
            .then((res) => {
              if (res.StatusCode == 1 || res.StatusCode == 200) {
                const _user = JSON.parse(localStorage.getItem("auth_response") ?? "");
                _user.avatar_url = res.Data.Avatar;
                _user.name = firstName + " " + lastName;
                _user.user_mobile = mobile;
                user = _user;
                localStorage.setItem("auth_response", JSON.stringify(_user));
                // setAuth(token ?? "", displayName || user?.name || "", email || "", user);
                toast.success("Profile updated");
                onClose();
              } else {
                toast.error(res.Msg || "Failed to upload avatar");
              }
            })
            .catch(() => {
              toast.error("Error uploading avatar");
            });
        } else {
          if (res.StatusCode == 1 || res.StatusCode == 200) {
            const _user = JSON.parse(localStorage.getItem("auth_response") ?? "");
            _user.name = firstName + " " + lastName;
            _user.user_mobile = mobile;
            localStorage.setItem("auth_response", JSON.stringify(_user));
            user = _user;
            // setAuth(token ?? "", displayName || user?.name || "", email || "", user);
            toast.success("Profile updated");
            onClose();
          } else {
            toast.error(res.Msg);
          }
        }
      })
      .catch((e) => {
        toast.error(e);
      });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* GRID: Avatar trái (260px) | Panel phải (form + divider) */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-6">
        {/* LEFT: avatar tròn + nút máy ảnh đè góc */}
        <div className="h-full flex items-center justify-center">
          <div className="relative w-28 h-28">
            <Avatar className="h-28 w-28 ring-2 ring-white shadow">
              <AvatarImage
                id="avatar_preview"
                src={user?.avatar_url ?? ""}
                alt={user?.name || email || "avatar"}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {(user?.name || email || "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* camera overlay */}
            <button
              type="button"
              onClick={() =>
                (document.getElementById(fileInputId) as HTMLInputElement | null)?.click()
              }
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full ring-2 ring-white border dark:border-slate-700 bg-white text-slate-700 shadow hover:bg-slate-50"
              aria-label="Change avatar"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              id={fileInputId}
              type="file"
              accept="image/jpg,image/png,image/jpeg"
              className="hidden"
              onChange={(e) => onPickAvatar(e.target.files?.[0])}
            />
          </div>
        </div>

        {/* RIGHT: form + divider full-height bằng border-l */}
        <div className="md:pl-10 md:border-l md:border-slate-200 dark:md:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {/* First name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
              </div>
              {firstNameErr && <p className="text-sm text-red-600">{firstNameErr}</p>}
            </div>

            {/* Last name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              {lastNameErr && <p className="text-sm text-red-600">{lastNameErr}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  value={user?.user_name || email}
                  readOnly
                  className="pl-10 h-11 rounded-xl bg-gray-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 cursor-not-allowed"
                  title="Email cannot be changed"
                  disabled
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+()\\-\\s]{7,}"
                  value={mobile || ""}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+84 912 345 678"
                  className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              {phoneNumberErr && <p className="text-sm text-red-600">{phoneNumberErr}</p>}
              <p className="text-xs text-muted-foreground">Format: digits, +, (, ), space or -</p>
            </div>
          </div>
        </div>
      </div>
      {/* Actions: nhỏ, về bên phải; mobile thì full-width */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="h-10 sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="h-10 px-5 sm:w-auto w-full">
          Save changes
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCur, setShowCur] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [curErr, setCurErr] = useState("");
  const [nextErr, setNextErr] = useState("");
  const [confirmErr, setConfirmErr] = useState("");

  const validatePolicy = (pwd: string): string | null => {
    if (pwd.length < 8)
      return (
        import.meta.env.CHANGE_PASSWORD_NEW_PASSWORD_MINIMUM_8_CHARACTERS ??
        "Password must be at least 8 characters long."
      );
    if (!/[A-Z]/.test(pwd))
      return (
        import.meta.env.CHANGE_PASSWORD_NEW_PASSWORD_MISSING_UPPERCASE_LETTER ??
        "New password must include at least one uppercase letter (A–Z)."
      );
    if (!/[a-z]/.test(pwd))
      return (
        import.meta.env.CHANGE_PASSWORD_NEW_PASSWORD_MISSING_LOWERCASE_LETTER ??
        "New password must include at least one lowercase letter (a–z)."
      );
    if (!/[0-9]/.test(pwd))
      return (
        import.meta.env.CHANGE_PASSWORD_NEW_PASSWORD_MISSING_NUMBER ??
        "New password must include at least one number (0–9)."
      );
    if (!/[^\w\s]/.test(pwd))
      return (
        import.meta.env.CHANGE_PASSWORD_NEW_PASSWORD_MISSING_SPECIAL_CHARACTER ??
        "Password must contain at least 1 special character."
      );
    return null;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setCurErr("");
        setNextErr("");
        setConfirmErr("");

        if (!current) {
          setCurErr(
            import.meta.env.CHANGE_PASSWORD_CURRENT_PASSWORD_REQUIRED ??
              "Current password is required.",
          );
          return;
        }
        if (!next) {
          setNextErr(
            import.meta.env.CHANGE_PASSWORD_NEW_PASSWORD_REQUIRED ?? "New password is required.",
          );
          return;
        }
        if (!confirm) {
          setConfirmErr(
            import.meta.env.CHANGE_PASSWORD_CONFIRM_NEW_PASSWORD_REQUIRED ??
              "Please confirm your new password.",
          );
          return;
        }
        if (next !== confirm) {
          setConfirmErr(
            import.meta.env.CHANGE_PASSWORD_CONFIRM_NEW_PASSWORD_NOT_MATCHING_NEW_PASSWORD ??
              "Confirm password does not match the new password.",
          );
          return;
        }
        if (current === next) {
          setNextErr(
            import.meta.env.CHANGE_PASSWORD_NEW_PASSWORD_SAME_AS_CURRENT ??
              "New password must be different from the current password.",
          );
          return;
        }
        const p = validatePolicy(next);
        if (p) {
          setNextErr(p);
          return;
        }
        // TODO: call backend change password API here
        api
          .post<SingleItemResponseModel<string>>("/api/v1/Account/ChangePassword", {
            Password: current,
            NewPassword: next,
            ConfirmPassword: confirm,
          })
          .then((r) => {
            if (r.StatusCode == 200 || r.StatusCode == 1) {
              toast.success(r.Msg ? r.Msg : "Change Password Success");
              onClose();
            } else {
              toast.error(r.Msg);
            }
          });
      }}
      className="space-y-4"
      noValidate
    >
      {/* Current password */}
      <div className="space-y-2">
        <Label htmlFor="current">Current password</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <Input
            id="current"
            type={showCur ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowCur((s) => !s)}
            className="absolute right-0 inset-y-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
            aria-label={showCur ? "Hide password" : "Show password"}
          >
            {showCur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {curErr && <p className="text-sm text-red-600">{curErr}</p>}
      </div>

      {/* New password */}
      <div className="space-y-2">
        <Label htmlFor="next">New password</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <Input
            id="next"
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowNext((s) => !s)}
            className="absolute right-0 inset-y-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
            aria-label={showNext ? "Hide password" : "Show password"}
          >
            {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {nextErr && <p className="text-sm text-red-600">{nextErr}</p>}
        <p className="text-xs text-muted-foreground">
          Minimum 8 characters, include uppercase, lowercase, number, and special character.
        </p>
      </div>

      {/* Confirm new password */}
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <Input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            className="absolute right-0 inset-y-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmErr && <p className="text-sm text-red-600">{confirmErr}</p>}
      </div>

      <DialogFooter>
        <div className="mt-2 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="h-10 sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" className="h-10 px-5 sm:w-auto w-full">
            Update password
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
