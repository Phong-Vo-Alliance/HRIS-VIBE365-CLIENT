import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "sonner";

export default function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <Toaster position="top-right" richColors closeButton />
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
