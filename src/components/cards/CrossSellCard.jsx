import React from "react";
import { ChevronRight } from "lucide-react";
import { useTheme } from "../../use-theme";

export default function CrossSellCard({ product }) {
  if (!product) return null;

  const theme = useTheme();
  const isDark = theme === "dark";
  const Icon = product.icon;

  const handleLearnMore = () => {
    console.log('[CrossSellCard] Learn more clicked:', product.id);
    window.open(product.learnMoreUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isDark
        ? 'bg-[#1a1d29]/60 border-white/10'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isDark ? 'bg-[#4a9eff]/10' : 'bg-[#00a4a6]/10'
        }`}>
          <Icon className={`w-5 h-5 ${
            isDark ? 'text-[#4a9eff]' : 'text-[#00a4a6]'
          }`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-base font-semibold mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {product.name}
          </h4>
          <p className={`text-sm mb-3 line-clamp-2 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {product.description}
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            {product.originalPrice && (
              <span className={`text-xs line-through ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {product.originalPrice}
              </span>
            )}
            <span className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {product.price}
            </span>
            <span className={`text-xs ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>{product.period}</span>
          </div>
          <button
            type="button"
            onClick={handleLearnMore}
            className={`inline-flex items-center gap-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 rounded cursor-pointer ${
              isDark
                ? 'text-white hover:text-[#4a9eff] focus:ring-blue-500'
                : 'text-gray-900 hover:text-[#00a4a6] focus:ring-gray-300'
            }`}
            aria-label={`Learn more about ${product.name}`}
          >
            Learn more
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}


