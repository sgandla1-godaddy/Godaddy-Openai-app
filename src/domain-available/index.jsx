import React from "react";
import { createRoot } from "react-dom/client";
import domainsData from "../mocks/domains-available.json";
import FeaturedDomain from "../components/cards/FeaturedDomain";
import BundleCard from "../components/cards/BundleCard";
import CardSkeleton from "../components/cards/CardSkeleton";
import ActionLink from "../components/ActionLink";
import { useTheme } from "../use-theme";

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const theme = useTheme();
  const isDark = theme === "dark";
  const allDomains = domainsData?.domains || [];
  const featuredDomain = allDomains.find(d => d.isRequested) || allDomains[0];
  const moreDomains = allDomains.filter(d => !d.isRequested && d.available);
  
  const domainBase = featuredDomain?.name.split('.')[0] || 'domain';
  const bundleTlds = ['.net', '.info', '.store', '.shop'];
  const bundle = {
    domainBase: domainBase,
    tlds: bundleTlds,
    price: '$16.13',
    originalPrice: '$202.96',
    period: 'for first year',
    savingsPercent: 92,
    description: `Protect your business from copycats by registering these popular endings: ${bundleTlds.join(', ').toUpperCase()}.`
  };

  React.useEffect(() => {
    console.log('[DomainAvailable] Initialized with featured domain +', moreDomains.length, 'more domains');
  }, [moreDomains.length]);

  return (
    <div 
      className={`antialiased w-full py-8 ${
        isDark 
          ? 'bg-transparent text-white' 
          : 'bg-transparent text-gray-900'
      }`} 
      role="main"
    >
      <div className="flex flex-wrap justify-center gap-6 px-6">
        <div className="w-full max-w-[340px]">
          {isLoading ? (
            <CardSkeleton variant="featured" />
          ) : (
            <FeaturedDomain domain={featuredDomain} />
          )}
        </div>
        
        <div className="w-full max-w-[340px]">
          {isLoading ? (
            <CardSkeleton variant="bundle" />
          ) : (
            <BundleCard bundle={bundle} />
          )}
        </div>
      </div>

      {!isLoading && moreDomains.length > 0 && (
        <div className="mt-8 text-center">
          <ActionLink
            onClick={() => {
              console.log('[DomainAvailable] More Great Names clicked');
            }}
            ariaLabel="View more great domain names"
          >
            More Great Names
          </ActionLink>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("domain-available-root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('[DomainAvailable] Root element "domain-available-root" not found');
}

