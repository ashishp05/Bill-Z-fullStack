import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App";

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      // Check for a new build on launch; a failed offline check keeps the cached app usable.
      void registration?.update().catch(() => undefined);
    },
  });
  // Retire only the previous Bill-Z worker's cache; Workbox owns future cache versions.
  if ("caches" in window) void caches.delete("billz-pwa-v1");
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
