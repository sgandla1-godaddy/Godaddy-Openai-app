import React from "react";
import { createRoot } from "react-dom/client";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "../components/cards/ProductCard";
import CardSkeleton from "../components/cards/CardSkeleton";
import { useWidgetProps } from "../use-widget-props";
import { useTheme } from "../use-theme";

function App() {
  // Theme support
  const theme = useTheme();
  const isDark = theme === "dark";

  // Feature flags
  const useMock = false; // Disable mock data fallback for products-recommend
  // Get data from MCP server via window.openai.toolOutput
  const toolOutput = useWidgetProps();
  const products = toolOutput?.products || [];
  const productCategory = toolOutput?.category || "email";
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Show all products in carousel
  const displayedProducts = products;

  // Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    dragFree: false,
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

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
    
    // Telemetry
    console.log('[ProductsRecommend] Initialized with', products.length, 'products');
    console.log('[ProductsRecommend] Product category:', productCategory);
    
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, products.length, productCategory]);


  const handlePrevious = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      console.log('[ProductsRecommend] Previous clicked');
    }
  };

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      console.log('[ProductsRecommend] Next clicked');
    }
  };

  return (
    <div
      className={`antialiased relative w-full py-5 ${
        isDark 
          ? 'bg-transparent text-white' 
          : 'bg-transparent text-gray-900'
      }`}
      role="region"
      aria-label="Recommended product plans"
    >
      {/* Search Context Header */}
      {!isLoading && productCategory && (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {productCategory === 'email' ? 'Email Plans' : 'Recommended Products'}
          </h2>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {products.length} plan{products.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 items-stretch" role="list">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} role="listitem" className="min-w-[320px] max-w-[320px] w-[85vw] sm:w-[320px] h-full">
                <CardSkeleton variant="product" />
              </div>
            ))
          ) : (
            // Show actual product cards when loaded
            displayedProducts.map((product) => (
              <div key={product.id} role="listitem" className="min-w-[320px] max-w-[320px] w-[85vw] sm:w-[320px] h-full">
                <ProductCard
                  product={product}
                  variant="default"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edge Gradient Indicators - Show scroll affordance */}
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

      {/* Navigation Buttons - Keyboard and mouse accessible */}
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
    </div>
  );
}

// Initialize the app - NOTE: Different root ID for products-recommend
const rootElement = document.getElementById("products-recommend-root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('[ProductsRecommend] Root element "products-recommend-root" not found');
}
