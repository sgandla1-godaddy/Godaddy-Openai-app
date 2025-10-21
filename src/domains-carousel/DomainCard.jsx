import React from "react";
import { ShoppingCart, Info } from "lucide-react";

/**
 * DomainCard Component
 * Follows OpenAI Apps SDK design guidelines and GoDaddy brand standards
 * 
 * Design Rules:
 * - Max 2 CTAs per card
 * - System fonts only
 * - WCAG AA contrast compliance
 * - Touch targets >= 44x44px
 * - No nested scrolling
 */
export default function DomainCard({ domain }) {
  if (!domain) return null;

  const handleSelect = () => {
    // Track telemetry
    console.log('[DomainCard] Select clicked:', domain.name);
    
    // TODO: Trigger tool call via window.openai.callTool
    // window.openai.callTool('select_domain', { domainName: domain.name });
  };

  const handleAddToCart = () => {
    // Track telemetry
    console.log('[DomainCard] Add to cart clicked:', domain.name);
    
    // TODO: Trigger tool call via window.openai.callTool
    // window.openai.callTool('add_to_cart', { domainName: domain.name });
  };

  return (
    <div 
      className="min-w-[280px] select-none max-w-[280px] w-[75vw] sm:w-[280px] self-stretch flex flex-col"
      role="article"
      aria-label={`Domain ${domain.name}`}
    >
      {/* Domain Image with Badge */}
      <div className="relative w-full">
        <img
          src={domain.image}
          alt={`${domain.name} domain preview`}
          className="w-full h-[140px] object-cover rounded-lg ring-1 ring-black/10 shadow-sm"
        />
        {domain.badge && (
          <span 
            className="absolute top-2 left-2 bg-[#FFC107] text-gray-900 text-xs font-semibold px-2 py-1 rounded"
            aria-label="Domain status"
          >
            {domain.badge}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="mt-3 flex flex-col flex-1">
        {/* Domain Name */}
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {domain.name}
        </h3>

        {/* Description */}
        {domain.description && (
          <p className="text-sm mt-1 text-gray-600 line-clamp-2 leading-relaxed">
            {domain.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-2">
          {domain.originalPrice && (
            <span 
              className="text-sm text-gray-500 line-through"
              aria-label={`Original price ${domain.originalPrice}`}
            >
              {domain.originalPrice}
            </span>
          )}
          <span className="text-xl font-semibold text-gray-900">
            {domain.price}
          </span>
        </div>
        
        {/* Period with info icon */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-600">{domain.period}</span>
          <button
            type="button"
            aria-label="Pricing information"
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded"
          >
            <Info className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        {/* Domain Metrics (Optional) */}
        {domain.metrics && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Object.entries(domain.metrics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-xs text-gray-600 capitalize mb-1">
                  {key}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {value}/5
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs - Max 2 per design rules */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          {/* Primary CTA - Black button (GoDaddy brand) */}
          <button
            type="button"
            onClick={handleSelect}
            className="flex-1 bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 min-h-[44px]"
            aria-label={`Select ${domain.name}`}
          >
            Select
          </button>

          {/* Secondary CTA - Cart icon button (GoDaddy pattern) */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-[44px] h-[44px] border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            aria-label={`Add ${domain.name} to cart`}
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

