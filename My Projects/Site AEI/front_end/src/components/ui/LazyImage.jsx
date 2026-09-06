// src/components/ui/LazyImage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useImageLoader } from "@/hooks/useImageLoader";
import { ImageSkeleton } from "./ImageSkeleton";
import { getOptimizedImage } from "@/utils/imageOptimizer";
import { cn } from "@/lib/utils";

export function LazyImage({
  src,
  alt = "",
  placeholder,
  className,
  sizes,
  priority = false,
  width,
  height,
  quality,
  ...props
}) {
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef(null);

  // Intersection Observer to lazy load when close to the viewport
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "250px", // Preload slightly before the image scroll position
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  // Pass source only when observed in viewport
  const optimizedSrc = isInView
    ? getOptimizedImage(src, { width, height, quality })
    : "";

  const { loaded, error } = useImageLoader(optimizedSrc);

  const hasBlurPlaceholder = placeholder && placeholder.startsWith("data:");

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-900 transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* 1. Skeleton or Blur Placeholder Layer */}
      {!loaded && !error && (
        <div className="absolute inset-0 z-10 w-full h-full">
          {hasBlurPlaceholder ? (
            <img
              src={placeholder}
              alt="loading placeholder"
              className="w-full h-full object-cover scale-105 filter blur-lg transition-opacity duration-500 ease-out"
            />
          ) : (
            <ImageSkeleton />
          )}
        </div>
      )}

      {/* 2. Real Image Layer */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          sizes={sizes}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out",
            loaded ? "opacity-100 scale-100 filter blur-0" : "opacity-0 scale-105 filter blur-md",
            error ? "hidden" : ""
          )}
        />
      )}

      {/* 3. Error Fallback state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 text-xs p-3">
          <span className="font-semibold text-center">Image non disponible</span>
        </div>
      )}
    </div>
  );
}
