import React from "react";
import { createRoot } from "react-dom/client";
import domainsData from "../mocks/domains-unavailable.json";
import FeaturedDomainTaken from "../components/cards/FeaturedDomainTaken";
import FeaturedDomain from "../components/cards/FeaturedDomain";
import CardSkeleton from "../components/cards/CardSkeleton";
import ActionLink from "../components/ActionLink";
import { useTheme } from "../use-theme";

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const theme = useTheme();
  const isDark = theme === "dark";
  const allDomains = domainsData?.domains || [];
  const takenDomain = allDomains.find(d => !d.available && d.isRequested) || allDomains[0];
  const alternativeDomains = allDomains.filter(d => d.available);
  
  const closeAlternative = alternativeDomains[0] || null;
  const moreAlternatives = alternativeDomains.slice(1);

  React.useEffect(() => {
    console.log('[DomainUnavailable] Domain taken:', takenDomain?.name, '| Close alternative:', closeAlternative?.name);
  }, [takenDomain, closeAlternative]);

  return (
    <div 
      className={`antialiased w-full py-8 ${
        isDark 
          ? 'bg-transparent text-white' 
          : 'bg-transparent text-gray-900'
      }`} 
      role="main"
    >
      <div className="flex flex-wrap justify-center items-stretch gap-6 px-6">
        <div className="w-full max-w-[340px] flex">
          {isLoading ? (
            <CardSkeleton variant="taken" />
          ) : (
            <FeaturedDomainTaken domain={takenDomain} />
          )}
        </div>
        
        {(isLoading || closeAlternative) && (
          <div className="w-full max-w-[340px] flex">
            {isLoading ? (
              <CardSkeleton variant="featured" />
            ) : (
              <FeaturedDomain domain={closeAlternative} showReasons={true} />
            )}
          </div>
        )}
      </div>

      {!isLoading && moreAlternatives.length > 0 && (
        <div className="mt-8 text-center">
          <ActionLink
            onClick={() => {
              console.log('[DomainUnavailable] Close Alternatives clicked');
            }}
            ariaLabel="View close alternative domain names"
          >
            View More Alternatives
          </ActionLink>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("domain-unavailable-root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('[DomainUnavailable] Root element "domain-unavailable-root" not found');
}

