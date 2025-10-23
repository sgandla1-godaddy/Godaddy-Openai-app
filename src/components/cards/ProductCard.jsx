import React from "react";
import { ChevronRight, Shield, Globe, Mail, ShoppingCart, ExternalLink, Maximize } from "lucide-react";
import { useTheme } from "../../use-theme";

// Icon mapping for product categories
const iconMap = {
  shield: Shield,
  globe: Globe,
  mail: Mail,
};

export default function ProductCard({ product, variant = "default" }) {
  if (!product) return null;

  const theme = useTheme();
  const isDark = theme === "dark";
  const Icon = iconMap[product.icon] || Globe;

  const handleLearnMore = () => {
    console.log('[ProductCard] Learn more clicked:', product.id);
    window.open(product.learnMoreUrl, '_blank', 'noopener,noreferrer');
  };

  const handleViewProduct = () => {
    console.log('[ProductCard] View product clicked:', product.id);
    // TODO: Implement product view functionality
    window.open(product.learnMoreUrl, '_blank', 'noopener,noreferrer');
  };

  const handleViewMore = () => {
    console.log('[ProductCard] View more clicked:', product.id, 'category:', product.category);
    console.log('[ProductCard] Opening fullscreen for category:', product.category);
    
    // Set filter on window object immediately
    window.productsFilter = product.category;
    console.log('[ProductCard] Set window.productsFilter to:', product.category);
    
    // Try widget state as well
    if (window.webplus && window.webplus.setWidgetState) {
      console.log('[ProductCard] Setting widget state filter to:', product.category);
      window.webplus.setWidgetState({ 
        filter: product.category
      });
      console.log('[ProductCard] Widget state set, current state:', window.webplus.getWidgetState?.());
    }
    
    // Open fullscreen immediately
    if (window.webplus && window.webplus.requestDisplayMode) {
      console.log('[ProductCard] Requesting fullscreen mode');
      window.webplus.requestDisplayMode({ mode: "fullscreen" });
    } else {
      console.log('[ProductCard] No webplus API available');
    }
  };

  const handleSeePlans = () => {
    console.log('[ProductCard] See plans clicked:', product.id);
    console.log('[ProductCard] Redirecting to:', product.learnMoreUrl);
    window.open(product.learnMoreUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    console.log('[ProductCard] Add to cart clicked:', product.id);
    // TODO: Implement add to cart functionality
    // This would typically trigger a tool call to add the product to cart
    if (window?.openai?.callTool) {
      window.openai.callTool('add_product_to_cart', { 
        productId: product.id,
        productName: product.name,
        price: product.price
      });
    }
  };

  // Different card layouts based on variant
  if (variant === "compact") {
    return (
      <div className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
        isDark
          ? 'bg-[#1a1d29]/60 border-white/10'
          : 'bg-white border-gray-200'
      }`}>
        {/* Product Image at Top */}
        {product.visual && (
          <div>
            <img
              src={product.visual}
              alt={`${product.name} visual`}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        
        <div className="p-4">
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
            {/* Pricing and Actions - Inline Layout */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                {product.isCategoryPreview ? (
                  <>
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Starting at</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xl font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${product.categoryLowestPrice}
                      </span>
                      <span className={`text-xs ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>{product.period}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    {product.originalPrice && (
                      <span className={`text-xs line-through ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {product.originalPrice}
                      </span>
                    )}
                    <span className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {product.price}
                    </span>
                    <span className={`text-xs ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>{product.period}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={handleViewMore}
                  className={`text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[40px] cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
                    isDark
                      ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-500'
                      : 'bg-black hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-600'
                  }`}
                  aria-label={`View more ${product.name} plans`}
                >
                  See Plans
                  {/* <Maximize className="w-4 h-4 ml-1" aria-hidden="true" /> */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default full card layout (matching GoDaddy design patterns)
  return (
    <div className={`relative border rounded-lg p-6 hover:shadow-lg transition-all duration-200 flex flex-col ${
      isDark
        ? 'bg-[#1a1d29]/60 border-white/10'
        : 'bg-white border-gray-200'
    }`}>
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
          product.badge === 'RECOMMENDED' || product.badge === 'FULLY MANAGED'
            ? 'bg-yellow-400 text-gray-900'
            : isDark
            ? 'bg-[#4a9eff] text-white'
            : 'bg-[#00a4a6] text-white'
        }`}>
          {product.badge}
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1">
        {/* Product Visual and Title */}
        <div className="mb-4">
          {/* Product Visual */}
          {product.visual && (
            <div className="mb-4">
              <img
                src={product.visual}
                alt={`${product.name} visual`}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Title and Tags */}
          <div className="flex items-start gap-4">
            {!product.visual && (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-[#20c997]/10' : 'bg-[#20c997]/10'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isDark ? 'text-[#20c997]' : 'text-[#20c997]'
                }`} aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {product.name}
              </h3>
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm mb-4 leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {product.description}
        </p>

        {/* Learn More Link */}
        <div className="mb-3">
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
            Learn more on GoDaddy.com
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Bottom Section - Pricing and Add to Cart */}
      <div className="flex items-end justify-between gap-4">
        {/* Pricing Section */}
        <div className="flex-1 min-w-0">
          <div className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-2 ${
            isDark ? 'bg-yellow-400/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
          }`}>
            AS LOW AS
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            {product.originalPrice && (
              <span className={`text-sm line-through ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {product.originalPrice}
              </span>
            )}
            <span className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {product.price}
            </span>
            <span className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {product.period}
            </span>
          </div>
          {product.savings && (
            <p className={`text-xs ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {product.savings}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-11 h-11 border-2 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
              isDark
                ? 'border-white/20 hover:bg-white/10 active:bg-white/20 focus:ring-blue-500'
                : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-600'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className={`w-5 h-5 ${
              isDark ? 'text-white' : 'text-gray-700'
            }`} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
