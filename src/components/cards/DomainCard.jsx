import React from "react";
import { ShoppingCart, Info, ExternalLink } from "lucide-react";
import { useTheme } from "../../use-theme";

export default function DomainCard({ domain, showImage = false, showAvailableBadge = true, highlightTLD = true }) {
  if (!domain) return null;
  
  const theme = useTheme();
  const isDark = theme === "dark";

  const getDomainParts = (domainName) => {
    const lastDotIndex = domainName.lastIndexOf('.');
    if (lastDotIndex === -1) return { base: domainName, tld: '' };
    return {
      base: domainName.substring(0, lastDotIndex),
      tld: domainName.substring(lastDotIndex) // includes the dot
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
    console.log('[DomainCard] Select clicked:', domain.name);
    const godaddyUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain.name)}`;
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    const godaddyUrl = buildAddToCartUrl(domain.name, domain.tld);
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`min-w-[280px] select-none max-w-[280px] w-[75vw] sm:w-[280px] self-stretch flex flex-col border rounded-lg px-4 py-5 ${
        isDark 
          ? 'bg-[#1a1d29]/60 border-white/10' 
          : 'bg-white border-gray-200'
      }`}
      role="article"
      aria-label={`Domain ${domain.name}`}
    >
      {showImage && (
        <div className="relative w-full mb-1">
          <img
            src={domain.image}
            alt={`${domain.name} domain preview`}
            className="w-full h-[150px] object-cover rounded-lg ring-1 ring-black/10 shadow-sm"
          />
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
      
      {!showImage && showAvailableBadge && domain.badge && (
        <span
          className="inline-block bg-[#FFF4CC] text-[#5C4A1F] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded self-start mb-2"
          aria-label="Domain status"
        >
          {domain.badge}
        </span>
      )}

      <div className={`${showImage ? 'mt-3' : ''} flex flex-col flex-1`}>
        <h3 className={`text-xl font-semibold truncate mb-3 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {highlightTLD ? (
            <>
              <span>{base}</span>
              <span className={isDark ? 'text-[#4a9eff]' : 'text-[#00a4a6]'}>{tld}</span>
            </>
          ) : (
            domain.name
          )}
        </h3>

        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
            {domain.originalPrice && (
              <span
                className={`text-xs line-through ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
                aria-label={`Original price ${domain.originalPrice}`}
              >
                {domain.originalPrice}
              </span>
            )}
            <span className={`text-md font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {domain.price}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-[10px] font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>{domain.period}</span>
            <button
              type="button"
              aria-label="Pricing information"
              className={`focus:outline-none focus:ring-2 focus:ring-offset-1 rounded cursor-pointer ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-300 focus:ring-blue-500' 
                  : 'text-gray-500 hover:text-gray-600 focus:ring-gray-300'
              }`}
            >
              <Info className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

        <div className="mt-auto pt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelect}
            className={`group relative flex-1 transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm font-medium px-4 py-2.5 rounded-sm min-h-[44px] cursor-pointer overflow-hidden flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-[#0071c2] text-white hover:bg-[#006bb3] active:bg-[#005999] focus:ring-[#0071c2]'
                : 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-900'
            }`}
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

