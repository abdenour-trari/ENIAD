// src/components/ui/ImageSkeleton.jsx
import React from "react";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";

export function ImageSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative w-full h-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse flex items-center justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <Image className="text-slate-300 dark:text-slate-700 w-10 h-10" />
      
      {/* Premium shine swipe animation overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
}
