/**
 * NusaQuest RPG — Entry Point
 * Wraps the app with PlayerProvider and loads i18n.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlayerProvider } from "@/context/PlayerContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import App from "./App";
import "@/i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <PlayerProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PlayerProvider>
    </AuthProvider>
  </StrictMode>
);
