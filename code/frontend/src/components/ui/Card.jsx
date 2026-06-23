import React from "react";

export function Card({ children, className = "", noPadding = false, hover = false }) {
  const hoverStyles = hover ? "hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-0.5 transition-all duration-300" : "";
  
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${hoverStyles} ${className}`}>
      {noPadding ? children : <div className="p-6">{children}</div>}
    </div>
  );
}

export function CardHeader({ children, className = "", title, subtitle, action }) {
  return (
    <div className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        {!title && !subtitle && children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`px-6 py-4 bg-slate-50 border-t border-slate-100 ${className}`}>{children}</div>;
}
