import React from "react";
import { createRoot } from "react-dom/client";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import domainsData from "../mocks/domains.json";
import DomainCard from "../components/cards/DomainCard";
import CardSkeleton from "../components/cards/CardSkeleton";
import ActionLink from "../components/ActionLink";
import { useWidgetProps } from "../use-widget-props";

function App() {
  // Feature flag to use mock data for local development
  const useMockData = false;
  // Get data from MCP server via window.openai.toolOutput
  const toolOutput = useWidgetProps();
  const domains = toolOutput?.domains || (useMockData ? domainsData?.domains : []) || [];
  const searchKeywords = toolOutput?.searchKeywords;
  const totalResults = toolOutput?.totalResults;
  const [isLoading, setIsLoading] = React.useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    dragFree: false,
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  // Stop loading when domains are available
  React.useEffect(() => {
    if (domains && domains.length > 0) {
      setIsLoading(false);
    }
  }, [domains]);

  // Track carousel state for telemetry
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
    console.log('[DomainCarousel] Initialized with', domains.length, 'domains');
    if (searchKeywords) {
      console.log('[DomainCarousel] Search keywords:', searchKeywords);
    }
    
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, domains.length]);

  const handleShowMore = () => {
    // Track telemetry
    console.log('[DomainCarousel] Show more clicked');
    
    // TODO: Trigger tool call to load more domains
    // window.openai.callTool('load_more_domains', { skip: domains.length });
  };

  const handlePrevious = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      console.log('[DomainCarousel] Previous clicked');
    }
  };

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      console.log('[DomainCarousel] Next clicked');
    }
  };

  return (
    <div 
      className="antialiased relative w-full text-gray-900 py-5 bg-white"
      role="region"
      aria-label="Available domain names carousel"
    >
      {/* Search Context Header */}
      {!isLoading && searchKeywords && (
        <div className="mb-4 px-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Domain options for "{searchKeywords}"
          </h2>
          {totalResults && (
            <p className="text-sm text-gray-600 mt-1">
              Found {totalResults} available domain{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 max-sm:mx-5 items-stretch" role="list">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} role="listitem">
                <CardSkeleton variant="domain" />
              </div>
            ))
          ) : (
            // Show actual domain cards when loaded
            domains.map((domain) => (
              <div key={domain.id} role="listitem">
                <DomainCard domain={domain} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edge Gradient Indicators - Show scroll affordance */}
      <div
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-y-0 left-0 w-3 z-[5] transition-opacity duration-200 " +
          (canPrev ? "opacity-100" : "opacity-0")
        }
      >
        <div
          className="h-full w-full border-l border-black/15 bg-gradient-to-r from-black/10 to-transparent"
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
          "pointer-events-none absolute inset-y-0 right-0 w-3 z-[5] transition-opacity duration-200 " +
          (canNext ? "opacity-100" : "opacity-0")
        }
      >
        <div
          className="h-full w-full border-r border-black/15 bg-gradient-to-l from-black/10 to-transparent"
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
          aria-label="View previous domains"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:text-gray-900 active:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
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
          aria-label="View next domains"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-black/5 hover:text-gray-900 active:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 cursor-pointer"
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

      {/* Show more results button */}
      {!isLoading && (
        <div className="mt-4 flex justify-center">
          <ActionLink
            onClick={handleShowMore}
            ariaLabel="Show more domain results"
          >
            Show more results
          </ActionLink>
        </div>
      )}
    </div>
  );
}

// Initialize the app - NOTE: Different root ID for domains-carousel
const rootElement = document.getElementById("domains-carousel-root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('[DomainCarousel] Root element "domains-carousel-root" not found');
}

