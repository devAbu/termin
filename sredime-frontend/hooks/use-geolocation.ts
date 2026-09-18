"use client";

import { useCallback, useState } from "react";
import type { GeoCoords } from "@/lib/geo";

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

/**
 * Thin wrapper around `navigator.geolocation` (docs/frontend.md — "blizu mene").
 * Never calls the browser API on its own: the caller shows the "why" explanation
 * first, then calls `request()` from a click handler. Denial/unavailability is
 * just a status the caller falls back on silently — never surfaced as an error.
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { timeout: 10_000 },
    );
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setCoords(null);
  }, []);

  return { status, coords, request, reset };
}
