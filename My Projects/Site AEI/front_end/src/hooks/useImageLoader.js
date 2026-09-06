// src/hooks/useImageLoader.js
import { useState, useEffect } from "react";

export function useImageLoader(src) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src) {
      setLoaded(false);
      return;
    }

    // Create a temporary image object to check if it's already in browser cache
    const img = new Image();
    img.src = src;

    if (img.complete) {
      setLoaded(true);
      return;
    }

    setLoaded(false);
    setError(null);

    const handleLoad = () => {
      setLoaded(true);
    };

    const handleError = (err) => {
      setError(err);
      setLoaded(false);
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src]);

  return { loaded, error };
}
