"use client";

import * as React from "react";

export function PwaRegister() {
  const [isOffline, setIsOffline] = React.useState(false);
  const [showReconnected, setShowReconnected] = React.useState(false);

  React.useEffect(() => {
    // 1. Unregister any service workers and clear stale caches
    if (typeof window !== "undefined") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      }
      if ("caches" in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
    }

    // 2. Offline / Online network listeners
    function handleOffline() {
      setIsOffline(true);
      setShowReconnected(false);
    }

    function handleOnline() {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    }

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("online", handleOnline);
      }
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            backgroundColor: "#ce1126",
            color: "#ffffff",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>📶</span>
          <span>Admin Console: Offline Mode</span>
        </div>
      )}

      {showReconnected && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            backgroundColor: "#007A3D",
            color: "#ffffff",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>✓</span>
          <span>Online: Connected to Network</span>
        </div>
      )}
    </>
  );
}
