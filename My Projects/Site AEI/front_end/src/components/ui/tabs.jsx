// src/components/ui/tabs.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return React.cloneElement(child, { activeTab, handleTabChange });
      })}
    </div>
  );
}

export function TabsList({ children, activeTab, handleTabChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-start rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return React.cloneElement(child, { activeTab, handleTabChange });
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, activeTab, handleTabChange, className }) {
  const isActive = activeTab === value;
  return (
    <button
      type="button"
      onClick={() => handleTabChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer outline-none",
        isActive
          ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, activeTab, className }) {
  if (activeTab !== value) return null;
  return (
    <div className={cn("focus-visible:outline-hidden", className)}>
      {children}
    </div>
  );
}
