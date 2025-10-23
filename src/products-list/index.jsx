import React from "react";
import { createRoot } from "react-dom/client";
import useEmblaCarousel from "embla-carousel-react";
import { Maximize2, Filter, X, ArrowLeft, ArrowRight } from "lucide-react";
import productsData from "../mocks/products-list.json";
import ProductCard from "../components/cards/ProductCard";
import CardSkeleton from "../components/cards/CardSkeleton";
import { useWidgetProps } from "../use-widget-props";
import { useOpenAiGlobal } from "../use-openai-global";
import { useMaxHeight } from "../use-max-height";
import { useTheme } from "../use-theme";

function App() {
  // Theme support
  const theme = useTheme();
  const isDark = theme === "dark";

  // Feature flags
  const useMockData = true;
  const previewLimit = 3; // Number of products to show in preview mode
  
  // Get data from MCP server via window.openai.toolOutput
  const toolOutput = useWidgetProps();
  const products = toolOutput?.products || (useMockData ? productsData?.products : []) || [];
  const selectedCategory = toolOutput?.category || null;
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState(selectedCategory);
  
  // Display mode and height management
  const displayMode = useOpenAiGlobal("displayMode");
  const maxHeight = useMaxHeight() ?? undefined;
  const isFullscreen = displayMode === "fullscreen";
  
  // Check for filter from widget state (set by "See Plans" button)
  React.useEffect(() => {
    console.log('[GodaddyProducts] useEffect triggered - isFullscreen:', isFullscreen);
    console.log('[GodaddyProducts] Current activeFilter:', activeFilter);
    
    let filterToApply = null;
    
    // Try widget state first
    if (window.webplus && window.webplus.getWidgetState && isFullscreen) {
      const widgetState = window.webplus.getWidgetState();
      console.log('[GodaddyProducts] Widget state:', widgetState);
      if (widgetState?.filter) {
        filterToApply = widgetState.filter;
      }
    }
    
    // Fallback to window object
    if (!filterToApply && window.productsFilter && isFullscreen) {
      console.log('[GodaddyProducts] Using window.productsFilter:', window.productsFilter);
      filterToApply = window.productsFilter;
      // Clear it after reading
      window.productsFilter = null;
    }
    
    if (filterToApply && isFullscreen) {
      // Map filter to category name
      const filterMap = {
        'ssl': 'ssl',
        'ssl-certificates': 'ssl',
        'website': 'website',
        'website-builder': 'website',
        'email': 'email',
        'email-hosting': 'email'
      };
      const categoryName = filterMap[filterToApply] || filterToApply;
      console.log('[GodaddyProducts] Setting filter to:', categoryName);
      setActiveFilter(categoryName);
    } else {
      console.log('[GodaddyProducts] No filter found or not fullscreen');
    }
  }, [isFullscreen]);
  
  // Carousel setup for preview mode
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    dragFree: false,
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);
  
  // Filter products by category (only in fullscreen mode)
  const filteredProducts = (activeFilter && isFullscreen)
    ? products.filter(product => product.category === activeFilter)
    : products;
  
  console.log('[GodaddyProducts] Filtering products - activeFilter:', activeFilter, 'isFullscreen:', isFullscreen);
  console.log('[GodaddyProducts] Total products:', products.length);
  console.log('[GodaddyProducts] Filtered products:', filteredProducts.length);
  console.log('[GodaddyProducts] Filtered product categories:', filteredProducts.map(p => p.category));
  
  // Determine which products to show based on mode
  const displayedProducts = isFullscreen 
    ? filteredProducts 
    : (() => {
          // Show one product from each category in preview mode with lowest price
          const categoryProducts = {};
          const categoryLowestPrices = {};
          
          // Find lowest price for each category
          products.forEach(product => {
            const price = parseFloat(product.price.replace('$', ''));
            if (!categoryLowestPrices[product.category] || price < categoryLowestPrices[product.category]) {
              categoryLowestPrices[product.category] = price;
            }
          });
          
          // Get one product from each category and add lowest price info
          products.forEach(product => {
            if (!categoryProducts[product.category]) {
              categoryProducts[product.category] = {
                ...product,
                isCategoryPreview: true,
                categoryLowestPrice: categoryLowestPrices[product.category]
              };
            }
          });
          return Object.values(categoryProducts);
        })();
  const hasMore = filteredProducts.length > previewLimit;

  // Stop loading when products are available
  React.useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    }
  }, [products]);

  // Track carousel state for navigation
  React.useEffect(() => {
    if (!emblaApi) return;
    
    const updateButtons = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    
    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    console.log('[GodaddyProducts] Initialized with', products.length, 'products');
    console.log('[GodaddyProducts] Display mode:', displayMode);
    console.log('[GodaddyProducts] Active filter:', activeFilter);
  }, [products.length, displayMode, activeFilter]);
  
  const handleExpandToFullscreen = () => {
    console.log('[GodaddyProducts] Expand button clicked');
    console.log('[GodaddyProducts] window.webplus exists:', !!window?.webplus);
    
    if (window?.webplus?.requestDisplayMode) {
      console.log('[GodaddyProducts] Calling requestDisplayMode');
      window.webplus.requestDisplayMode({ mode: "fullscreen" });
    } else {
      console.warn('[GodaddyProducts] window.webplus.requestDisplayMode not available. This component only works in ChatGPT environment.');
    }
  };

  const handleCategoryFilter = (categoryId) => {
    console.log('[GodaddyProducts] Category filter changed:', categoryId);
    setActiveFilter(categoryId === activeFilter ? null : categoryId);
  };

  const clearFilter = () => {
    console.log('[GodaddyProducts] Filter cleared');
    setActiveFilter(null);
  };

  const handlePrevious = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      console.log('[GodaddyProducts] Previous clicked');
    }
  };

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      console.log('[GodaddyProducts] Next clicked');
    }
  };

  return (
    <div
      style={{
        maxHeight: isFullscreen ? maxHeight : undefined,
        minHeight: isFullscreen ? maxHeight : undefined,
      }}
      className={
        `antialiased relative w-full px-4 overflow-auto ${
          isDark
            ? 'bg-[#1a1d29] text-white'
            : 'bg-white text-gray-900'
        } ` +
        (isFullscreen
          ? "rounded-none border-0 pb-24"
          : `border rounded-2xl sm:rounded-3xl pb-4 ${
              isDark ? 'border-white/10' : 'border-black/10'
            }`)
      }
      role="main"
      aria-label="GoDaddy products"
    >
      <div className="max-w-full">
        {/* Header */}
        <div className={`sticky top-0 z-10 border-b py-4 -mx-4 px-4 ${
          isDark
            ? 'bg-[#1a1d29] border-white/5'
            : 'bg-white border-black/5'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              {!isLoading && (
                <h1 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  GoDaddy Products
                </h1>
              )}
              {isLoading && (
                <div className={`animate-pulse ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                } h-6 w-40 rounded mb-1`} />
              )}
              {!isLoading && (
                <p className={`text-sm mt-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {isFullscreen 
                    ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} available`
                    : `Showing ${displayedProducts.length} of ${filteredProducts.length} products`
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters (fullscreen only) */}
        {isFullscreen && !isLoading && (
          <div className={`py-4 border-b ${
            isDark ? 'border-white/5' : 'border-black/5'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Filter className={`w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Filter by category:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearFilter}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !activeFilter
                    ? isDark
                      ? 'bg-[#4a9eff] text-white'
                      : 'bg-[#00a4a6] text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              {productsData.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === category.id
                      ? isDark
                        ? 'bg-[#4a9eff] text-white'
                        : 'bg-[#00a4a6] text-white'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {activeFilter && (
              <div className="mt-2">
                <button
                  onClick={clearFilter}
                  className={`inline-flex items-center gap-1 text-xs ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-3 h-3" />
                  Clear filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Display */}
        <div className="min-w-full">
          {isLoading ? (
            // Show skeleton cards while loading
            isFullscreen ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {Array.from({ length: previewLimit }, (_, index) => (
                  <CardSkeleton
                    key={`skeleton-${index}`}
                    variant="product"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4 items-stretch" role="list">
                  {Array.from({ length: previewLimit }, (_, index) => (
                    <div key={`skeleton-${index}`} role="listitem" className="min-w-[280px] max-w-[280px] w-[75vw] sm:w-[280px]">
                      <CardSkeleton variant="product" />
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : displayedProducts.length > 0 ? (
             isFullscreen ? (
               // Fullscreen: Grid layout with subcategory headings
               activeFilter === 'website' ? (
                 <div className="py-6 space-y-8">
                   {/* Website Builder Section */}
                   <div>
                     <h3 className={`text-xl font-bold mb-6 pb-2 border-b ${
                       isDark 
                         ? 'text-white border-gray-600' 
                         : 'text-gray-900 border-gray-300'
                     }`}>
                       Website Builder
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {displayedProducts
                         .filter(product => product.type === 'website-builder')
                         .map((product) => (
                           <ProductCard
                             key={product.id}
                             product={product}
                             variant="default"
                           />
                         ))}
                     </div>
                   </div>

                   {/* WordPress Hosting Section */}
                   <div>
                     <h3 className={`text-xl font-bold mb-6 pb-2 border-b ${
                       isDark 
                         ? 'text-white border-gray-600' 
                         : 'text-gray-900 border-gray-300'
                     }`}>
                       Managed Hosting for WordPress
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {displayedProducts
                         .filter(product => product.type === 'wordpress-hosting')
                         .map((product) => (
                           <ProductCard
                             key={product.id}
                             product={product}
                             variant="default"
                           />
                         ))}
                     </div>
                   </div>

                   {/* WooCommerce Hosting Section */}
                   <div>
                     <h3 className={`text-xl font-bold mb-6 pb-2 border-b ${
                       isDark 
                         ? 'text-white border-gray-600' 
                         : 'text-gray-900 border-gray-300'
                     }`}>
                       Managed Hosting for WooCommerce
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {displayedProducts
                         .filter(product => product.type === 'woocommerce-hosting')
                         .map((product) => (
                           <ProductCard
                             key={product.id}
                             product={product}
                             variant="default"
                           />
                         ))}
                     </div>
                   </div>
                 </div>
               ) : activeFilter === 'ssl-security' ? (
                 <div className="py-6 space-y-8">
                   {/* SSL Certificates Section */}
                   <div>
                     <h3 className={`text-xl font-bold mb-6 pb-2 border-b ${
                       isDark 
                         ? 'text-white border-gray-600' 
                         : 'text-gray-900 border-gray-300'
                     }`}>
                       SSL Certificates
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {displayedProducts
                         .filter(product => product.category === 'ssl-security' && !product.id.includes('managed') && !product.id.includes('security'))
                         .map((product) => (
                           <ProductCard
                             key={product.id}
                             product={product}
                             variant="default"
                           />
                         ))}
                     </div>
                   </div>

                   {/* Managed SSL Section */}
                   <div>
                     <h3 className={`text-xl font-bold mb-6 pb-2 border-b ${
                       isDark 
                         ? 'text-white border-gray-600' 
                         : 'text-gray-900 border-gray-300'
                     }`}>
                       Managed SSL
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {displayedProducts
                         .filter(product => product.category === 'ssl-security' && product.id.includes('managed'))
                         .map((product) => (
                           <ProductCard
                             key={product.id}
                             product={product}
                             variant="default"
                           />
                         ))}
                     </div>
                   </div>

                   {/* Web Security Section */}
                   <div>
                     <h3 className={`text-xl font-bold mb-6 pb-2 border-b ${
                       isDark 
                         ? 'text-white border-gray-600' 
                         : 'text-gray-900 border-gray-300'
                     }`}>
                       Web Security
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {displayedProducts
                         .filter(product => product.category === 'ssl-security' && product.id.includes('security'))
                         .map((product) => (
                           <ProductCard
                             key={product.id}
                             product={product}
                             variant="default"
                           />
                         ))}
                     </div>
                   </div>
                 </div>
               ) : (
                 // Regular grid layout for other categories with main category heading
                 <div className="py-6">
                   <h3 className={`text-xl font-bold mb-6 pb-2 border-b ${
                     isDark 
                       ? 'text-white border-gray-600' 
                       : 'text-gray-900 border-gray-300'
                   }`}>
                     {productsData.categories.find(c => c.id === activeFilter)?.name}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {displayedProducts.map((product) => (
                       <ProductCard
                         key={product.id}
                         product={product}
                         variant="default"
                       />
                     ))}
                   </div>
                 </div>
               )
            ) : (
              // Preview: Carousel layout
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-4 items-stretch" role="list">
                    {displayedProducts.map((product) => (
                      <div key={product.id} role="listitem" className="min-w-[280px] max-w-[280px] w-[75vw] sm:w-[280px]">
                        <ProductCard
                          product={product}
                          variant="compact"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Navigation Buttons */}
                {!isLoading && canPrev && (
                  <button
                    aria-label="View previous products"
                    className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full ring-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                      isDark
                        ? 'bg-[#252935] text-white ring-white/10 hover:bg-[#2d3142] active:bg-[#2d3142] focus:ring-blue-500 shadow-lg'
                        : 'bg-white text-gray-500 ring-black/5 hover:text-gray-900 active:bg-gray-50 focus:ring-gray-600'
                    }`}
                    onClick={handlePrevious}
                    type="button"
                  >
                    <ArrowLeft
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                )}
                {!isLoading && canNext && (
                  <button
                    aria-label="View next products"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full ring-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                      isDark
                        ? 'bg-[#252935] text-white ring-white/10 hover:bg-[#2d3142] active:bg-[#2d3142] focus:ring-blue-500 shadow-lg'
                        : 'bg-white text-gray-500 ring-black/5 hover:text-gray-900 active:bg-gray-50 focus:ring-gray-600'
                    }`}
                    onClick={handleNext}
                    type="button"
                  >
                    <ArrowRight
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                )}

                {/* Edge Gradient Indicators */}
                <div
                  aria-hidden="true"
                  className={
                    "pointer-events-none absolute inset-y-0 left-0 w-8 z-[5] transition-opacity duration-200 " +
                    (canPrev ? "opacity-100" : "opacity-0")
                  }
                >
                  <div
                    className={`h-full w-full ${
                      isDark 
                        ? 'bg-gradient-to-r from-[#212121] to-transparent'
                        : 'bg-gradient-to-r from-white to-transparent'
                    }`}
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
                      maskImage:
                        "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
                    }}
                  />
                </div>
                <div
                  aria-hidden="true"
                  className={
                    "pointer-events-none absolute inset-y-0 right-0 w-8 z-[5] transition-opacity duration-200 " +
                    (canNext ? "opacity-100" : "opacity-0")
                  }
                >
                  <div
                    className={`h-full w-full ${
                      isDark
                        ? 'bg-gradient-to-l from-[#212121] to-transparent'
                        : 'bg-gradient-to-l from-white to-transparent'
                    }`}
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
                      maskImage:
                        "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
                    }}
                  />
                </div>
              </div>
            )
          ) : (
            <div className={`py-8 text-center ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {activeFilter 
                ? `No products found in ${productsData.categories.find(c => c.id === activeFilter)?.name} category.`
                : 'No products found.'
              }
            </div>
          )}
          
          {/* Show more button (preview mode only) */}
          {!isFullscreen && !isLoading && hasMore && (
            <div className={`py-4 text-center border-t ${
              isDark ? 'border-white/5' : 'border-black/5'
            }`}>
              <button
                onClick={handleExpandToFullscreen}
                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'text-white hover:text-[#4a9eff]'
                    : 'text-gray-900 hover:text-[#00a4a6]'
                }`}
              >
                View all {filteredProducts.length} products
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("products-list-root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('[GodaddyProducts] Root element "products-list-root" not found');
}
