// src/hooks/useGeolocation.ts

import { useState, useEffect } from "react";

interface GeolocationState {
  loaded: boolean;
  coordinates: { lat: number; lng: number } | null;
  error: { code: number; message: string } | null;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState>({
    loaded: false,
    coordinates: null,
    error: null,
  });

  const onSuccess = (position: GeolocationPosition) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      error: null,
    });
  };

  const onError = (error: GeolocationPositionError) => {
    setLocation((prev) => ({
      ...prev,
      loaded: true,
      error: {
        code: error.code,
        message: error.message,
      },
    }));
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocation((prev) => ({
        ...prev,
        loaded: true,
        error: {
          code: 0,
          message: "Geolocation not supported by browser",
        },
      }));
      return;
    }

    // Single high accuracy check
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Subscribe to continuous updates
    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
}
