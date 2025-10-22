import React from "react";
import { ShoppingCart, Info, ExternalLink } from "lucide-react";

// Follows OpenAI Apps SDK design guidelines and GoDaddy brand standards
export default function DomainCard({ domain, showImage = false, showAvailableBadge = true, highlightTLD = true }) {
  if (!domain) return null;

  // Split domain name into base and TLD for highlighting
  const getDomainParts = (domainName) => {
    const lastDotIndex = domainName.lastIndexOf('.');
    if (lastDotIndex === -1) return { base: domainName, tld: '' };
    return {
      base: domainName.substring(0, lastDotIndex),
      tld: domainName.substring(lastDotIndex) // includes the dot
    };
  };

  const { base, tld } = getDomainParts(domain.name);

  const handleSelect = () => {
    // Track telemetry
    console.log('[DomainCard] Select clicked:', domain.name);

    // Open GoDaddy domain search page
    const godaddyUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain.name)}`;
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    // Track telemetry
    console.log('[DomainCard] Add to cart clicked:', domain.name);

    // TODO: Trigger tool call via window.openai.callTool
    // window.openai.callTool('add_to_cart', { domainName: domain.name });
  };

  return (
    <div
      className="min-w-[280px] select-none max-w-[280px] w-[75vw] sm:w-[280px] self-stretch flex flex-col border border-gray-200 rounded-sm px-4 py-5"
      role="article"
      aria-label={`Domain ${domain.name}`}
    >
      {/* Domain Image with Badge - Optional via feature flag */}
      {showImage && (
        <div className="relative w-full mb-1">
          <img
            src={domain.image}
            alt={`${domain.name} domain preview`}
            className="w-full h-[150px] object-cover rounded-lg ring-1 ring-black/10 shadow-sm"
          />
          {/* Badge overlaid on image */}
          {showAvailableBadge && domain.badge && (
            <span
              className="absolute top-2 left-2 bg-[#FFF4CC] text-[#5C4A1F] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              aria-label="Domain status"
            >
              {domain.badge}
            </span>
          )}
        </div>
      )}
      
      {/* Available Badge when no image */}
      {!showImage && showAvailableBadge && domain.badge && (
        <span
          className="inline-block bg-[#FFF4CC] text-[#5C4A1F] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded self-start mb-2"
          aria-label="Domain status"
        >
          {domain.badge}
        </span>
      )}

      {/* Card Content */}
      <div className={`${showImage ? 'mt-3' : ''} flex flex-col flex-1`}>
        {/* Domain Name with highlighted TLD */}
        <h3 className="text-xl font-semibold text-gray-900 truncate mb-3">
          {highlightTLD ? (
            <>
              <span>{base}</span>
              <span className="text-[#00a4a6]">{tld}</span>
            </>
          ) : (
            domain.name
          )}
        </h3>

<div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            {domain.originalPrice && (
              <span
                className="text-xs text-gray-500 line-through"
                aria-label={`Original price ${domain.originalPrice}`}
              >
                {domain.originalPrice}
              </span>
            )}
            <span className="text-md font-semibold text-gray-900">
              {domain.price}
            </span>
          </div>

          {/* Period with info icon */}
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-gray-700 font-medium">{domain.period}</span>
            <button
              type="button"
              aria-label="Pricing information"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded cursor-pointer"
            >
              <Info className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Inline Cart */}
        {/* <button
          type="button"
          onClick={handleAddToCart}
          className="w-[44px] h-[44px] border-1 rounded-sm flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
          aria-label={`Add ${domain.name} to cart`}
        >
          <ShoppingCart className="w-5 h-5" aria-hidden="true" />
        </button> */}

        {/* Primary CTA - OPTION 2 - Compact turquoise button with text */}
        {/* <button
          type="button"
          onClick={handleSelect}
          className="bg-[#00a4a6] hover:bg-[#008c8e] active:bg-[#007476] dark:bg-[#00a4a6] dark:hover:bg-[#008c8e] rounded-sm flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a4a6] cursor-pointer px-3 py-2.5 min-h-[44px]"
          aria-label={`View ${domain.name} on GoDaddy`}
        >
          <span className="text-xs font-medium text-white">View</span>
          <ExternalLink className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </button> */}

        </div>

        <div className="mt-auto pt-5 flex items-center gap-2">
          {/* Primary CTA - OPTION 1 */}
          <button
            type="button"
            onClick={handleSelect}
            className="group relative flex-1 bg-black text-white dark:border dark:border-gray-600 dark:text-white hover:bg-gray-800 dark:hover:bg-gray-800 active:bg-gray-900 dark:active:bg-gray-700 transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-600 text-sm font-medium px-4 py-2.5 rounded-sm min-h-[44px] cursor-pointer overflow-hidden flex items-center justify-center gap-2"
            aria-label={`Select ${domain.name}`}
          >
            View on GoDaddy.com
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        
      </div>
    </div>
  );
}

