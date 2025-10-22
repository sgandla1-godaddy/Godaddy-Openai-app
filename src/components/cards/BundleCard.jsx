import React from "react";
import { Info, Lightbulb } from "lucide-react";
import { useTheme } from "../../use-theme";

export default function BundleCard({ bundle }) {
  if (!bundle) return null;

  const theme = useTheme();
  const isDark = theme === "dark";

  const handleMakeItYours = () => {
    console.log('[BundleCard] Make It Yours clicked:', bundle.domainBase);
    const godaddyUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(bundle.domainBase)}`;
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInfoClick = () => {
    console.log('[BundleCard] Pricing info clicked');
  };

  const savingsPercent = bundle.savingsPercent || 92;

  return (
    <div className={`rounded-lg border p-4 ${
      isDark 
        ? 'bg-[#1a1d29]/60 border-white/10' 
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <span className="inline-block bg-[#00a4a6] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3">
        BUNDLE & SAVE {savingsPercent}%
      </span>

      <h1 className={`text-2xl font-bold mb-3 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {bundle.domainBase}
      </h1>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {bundle.tlds && bundle.tlds.map((tld) => (
          <span
            key={tld}
            className={`inline-block border text-xs font-medium px-2 py-1 rounded ${
              isDark
                ? 'bg-[#252935] border-white/10 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {tld}
          </span>
        ))}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        {bundle.originalPrice && (
          <span className={`text-sm line-through ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {bundle.originalPrice}
          </span>
        )}
        <span className={`text-xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {bundle.price}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-4">
        <span className={`text-xs ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>{bundle.period || "for first year"}</span>
        <button
          type="button"
          onClick={handleInfoClick}
          aria-label="Pricing information"
          className={`focus:outline-none focus:ring-2 focus:ring-offset-1 rounded p-0.5 ${
            isDark 
              ? 'text-gray-400 hover:text-gray-300 focus:ring-blue-500' 
              : 'text-gray-500 hover:text-gray-700 focus:ring-gray-300'
          }`}
        >
          <Info className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleMakeItYours}
        className={`text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] mb-4 ${
          isDark
            ? 'bg-[#0071c2] hover:bg-[#006bb3] active:bg-[#005999] focus:ring-[#0071c2]'
            : 'bg-black hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-900'
        }`}
        aria-label={`Make ${bundle.domainBase} bundle yours`}
      >
        Make It Yours
      </button>

      <div className={`border-t pt-4 ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className={`flex items-start gap-2 text-xs ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Lightbulb className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} aria-hidden="true" />
          <div>
            <span className="font-semibold">Why it's great: </span>
            <span>
              {bundle.description || `Protect your business from copycats by registering these popular endings: ${bundle.tlds?.join(', ').toUpperCase()}.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

