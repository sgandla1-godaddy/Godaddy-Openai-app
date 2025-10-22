import React from "react";
import { ChevronRight } from "lucide-react";

export default function ActionLink({ 
  children, 
  onClick, 
  showIcon = true,
  ariaLabel,
  ...props 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 rounded px-3 py-2 min-h-[44px] cursor-pointer"
      aria-label={ariaLabel || children}
      {...props}
    >
      {children}
      {showIcon && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

