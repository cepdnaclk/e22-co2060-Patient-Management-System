import React from "react";

export function Badge({ children, variant = "info", className = "" }) {
  const variants = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    error: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    neutral: "bg-slate-100 text-slate-800 border-slate-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
