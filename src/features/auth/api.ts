import { z } from "zod";
import { api } from "@/lib/api/client";
import type { LoginResponse } from "./types";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthApi = {
  login: (dto: LoginInput) => api.post<LoginResponse>("/auth/login", dto),
  me: () => api.get<{ id: string; name: string; email: string }>("/auth/me"),
  logout: () => api.post<void>("/auth/logout"),
};
