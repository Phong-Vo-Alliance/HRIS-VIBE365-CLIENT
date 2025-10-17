import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

// shadcn-ui components (generate with: button input label card checkbox)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Toast via Sonner (no shadcn hook dependency)
import { Toaster, toast } from "sonner";

import { AuthApi } from "@/features/auth/api";
import { useAuthStore } from "@/stores/auth.store";
import logoUrl from "@/assets/logo.png";
import loginBg from "@/assets/login-bg.jpg";

const LoginSchema = z.object({
  username: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(true),
});

type LoginInput = z.input<typeof LoginSchema>; // { email; password; remember?: boolean }
type LoginOutput = z.output<typeof LoginSchema>; // { email; password; remember: boolean }
//type RedirectState = { from?: { pathname?: string } } | null;

function getRedirectTo(state: unknown): string {
  if (state && typeof state === "object") {
    const s = state as { from?: { pathname?: string } };
    const p = s.from?.pathname;
    if (typeof p === "string") return p;
  }
  return "/app";
}

// Lưu/clear auth vào storage theo "Remember me"

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "", remember: true },
  });

  const onSubmit = handleSubmit(async (data: LoginInput) => {
    try {
      // Demo short-circuit
      // if (DEMO_ENABLED && data.email === DEMO_EMAIL && data.password === DEMO_PASS) {
      //   return demoLogin();
      // }
      //const res = await AuthApi.login({ email: data.email, password: data.password } as any);
      const payload: LoginOutput = {
        username: data.username,
        password: data.password,
        remember: data.remember ?? false,
      };
      const res = await AuthApi.login(payload);

      // Nếu backend trả mustChangePassword
      if (res.user_type?.includes("FirstTimeLogin") || res.isNeedChangePassword) {
        localStorage.setItem("mustChangePassword", "true");
        localStorage.setItem("pendingEmail", data.username); // để màn đổi pass hiển thị email
        localStorage.setItem("reset_token", res.user_type?.replace("FirstTimeLogin_", "") ?? ""); // để màn đổi pass hiển thị email
        toast.info("You must change your password on first login.");
        nav("/auth/change-password", { replace: true });
        return;
      }

      setAuth(
        res.access_token ?? "",
        res.user_name ?? "",
        res.user_id ?? "",
        res,
        payload.remember,
      );
      // addLoginEntry().then(() => {
      //   setTimeout(() => {
      //     //for wanting to do some thing before login
      //   }, 100);
      // });
      toast.success(`Welcome back, ${res.user_name}`);
      const redirectTo = getRedirectTo(loc.state);
      nav(redirectTo, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(msg);
    }
  });

  return (
    // <div className="relative min-h-dvh flex items-center justify-center px-4 sm:px-6 py-10 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-slate-900 dark:via-slate-950 dark:to-black">
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-blue-500/20 dark:bg-slate-900/20" />
      <Toaster position="top-right" richColors closeButton />

      {/* animated blue blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-0 -right-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="w-full max-w-[440px] md:max-w-[480px]"
      >
        <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/70 shadow-lg border-slate-200 dark:border-slate-800 rounded-2xl">
          <CardHeader className="space-y-2 text-center">
            <img src={logoUrl} alt="Your Company" className="h-16 w-auto mx-auto" />
            {/* <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LogIn className="h-6 w-6" />
            </div> */}
            <CardTitle
              id="login-title"
              role="heading"
              aria-level={1}
              className="text-2xl font-bold text-primary"
            >
              Sign in
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              HRIS Time Tracking System
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-5"
              noValidate
              aria-labelledby="login-title"
              onSubmit={onSubmit}
            >
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
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="pl-10 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={errors.username ? "true" : undefined}
                    aria-describedby={errors.username ? "email-error" : undefined}
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p
                    role="alert"
                    id="email-error"
                    data-testid="email-error"
                    className="text-sm text-red-600"
                  >
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={errors.password ? "true" : undefined}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-0 inset-y-0 grid w-10 place-items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    role="alert"
                    id="password-error"
                    data-testid="password-error"
                    className="text-sm text-red-600"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Controller
                    name="remember"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="remember"
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      />
                    )}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Keep me logged in?
                  </Label>
                </div>
                <Link to="#" className="text-xs text-muted-foreground hover:text-foreground">
                  Need help?
                </Link>
              </div>

              {/* Submit */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner className="mr-2" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
            <div>
              Don’t have an account?{" "}
              <Link to="#" className="text-primary hover:underline">
                Contact administrator
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 animate-spin ${className}`} viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
