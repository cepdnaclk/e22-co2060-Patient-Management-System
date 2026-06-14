import React from "react";

export function Table({ children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <table className="w-full text-sm text-left whitespace-nowrap">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
      {children}
    </thead>
  );
}

export function TableRow({ children, className = "", onClick }) {
  const interactiveStyles = onClick 
    ? "cursor-pointer hover:bg-blue-50/50 transition-colors" 
    : "hover:bg-slate-50/50 transition-colors";
    
  return (
    <tr 
      onClick={onClick}
      className={`border-b border-slate-100 last:border-0 ${interactiveStyles} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <th scope="col" className={`px-6 py-4 font-semibold tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-6 py-4 text-slate-700 ${className}`}>
      {children}
    </td>
  );
}
