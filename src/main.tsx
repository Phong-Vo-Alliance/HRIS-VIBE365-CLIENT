import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "@/app/router";
import { AuthBootstrap } from "@/app/auth-bootstrap";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthBootstrap>
      <AppRouter />
    </AuthBootstrap>
  </StrictMode>,
);
