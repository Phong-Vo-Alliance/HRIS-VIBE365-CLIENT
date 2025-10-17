import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordFirstLogin } from "@/features/auth/api";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// shadcn-ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import logoUrl from "@/assets/logo.png";
import loginBg from "@/assets/login-bg.jpg";
// import { useAuthStore } from "@/stores/auth.store";
function validatePasswordPolicy(pwd: string, email?: string): string | null {
  if (pwd.length < 8)
    return (
      import.meta.env.FIRST_TIME_LOGIN_NEW_PASSWORD_TOO_SHORT_8 ??
      "New password must be at least 8 characters long."
    );
  if (!/[A-Z]/.test(pwd))
    return (
      import.meta.env.FIRST_TIME_LOGIN_MISSING_UPPERCASE_LETTER ??
      "New password must include at least one uppercase letter (A–Z)."
    );
  if (!/[a-z]/.test(pwd))
    return (
      import.meta.env.FIRST_TIME_LOGIN_MISSING_LOWERRCASE_LETTER ??
      "New password must include at least one lowercase letter (a–z)."
    );
  if (!/[0-9]/.test(pwd))
    return (
      import.meta.env.FIRST_TIME_LOGIN_MISSING_NUMBER ??
      "New password must include at least one number (0–9)."
    );
  if (!/[^\w\s]/.test(pwd))
    return (
      import.meta.env.FIRST_TIME_LOGIN_MISSING_SPECIAL_CHARACTER ??
      "New password must include at least one special character !@#$%^&*(),.?':{}"
    );
  if (email) {
    const local = email.split("@")[0];
    if (local && pwd.toLowerCase().includes(local.toLowerCase())) {
      return "Password cannot contain part of your email.";
    }
  }
  return null;
}

export default function ChangePasswordFirstLogin(): JSX.Element {
  const navigate = useNavigate();
  const email = useMemo(() => localStorage.getItem("pendingEmail") ?? "", []);
  const mustChange = useMemo(() => localStorage.getItem("mustChangePassword") === "true", []);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toggle show/hide
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Errors
  const [newErr, setNewErr] = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    if (!mustChange || !email) {
      navigate("/login", { replace: true });
    }
  }, [mustChange, email, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErr("");
    setNewErr("");
    setConfirmErr("");
    if (!newPassword) {
      setNewErr(
        import.meta.env.FIRST_TIME_LOGIN_NEW_PASSWORD_REQUIRED ?? "New password is required.",
      );
      return;
    }
    if (!confirmPassword) {
      setConfirmErr(
        import.meta.env.FIRST_TIME_LOGIN_CONFIRM_PASSWORD_REQUIRED ??
          "Please confirm your new password.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmErr(
        import.meta.env.FIRST_TIME_LOGIN_CONFIRM_PASSWORD_MISMATCH ??
          "Confirm password does not match the new password.",
      );
      return;
    }
    const policyMsg = validatePasswordPolicy(newPassword, email);
    if (policyMsg) {
      setNewErr(policyMsg);
      return;
    }
    setSubmitting(true);
    try {
      // const telemetry = buildTelemetry();
      // const debug =
      //   import.meta.env.VITE_DEBUG_FIRST_LOGIN === "1"
      //     ? { forceMustChange: true, simulateTelemetryFail: false }
      //     : undefined;

      const res = await changePasswordFirstLogin({
        PasswordKey: localStorage.getItem("reset_token"), // Full URL,
        Password: newPassword,
        ConfirmPassword: confirmPassword,
      });

      if (res.StatusCode == 1 || res.StatusCode == 200) {
        localStorage.removeItem("mustChangePassword");
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("reset_token");
        // TODO: setAuth(res.token) nếu backend trả token
        // setAuth(t, user_name, user_id,res);
        navigate("/login", { replace: true });
      } else {
        setFormErr(res.Msg);
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "An error occurred. Please try again.";
      if (/PASSWORD_REUSE/i.test(msg)) setNewErr("New password cannot reuse previous ones.");
      else if (/POLICY/i.test(msg)) setNewErr(msg);
      else setFormErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-blue-500/20 dark:bg-slate-900/20" />

      <Card className="relative w-full max-w-[440px] md:max-w-[480px] backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/70 shadow-lg border-slate-200 dark:border-slate-800 rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <img src={logoUrl} alt="Company Logo" className="h-16 w-auto mx-auto" />
          <CardTitle className="text-2xl font-bold text-primary">Set Your New Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            For security, please update your temporary password
          </CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit} noValidate>
          <CardContent className="space-y-5">
            {/* Email */}
            <div>
              <Label>Email</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  type="email"
                  value={email}
                  readOnly
                  className="pl-10 bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Old password */}
            {/* <div>
              <Label>Old Password</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOld((s) => !s)}
                  className="absolute right-0 inset-y-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {oldErr && <p className="mt-1 text-sm text-red-600">{oldErr}</p>}
            </div> */}

            {/* New password */}
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-0 inset-y-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newErr && <p className="mt-1 text-sm text-red-600">{newErr}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters, include uppercase, lowercase, number, and special character.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <Label>Confirm New Password</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-0 inset-y-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmErr && <p className="mt-1 text-sm text-red-600">{confirmErr}</p>}
            </div>

            {formErr && <p className="text-sm text-red-600">{formErr}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Changing..." : "Change Password"}
            </Button>
            <p className="text-center text-xs text-gray-500">
              Having trouble? Contact Admin for support.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
