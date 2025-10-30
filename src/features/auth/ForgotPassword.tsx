import { useState } from "react";
import { Link } from "react-router-dom";
import { CallForgotPassword } from "@/features/auth/api";
import { Mail } from "lucide-react";
import { SingleItemResponseModel } from "@/type/all_types";

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
import { toast } from "sonner";
import { ForgotPasswordResponse } from "./types";
// import { useAuthStore } from "@/stores/auth.store";

export default function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toggle show/hide

  // Errors
  const [formErr, setFormErr] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    let connection_error = false;
    try {
      const res = await CallForgotPassword({
        Email: email,
      }).catch((err: Error | unknown) => {
        connection_error = true;
        const result: SingleItemResponseModel<ForgotPasswordResponse> = {
          StatusCode: 404,
          Msg: err instanceof Error ? err.message : String(err),
          Data: {
            Email: "",
            PasswordRecoveryURL: "",
            ExpriedDate: "",
          },
        };
        return result;
      });
      if (connection_error) {
        toast.error("Cannot connect to server. Please try again later.");
      }
      if (res.StatusCode == 200 || res.StatusCode == 1) {
        toast.success(res.Msg);
        setIsSuccess(true);
      } else {
        setFormErr(res.Msg);
      }
    } catch (_err: Error | unknown) {
      toast.error(_err instanceof Error ? _err.message : String(_err));
    } finally {
      setSubmitting(false);
    }
  };

  return isSuccess ? (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-blue-500/20 dark:bg-slate-900/20" />
      <Card className="relative w-full max-w-[440px] md:max-w-[480px] backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/70 shadow-lg border-slate-200 dark:border-slate-800 rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <img src={logoUrl} alt="Company Logo" className="h-16 w-auto mx-auto" />
        </CardHeader>
        <CardContent className="space-y-5">
          <h1>Check your email</h1>
          <p>Please see info in your email to reset password</p>
          <Link to="/login" className="text-xs text-primary hover:underline">
            Back to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  ) : (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-blue-500/20 dark:bg-slate-900/20" />

      <Card className="relative w-full max-w-[440px] md:max-w-[480px] backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/70 shadow-lg border-slate-200 dark:border-slate-800 rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <img src={logoUrl} alt="Company Logo" className="h-16 w-auto mx-auto" />
          <CardTitle className="text-2xl font-bold text-primary">Forgot password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
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
                  className="pl-10 bg-gray-100"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {formErr && <p className="text-sm text-red-600">{formErr}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Changing..." : "Submit"}
            </Button>
            <div className="text-center text-xs text-gray-500">
              <Link to="/login" className="text-xs text-primary hover:underline">
                Back to Login
              </Link>
            </div>
            <p className="text-center text-xs text-gray-500">
              Having trouble? Contact Admin for support.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
