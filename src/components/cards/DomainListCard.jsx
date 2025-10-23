import React from "react";
import { ShoppingCart, Info, ExternalLink } from "lucide-react";
import { useTheme } from "../../use-theme";

export default function DomainListCard({ domain, showImage = false }) {
  if (!domain) return null;

  const theme = useTheme();
  const isDark = theme === "dark";

  const getDomainParts = (domainName) => {
    const lastDotIndex = domainName.lastIndexOf('.');
    if (lastDotIndex === -1) return { base: domainName, tld: '' };
    return {
      base: domainName.substring(0, lastDotIndex),
      tld: domainName.substring(lastDotIndex)
    };
  };

  const { base, tld } = getDomainParts(domain.name);

  const buildAddToCartUrl = (domainName, tld) => {
    // Create the request data object
    const requestData = {
      packages: [
        {
          pkgid: "domain",
          term: "12:Month",
          tld: tld,
          domain: {
            name: `${domainName}`
          }
        }
      ],
      itc: "test-itc"
    };
  
    const encodedRequestData = encodeURIComponent(JSON.stringify(requestData));
    return `https://salesproducts.api.godaddy.com/v1/pl/1/cart/packages?requestData=${encodedRequestData}&redirectToCart=true&allowPartialSuccess=false&skipAvailCheck=false`;
  }

  const handleSelect = () => {
    console.log('[DomainListCard] View clicked:', domain.name);
    const godaddyUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain.name)}`;
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    console.log('[DomainListCard] Add to cart clicked:', domain.name);
    // TODO: Implement cart functionality
    const godaddyUrl = buildAddToCartUrl(domain.name, domain.tld);
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`px-4 -mx-2 rounded-2xl transition-colors ${
      isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
    }`}>
      <div
        style={{
          borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
        }}
        className="flex flex-col md:flex-row md:items-center w-full gap-2 py-3.5"
      >
        {/* Top section: Image + Info + Pricing (desktop: horizontal, mobile: vertical) */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
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

          {/* Domain Info + Mobile Pricing */}
          <div className="flex-1 min-w-0">
            {/* Badge + Domain Name */}
            <div className="flex items-center gap-2 mb-1">
              {domain.badge && (
                <span
                  className="inline-block bg-[#FFF4CC] text-[#5C4A1F] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  aria-label="Domain status"
                >
                  {domain.badge}
                </span>
              )}
            </div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-1 truncate ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <span>{base}</span>
              <span className={isDark ? 'text-[#4a9eff]' : 'text-[#00a4a6]'}>{tld}</span>
            </h3>

            {/* Description - desktop only */}
            {/* {domain.description && (
              <p className="hidden md:block text-sm text-gray-600 line-clamp-1 mt-0.5">
                {domain.description}
              </p>
            )} */}
          </div>
        </div>

        {/* Mobile: Pricing + Actions (side by side) */}
        <div className="flex md:hidden items-center justify-between gap-3 w-full">
          {/* Pricing */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              {domain.originalPrice && (
                <span className={`text-xs line-through ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {domain.originalPrice}
                </span>
              )}
              <span className={`text-lg font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{domain.price}</span>
            </div>
            <span className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>{domain.period}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 items-center flex-shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-11 h-11 border-2 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                isDark
                  ? 'border-white/20 hover:bg-white/10 active:bg-white/20 focus:ring-blue-500'
                  : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-600'
              }`}
              aria-label={`Add ${domain.name} to cart`}
            >
              <ShoppingCart className={`w-5 h-5 ${
                isDark ? 'text-white' : 'text-gray-700'
              }`} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleSelect}
              className={`text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                isDark
                  ? 'bg-[#0071c2] hover:bg-[#006bb3] active:bg-[#005999] focus:ring-[#0071c2]'
                  : 'bg-black hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-900'
              }`}
              aria-label={`View ${domain.name} on GoDaddy.com`}
            >
              View
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Desktop: Pricing in middle */}
        <div className="hidden md:flex flex-col items-end min-w-[110px]">
          <div className="flex items-baseline gap-1.5 mb-0.5">
            {domain.originalPrice && (
              <span className={`text-xs line-through ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {domain.originalPrice}
              </span>
            )}
            <span className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{domain.price}</span>
          </div>
          <span className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>{domain.period}</span>
        </div>

        {/* Desktop: Actions on right */}
        <div className="hidden md:flex gap-2 items-center">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-11 h-11 border-2 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer flex-shrink-0 ${
              isDark
                ? 'border-white/20 hover:bg-white/10 active:bg-white/20 focus:ring-blue-500'
                : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-600'
            }`}
            aria-label={`Add ${domain.name} to cart`}
          >
            <ShoppingCart className={`w-5 h-5 ${
              isDark ? 'text-white' : 'text-gray-700'
            }`} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleSelect}
            className={`text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              isDark
                ? 'bg-[#0071c2] hover:bg-[#006bb3] active:bg-[#005999] focus:ring-[#0071c2]'
                : 'bg-black hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-900'
            }`}
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

