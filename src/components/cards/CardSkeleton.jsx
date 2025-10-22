import React from "react";
import { useTheme } from "../../use-theme";

/**
 * Unified loading skeleton for card components
 * @param {string} variant - Type of card: 'domain', 'featured', 'bundle', 'taken'
 * @param {boolean} showImage - Whether to show an image skeleton (for domain cards)
 */
export default function CardSkeleton({ variant = 'domain', showImage = false }) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const baseClasses = `animate-pulse rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`;
  
  // Domain Card Skeleton (for carousel)
  if (variant === 'domain') {
    return (
      <div
        className={`min-w-[280px] max-w-[280px] w-[75vw] sm:w-[280px] self-stretch flex flex-col border rounded-lg px-4 py-5 ${
          isDark ? 'bg-[#1a1d29]/60 border-white/10' : 'bg-white border-gray-200'
        }`}
        role="status"
        aria-label="Loading domain card"
      >
        {showImage && (
          <div className="relative w-full mb-1">
            <div className={`${baseClasses} w-full h-[150px]`} />
          </div>
        )}
        
        {/* Badge skeleton */}
        <div className={`${baseClasses} h-4 w-20 mb-2 ${showImage ? 'mt-3' : ''}`} />
        
        {/* Title skeleton */}
        <div className={`${baseClasses} h-6 w-3/4 mb-3`} />
        
        <div className="flex flex-row items-center justify-between mb-3">
          <div className="flex flex-col gap-2">
            {/* Price skeleton */}
            <div className="flex items-baseline gap-2">
              <div className={`${baseClasses} h-3 w-12`} />
              <div className={`${baseClasses} h-5 w-16`} />
            </div>
            {/* Period skeleton */}
            <div className={`${baseClasses} h-3 w-24`} />
          </div>
        </div>
        
        {/* Button skeleton */}
        <div className="mt-auto pt-5">
          <div className={`${baseClasses} h-[44px] w-full rounded-sm`} />
        </div>
      </div>
    );
  }
  
  // Featured Domain Skeleton
  if (variant === 'featured') {
    return (
      <div 
        className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        role="status"
        aria-label="Loading featured domain"
      >
        {/* Badge skeleton */}
        <div className={`${baseClasses} h-4 w-24 mb-3`} />
        
        {/* Title skeleton */}
        <div className={`${baseClasses} h-8 w-3/4 mb-3`} />
        
        {/* Price section */}
        <div className="flex items-baseline gap-2 mb-1">
          <div className={`${baseClasses} h-4 w-12`} />
          <div className={`${baseClasses} h-6 w-20`} />
        </div>
        
        {/* Period skeleton */}
        <div className={`${baseClasses} h-3 w-28 mb-4`} />
        
        {/* Button skeleton */}
        <div className={`${baseClasses} h-[44px] w-36 rounded-lg mb-4`} />
        
        {/* Reasons section */}
        <div className="border-t border-gray-200 pt-4">
          <div className={`${baseClasses} h-4 w-40 mb-3`} />
          <div className="space-y-2">
            <div className={`${baseClasses} h-3 w-full`} />
            <div className={`${baseClasses} h-3 w-5/6`} />
            <div className={`${baseClasses} h-3 w-4/5`} />
          </div>
        </div>
      </div>
    );
  }
  
  // Bundle Card Skeleton
  if (variant === 'bundle') {
    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        role="status"
        aria-label="Loading bundle card"
      >
        {/* Badge skeleton */}
        <div className={`${baseClasses} h-4 w-32 mb-3`} />
        
        {/* Title skeleton */}
        <div className={`${baseClasses} h-8 w-2/3 mb-3`} />
        
        {/* TLD badges skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <div className={`${baseClasses} h-6 w-12`} />
          <div className={`${baseClasses} h-6 w-14`} />
          <div className={`${baseClasses} h-6 w-16`} />
          <div className={`${baseClasses} h-6 w-12`} />
        </div>
        
        {/* Price section */}
        <div className="flex items-baseline gap-2 mb-1">
          <div className={`${baseClasses} h-4 w-12`} />
          <div className={`${baseClasses} h-6 w-20`} />
        </div>
        
        {/* Period skeleton */}
        <div className={`${baseClasses} h-3 w-32 mb-4`} />
        
        {/* Button skeleton */}
        <div className={`${baseClasses} h-[44px] w-full rounded-lg mb-4`} />
        
        {/* Description section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-start gap-2">
            <div className={`${baseClasses} h-4 w-4 rounded-full flex-shrink-0`} />
            <div className="flex-1 space-y-2">
              <div className={`${baseClasses} h-3 w-full`} />
              <div className={`${baseClasses} h-3 w-4/5`} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Featured Domain Taken Skeleton
  if (variant === 'taken') {
    return (
      <div 
        className="flex-1 flex flex-col bg-white rounded-lg border-2 border-[#00a4a6] p-4 shadow-sm"
        role="status"
        aria-label="Loading taken domain card"
      >
        {/* Badge skeleton */}
        <div className={`${baseClasses} h-4 w-28 mb-3`} />
        
        {/* Title with icon skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`${baseClasses} h-5 w-5 rounded-full`} />
          <div className={`${baseClasses} h-8 w-2/3`} />
        </div>
        
        {/* Description text skeleton */}
        <div className={`${baseClasses} h-3 w-full mb-1`} />
        <div className={`${baseClasses} h-3 w-1/3 mb-4`} />
        
        {/* Broker info section */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`${baseClasses} w-12 h-12 rounded-full`} />
          <div className="flex flex-col gap-2">
            <div className={`${baseClasses} h-3 w-32`} />
            <div className={`${baseClasses} h-6 w-20`} />
          </div>
        </div>
        
        {/* Button skeleton */}
        <div className={`${baseClasses} h-[44px] w-32 rounded-lg mb-4`} />
        
        {/* Facts section */}
        <div className="border-t border-gray-200 pt-4">
          <div className={`${baseClasses} h-4 w-48 mb-3`} />
          <div className="space-y-2">
            <div className={`${baseClasses} h-3 w-full`} />
            <div className={`${baseClasses} h-3 w-5/6`} />
            <div className={`${baseClasses} h-3 w-4/5`} />
          </div>
        </div>
      </div>
    );
  }
  
  // Default fallback skeleton
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      role="status"
      aria-label="Loading card"
    >
      <div className={`${baseClasses} h-4 w-24 mb-3`} />
      <div className={`${baseClasses} h-8 w-3/4 mb-4`} />
      <div className={`${baseClasses} h-6 w-20 mb-4`} />
      <div className={`${baseClasses} h-[44px] w-full rounded-lg`} />
    </div>
  );
}

