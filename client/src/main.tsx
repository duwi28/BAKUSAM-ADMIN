// src/main.tsx

import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import App from "./App";
import "./index.css";

// Firebase import removed - using PostgreSQL backend instead

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
);
