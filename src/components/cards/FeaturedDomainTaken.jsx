import React from "react";
import { Info, Ban } from "lucide-react";

export default function FeaturedDomainTaken({ domain }) {
  if (!domain) return null;

  const getDomainParts = (domainName) => {
    const lastDotIndex = domainName.lastIndexOf('.');
    if (lastDotIndex === -1) return { base: domainName, tld: '' };
    return {
      base: domainName.substring(0, lastDotIndex),
      tld: domainName.substring(lastDotIndex)
    };
  };

  const { base, tld } = getDomainParts(domain.name);

  const handleBuyItNow = () => {
    console.log('[FeaturedDomainTaken] Buy It Now clicked:', domain.name);
    const godaddyUrl = `https://www.godaddy.com/domains/domain-broker`;
    window.open(godaddyUrl, '_blank', 'noopener,noreferrer');
  };

  const brokerFacts = [
    "GoDaddy is the leading domain brokerage worldwide.",
    "We broker a domain every 5 minutes.",
    "We've brokered over half a million domain deals."
  ];

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border-2 border-[#00a4a6] p-4 shadow-sm">
      <span className="inline-block bg-gray-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3 self-start">
        DOMAIN TAKEN
      </span>

      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Ban className="h-5 w-5 text-gray-400" aria-hidden="true" />
        <span className="text-gray-500">
          {base}<span className="text-gray-400">{tld}</span>
        </span>
      </h1>

      <p className="text-xs text-gray-600 mb-4">
        We might be able to help you get it. <a href="#" className="text-[#00a4a6] underline hover:text-[#008c8e]">See How</a>
      </p>

      <div className="flex items-center gap-3 mb-4">
        <img
          src="https://i.pravatar.cc/150?img=47"
          alt="Domain broker"
          className="w-12 h-12 rounded-full border-2 border-gray-200"
        />
        <div>
          <p className="text-xs text-gray-700 font-medium">Broker Service Fee</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">$99.99</span>
            <button
              type="button"
              aria-label="Pricing information"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded p-0.5"
            >
              <Info className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBuyItNow}
        className="self-start bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 min-h-[44px] mb-4"
        aria-label="Buy broker service"
      >
        Buy It Now
      </button>

      <div className="border-t border-gray-200 pt-4">
        <h2 className="text-sm font-bold text-gray-900 mb-2">
          Why Use Domain Broker Service?
        </h2>
        <ul className="space-y-2">
          {brokerFacts.map((fact, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-gray-400 mt-0.5">+</span>
              <div>
                <span>{fact}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

