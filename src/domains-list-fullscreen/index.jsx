import React from "react";
import { createRoot } from "react-dom/client";
import { Globe, Mail, Shield, Maximize2 } from "lucide-react";
import domainsData from "../mocks/domains.json";
import crossSellData from "../mocks/cross-sell-products.json";
import DomainListCard from "../components/cards/DomainListCard";
import CrossSellCard from "../components/cards/CrossSellCard";
import { useWidgetProps } from "../use-widget-props";
import { useOpenAiGlobal } from "../use-openai-global";
import { useMaxHeight } from "../use-max-height";
import { useTheme } from "../use-theme";

// Icon mapping for cross-sell products
const iconMap = {
  globe: Globe,
  mail: Mail,
  shield: Shield,
};

// Map icon strings to components
const crossSellProducts = crossSellData.products.map(product => ({
  ...product,
  icon: iconMap[product.icon] || Globe,
}));

function App() {
  // Theme support
  const theme = useTheme();
  const isDark = theme === "dark";

  // Feature flags
  const useMockData = false;
  const showDomainImages = false;
  const previewLimit = 2; // Number of domains to show in preview mode
  
  // Get data from MCP server via window.openai.toolOutput
  // Both carousel and list view receive the same toolOutput from ChatGPT
  const toolOutput = useWidgetProps();
  const domains = toolOutput?.domains || (useMockData ? domainsData?.domains : []) || [];
  const searchKeywords = toolOutput?.searchKeywords || domainsData?.query;
  const totalResults = toolOutput?.totalResults || domains.length;
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Display mode and height management
  const displayMode = useOpenAiGlobal("displayMode");
  const maxHeight = useMaxHeight() ?? undefined;
  const isFullscreen = displayMode === "fullscreen";
  
  // Determine which domains to show based on mode
  const displayedDomains = isFullscreen ? domains : domains.slice(0, previewLimit);
  const hasMore = domains.length > previewLimit;

  React.useEffect(() => {
    console.log('[DomainsListFullscreen] Initialized with', domains.length, 'domains');
    console.log('[DomainsListFullscreen] Display mode:', displayMode);
    if (searchKeywords) {
      console.log('[DomainsListFullscreen] Search keywords:', searchKeywords);
    }
  }, [domains.length, searchKeywords, displayMode]);
  
  const handleExpandToFullscreen = () => {
    console.log('[DomainsListFullscreen] Expand button clicked');
    console.log('[DomainsListFullscreen] window.webplus exists:', !!window?.webplus);
    
    if (window?.webplus?.requestDisplayMode) {
      console.log('[DomainsListFullscreen] Calling requestDisplayMode');
      window.webplus.requestDisplayMode({ mode: "fullscreen" });
    } else {
      console.warn('[DomainsListFullscreen] window.webplus.requestDisplayMode not available. This component only works in ChatGPT environment.');
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
      aria-label="Domain search results"
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
              <h1 className={`text-xl sm:text-2xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Available Domains
              </h1>
              {searchKeywords && (
                <p className={`text-sm mt-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {isFullscreen 
                    ? `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchKeywords}"`
                    : `Showing ${displayedDomains.length} of ${totalResults} results for "${searchKeywords}"`
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Domain List */}
        <div className="min-w-full flex flex-col">
          {isLoading ? (
            <div className={`py-8 text-center ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading domains...
            </div>
          ) : displayedDomains.length > 0 ? (
            displayedDomains.map((domain) => (
              <DomainListCard
                key={domain.id}
                domain={domain}
                showImage={showDomainImages}
              />
            ))
          ) : (
            <div className={`py-8 text-center ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No domains found.
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
                View all {totalResults} domains
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Cross-sells Section (fullscreen only) */}
        {isFullscreen && !isLoading && domains.length > 0 && (
          <div className={`mt-8 pt-6 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Complete Your Setup
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {crossSellProducts.map((product) => (
                <CrossSellCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const rootElement = document.getElementById("domains-list-fullscreen-root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('[DomainsListFullscreen] Root element "domains-list-fullscreen-root" not found');
}
