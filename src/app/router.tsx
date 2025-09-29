import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import AppLayout from "@/pages/_layout/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import ReportPage from "@/features/report/ReportPage";
import { AuthGuard } from "@/features/auth/AuthGuard";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/app",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "report", element: <ReportPage /> },
    ],
  },
  // fallback: redirect / to /app
  { path: "/", element: <LoginPage /> },
]);

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
