"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available
                  setWaitingWorker(newWorker);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Listen for updates from other tabs
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SKIP_WAITING") {
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdatePrompt(false);
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="rounded-lg border border-border bg-panel p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground">
            A new version of ClawSpace is available!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="rounded px-3 py-1 text-xs text-muted hover:bg-muted"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              className="rounded bg-primary px-3 py-1 text-xs text-white hover:opacity-90"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
