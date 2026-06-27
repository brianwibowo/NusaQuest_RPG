/**
 * NusaQuest RPG — Entry Point
 * Wraps the app with PlayerProvider and loads i18n.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlayerProvider } from "@/context/PlayerContext";
import App from "./App";
import "@/i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </StrictMode>
);
