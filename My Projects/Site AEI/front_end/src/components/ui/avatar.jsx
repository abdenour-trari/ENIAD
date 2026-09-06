// src/components/ui/avatar.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ src, alt, fallback, className }) {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200/50 bg-slate-100 dark:border-slate-800 dark:bg-slate-800",
        className
      )}
    >
      {!error && src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-sky-100 text-sky-700 text-sm font-bold uppercase dark:bg-sky-900/50 dark:text-sky-300">
          {fallback || (alt ? alt.substring(0, 2) : "??")}
        </div>
      )}
    </div>
  );
}
