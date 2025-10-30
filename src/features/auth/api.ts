import { z } from "zod";
import { api } from "@/lib/api/client";
import type { ForgotPasswordRequest, ForgotPasswordResponse, LoginResponse } from "./types";
import { SingleItemResponseModel } from "@/type/all_types";

// ==== Telemetry helper
export interface Telemetry {
  tz: string;
  tzOffsetMinutes: number;
  locale: string;
  userAgent: string;
}

export function buildTelemetry(): Telemetry {
  return {
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tzOffsetMinutes: -new Date().getTimezoneOffset(),
    locale: navigator.language,
    userAgent: navigator.userAgent,
  };
}

// ==== LOGIN ====
export const LoginSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthApi = {
  login: async (dto: LoginInput): Promise<LoginResponse> => {
    const res = await api.postForm<LoginResponse>("/oauth2/token", dto);

    // Fake mustChangePassword cho dev
    const debugFirstLogin =
      String(import.meta.env.VITE_DEBUG_FIRST_LOGIN ?? "false").toLowerCase() === "true";

    return {
      ...res,
      mustChangePassword: debugFirstLogin ? true : false,
    };
  },

  // Get current user info
  me: () => api.get<{ id: string; name: string; username: string }>("/auth/me"),

  // Logout
  logout: () => api.post<void>("/auth/logout"),
};

export interface LoginRequest {
  username: string;
  password: string;
  remember: boolean;
}

// const FAKE_API = String(import.meta.env.VITE_FAKE_API ?? "false").toLowerCase() === "true";

// ==== CHANGE PASSWORD FIRST LOGIN ====
export interface ChangePasswordFirstLoginRequest {
  PasswordKey: string | null;
  Password: string | null;
  ConfirmPassword: string | null;
}

export interface ChangePasswordFirstLoginResponse {
  StatusCode: number | null;
  Msg: string;
}

export async function changePasswordFirstLogin(
  payload: ChangePasswordFirstLoginRequest,
): Promise<ChangePasswordFirstLoginResponse> {
  const res = await api.post<ChangePasswordFirstLoginResponse>(
    "/api/v1/Account/ResetPassword",
    payload,
  );
  return res;
}

export async function CallForgotPassword(
  payload: ForgotPasswordRequest,
): Promise<SingleItemResponseModel<ForgotPasswordResponse>> {
  const res = await api.post<SingleItemResponseModel<ForgotPasswordResponse>>(
    "/api/v1/Account/ForgotPassword",
    payload,
  );
  return res;
}
