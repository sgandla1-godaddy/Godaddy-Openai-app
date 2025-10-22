import React from "react";
import { Info, Lightbulb } from "lucide-react";

export default function BundleCard({ bundle }) {
  if (!bundle) return null;

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
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <span className="inline-block bg-[#00a4a6] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3">
        BUNDLE & SAVE {savingsPercent}%
      </span>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        {bundle.domainBase}
      </h1>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {bundle.tlds && bundle.tlds.map((tld) => (
          <span
            key={tld}
            className="inline-block bg-white border border-gray-300 text-gray-900 text-xs font-medium px-2 py-1 rounded"
          >
            {tld}
          </span>
        ))}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        {bundle.originalPrice && (
          <span className="text-sm text-gray-500 line-through">
            {bundle.originalPrice}
          </span>
        )}
        <span className="text-xl font-bold text-gray-900">
          {bundle.price}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-4">
        <span className="text-xs text-gray-600">{bundle.period || "for first year"}</span>
        <button
          type="button"
          onClick={handleInfoClick}
          aria-label="Pricing information"
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded p-0.5"
        >
          <Info className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleMakeItYours}
        className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 min-h-[44px] mb-4"
        aria-label={`Make ${bundle.domainBase} bundle yours`}
      >
        Make It Yours
      </button>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-start gap-2 text-xs text-gray-700">
          <Lightbulb className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
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

