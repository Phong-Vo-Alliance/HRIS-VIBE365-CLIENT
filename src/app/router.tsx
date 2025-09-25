import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import AppLayout from "@/pages/_layout/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import { AuthGuard } from "@/features/auth/AuthGuard";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [{ index: true, element: <DashboardPage /> }],
  },
]);

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
