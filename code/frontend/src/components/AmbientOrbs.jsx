import React from "react";

const AmbientOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Orb 1: Slow floating top-right */}
      <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] animate-[float_25s_ease-in-out_infinite]" />
      
      {/* Orb 2: Reverse floating bottom-left */}
      <div className="absolute -bottom-1/4 -left-1/4 w-[900px] h-[900px] bg-blue-600/20 rounded-full blur-[120px] animate-[float_30s_ease-in-out_infinite_reverse]" />
      
      {/* Center Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-[100px] animate-pulse" />
    </div>
  );
};

export default AmbientOrbs;