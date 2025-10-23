import React from "react";
import { ShoppingCart, Info, ExternalLink } from "lucide-react";

export default function DomainListItem({ domain, showImage = false }) {
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

  const handleSelect = () => {
    console.log('[DomainListItem] View clicked:', domain.name);
    const godaddyUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain.name)}`;
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    console.log('[DomainListItem] Add to cart clicked:', domain.name);
    // TODO: Implement cart functionality
  };

  return (
    <div className="px-4 -mx-2 rounded-2xl hover:bg-black/5 transition-colors">
      <div
        style={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        }}
        className="flex w-full items-center gap-3 py-4"
      >
        {/* Domain Image (optional) */}
        {showImage && domain.image && (
          <div className="flex-shrink-0">
            <img
              src={domain.image}
              alt={`${domain.name} domain preview`}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg ring-1 ring-black/10 shadow-sm"
            />
          </div>
        )}

        {/* Domain Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {domain.badge && (
              <span
                className="inline-block bg-[#FFF4CC] text-[#5C4A1F] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                aria-label="Domain status"
              >
                {domain.badge}
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">
            <span>{base}</span>
            <span className="text-[#00a4a6]">{tld}</span>
          </h3>
          {domain.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {domain.description}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="flex flex-col items-end min-w-[120px]">
          <div className="flex items-baseline gap-2 mb-1">
            {domain.originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                {domain.originalPrice}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900">
              {domain.price}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">{domain.period}</span>
            <button
              type="button"
              aria-label="Pricing information"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded cursor-pointer"
            >
              <Info className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-11 h-11 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
            aria-label={`Add ${domain.name} to cart`}
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleSelect}
            className="bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 min-h-[44px] min-w-[44px] cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            aria-label={`View ${domain.name} on GoDaddy.com`}
          >
            View
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

