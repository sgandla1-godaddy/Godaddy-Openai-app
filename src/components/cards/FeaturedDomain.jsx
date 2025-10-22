import React from "react";
import { Info } from "lucide-react";

export default function FeaturedDomain({ domain, showReasons = true }) {
  if (!domain) return null;

  const getDomainParts = (domainName) => {
    const lastDotIndex = domainName.lastIndexOf('.');
    if (lastDotIndex === -1) return { base: domainName, tld: '' };
    return {
      base: domainName.substring(0, lastDotIndex),
      tld: domainName.substring(lastDotIndex)
    };
  };

  const { base, tld } = getDomainParts(domain.name);

  const handleMakeItYours = () => {
    console.log('[FeaturedDomain] Make It Yours clicked:', domain.name);
    const godaddyUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain.name)}`;
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInfoClick = () => {
    console.log('[FeaturedDomain] Pricing info clicked');
  };

  const reasons = domain.reasons || [
    "The domain is close to the one taken.",
    "It may fit your business and brand.",
    "It may be more unique and more memorable."
  ];

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {domain.badge && (
        <span className="inline-block bg-[#FFF4CC] text-gray-900 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3 self-start">
          {domain.badge}
        </span>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        <span>{base}</span>
        <span className="text-[#00a4a6]">{tld}</span>
      </h1>

      <div className="flex items-baseline gap-2 mb-1">
        {domain.originalPrice && (
          <span className="text-sm text-gray-500 line-through">{domain.originalPrice}</span>
        )}
        <span className="text-xl font-bold text-gray-900">{domain.price}</span>
      </div>

      <div className="flex items-center gap-1 mb-4">
        <span className="text-xs text-gray-600">{domain.period}</span>
        <button type="button" onClick={handleInfoClick} aria-label="Pricing information"
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded p-0.5">
          <Info className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <button type="button" onClick={handleMakeItYours}
        className={`self-start bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 min-h-[44px] ${showReasons ? 'mb-4' : ''}`}
        aria-label={`Make ${domain.name} yours`}>
        Make It Yours
      </button>

      {showReasons && (
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Why Get This Domain?</h2>
          <ul className="space-y-2">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-gray-400 mt-0.5">+</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

