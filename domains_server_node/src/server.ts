import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

type DomainWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  responseText: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const ASSETS_DIR = path.resolve(ROOT_DIR, "assets");

function readWidgetHtml(componentName: string): string {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(
      `Widget assets not found. Expected directory ${ASSETS_DIR}. Run "pnpm run build" before starting the server.`
    );
  }

  const directPath = path.join(ASSETS_DIR, `${componentName}.html`);
  let htmlContents: string | null = null;

  if (fs.existsSync(directPath)) {
    htmlContents = fs.readFileSync(directPath, "utf8");
  } else {
    const candidates = fs
      .readdirSync(ASSETS_DIR)
      .filter(
        (file) => file.startsWith(`${componentName}-`) && file.endsWith(".html")
      )
      .sort();
    const fallback = candidates[candidates.length - 1];
    if (fallback) {
      htmlContents = fs.readFileSync(path.join(ASSETS_DIR, fallback), "utf8");
    }
  }

  if (!htmlContents) {
    throw new Error(
      `Widget HTML for "${componentName}" not found in ${ASSETS_DIR}. Run "pnpm run build" to generate the assets.`
    );
  }

  return htmlContents;
}

function widgetMeta(widget: DomainWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const widgets: DomainWidget[] = [
  // {
  //   id: "generic-search-domains",
  //   title: "Search Domain Names",
  //   templateUri: "ui://widget/domain-carousel.html",
  //   invoking: "Searching for available domain names",
  //   invoked: "Found domain options for your business idea",
  //   html: readWidgetHtml("domains-carousel"),
  //   responseText: "Here are some great domain options for your business!",
  // },
  {
    id: "cheap-search-domains",
    title: "Search Cheap Domain Names",
    templateUri: "ui://widget/domain-list-fullscreen.html",
    invoking: "Searching for domain names",
    invoked: "Found cheap domain options for your business idea",
    html: readWidgetHtml("domains-list-fullscreen"),
    responseText: "Here are some cheap domain options for your business!",
  },
  {
    id: "generic-search-domains",
    title: "Search Domain Names (List View)",
    templateUri: "ui://widget/domains-list-fullscreen.html",
    invoking: "Searching for available domain names",
    invoked: "Found domain options for your business idea",
    html: readWidgetHtml("domains-list-fullscreen"),
    responseText: "Here are available domains in a detailed list view. You can expand to see all results and cross-sell options!",
  },
  {
    id: "list-all-products",
    title: "List All GodaddyProducts",
    templateUri: "ui://widget/products-list.html",
    invoking: "Finding all Godaddy products",
    invoked: "Found products for your business",
    html: readWidgetHtml("products-list"),
    responseText: "Here are some great products for your business!",
  },
  {
    id: "recommend-products",
    title: "Recommend Product Plans",
    templateUri: "ui://widget/products-recommend.html",
    invoking: "Finding recommended product plans",
    invoked: "Found recommended plans for your business",
    html: readWidgetHtml("products-recommend"),
    responseText: "Here are recommended product plans for your business!",
  }
];

const widgetsById = new Map<string, DomainWidget>();
const widgetsByUri = new Map<string, DomainWidget>();
// Add this after the existing maps (around line 106)
const sessionContext = new Map<string, any>();


widgets.forEach((widget) => {
  widgetsById.set(widget.id, widget);
  widgetsByUri.set(widget.templateUri, widget);
});

const toolInputSchema = {
  type: "object",
  properties: {
    keywords: {
      type: "string",
      description: "The user's original request or query (preserve the exact wording to analyze context)",
    },
    domainName: {
      type: "string",
      description: "Specific domain to check, e.g., mybrand.com. Optional - if not provided, will search for available domains",
    },
    businessType: {
      type: "string",
      description: "Type of business (e.g., 'restaurant', 'e-commerce', 'blog', 'portfolio')",
    },
    targetAudience: {
      type: "string",
      description: "Target audience or market (e.g., 'local customers', 'global', 'B2B', 'B2C')",
    },
    budget: {
      type: "string",
      description: "Budget range for domain (e.g., 'under $10', 'premium', 'any')",
    },
    category: {
      type: "string",
      description: "Product category to recommend or show (e.g., 'email', 'website', 'ssl-security')",
    },
  },
  required: ["keywords"], // Make keywords required for all tools
  additionalProperties: false,
} as const;

const toolInputParser = z.object({
  keywords: z.string(),
  category: z.string().optional()
});

/**
 * Load product recommendations based on category
 */
async function loadProductRecommendations(category: string = "email") {
  try {
    console.log(`[ProductRecommend] Loading recommendations for category: "${category}"`);

    // For now, we'll use mock data based on category
    // In a real implementation, this would call a product API
    const mockProducts = {
      email: [
        {
          id: "email-essentials",
          category: "email",
          name: "Microsoft 365 Email Essentials",
          description: "Best for building trust — with an email address that matches your domain. Plus, get 10 GB email storage, world-class data security, and spam filtering.",
          price: "$1.99",
          period: "/user/mo",
          originalPrice: "$7.99",
          tags: ["EMAIL MATCHES DOMAIN"],
          learnMoreUrl: "https://www.godaddy.com/email",
          icon: "mail",
          visual: "https://img1.wsimg.com/cdn/Image/All/All/1/All/af30fba5-406f-4f61-9969-4a076b6b062c/feature-category-email2x.jpg",
          features: [
            "10 GB email storage",
            "Professional email with your domain",
            "World-class data security and spam filtering"
          ],
          storage: "10 GB",
          savings: "Save 75%"
        },
        {
          id: "email-plus",
          category: "email",
          name: "Microsoft 365 Email Plus with Security",
          description: "Best for scaling businesses. Get Email Essentials with 50 GB email storage for your growing customer list and marketing to them.",
          price: "$5.99",
          period: "/user/mo",
          originalPrice: "$9.99",
          tags: ["ADDITIONAL STORAGE"],
          learnMoreUrl: "https://www.godaddy.com/email",
          icon: "mail",
          visual: "https://img1.wsimg.com/cdn/Image/All/All/1/All/af30fba5-406f-4f61-9969-4a076b6b062c/feature-category-email2x.jpg",
          features: [
            "50 GB email storage",
            "Advanced security features",
            "Professional email with your domain"
          ],
          storage: "50 GB",
          savings: "Save 40%"
        },
        {
          id: "email-professional",
          category: "email",
          name: "Microsoft 365 Secure Business Professional",
          description: "Best for maximizing productivity. Get Email Plus and Microsoft 365 apps like Word, Excel, PowerPoint, and Teams. Includes 1 TB secure OneDrive storage for your growth.",
          price: "$11.99",
          period: "/user/mo",
          originalPrice: "$26.99",
          tags: ["M365 OFFICE APPS"],
          learnMoreUrl: "https://www.godaddy.com/email",
          icon: "mail",
          visual: "https://img1.wsimg.com/cdn/Image/All/All/1/All/af30fba5-406f-4f61-9969-4a076b6b062c/feature-category-email2x.jpg",
          savings: "55% savings with an annual term",
          features: [
            "1 TB secure OneDrive storage",
            "Microsoft 365 apps (Word, Excel, PowerPoint, Teams)",
            "Professional email with your domain",
            "Advanced security and compliance features"
          ],
          storage: "1 TB",
          badge: "MOST POPULAR"
        }
      ],
      website: [
        {
          id: "website-builder-basic",
          category: "website",
          name: "Website Builder Basic",
          description: "Get your business moving with a professional website, email address and marketing tools",
          price: "$10.99",
          period: "/mo",
          originalPrice: "$16.99",
          tags: ["FOR GETTING STARTED"],
          learnMoreUrl: "https://www.godaddy.com/websites/website-builder",
          icon: "globe",
          visual: "https://img1.wsimg.com/cdn/Image/All/All/1/All/3650f391-adb0-4258-a855-d79e50927976/feature-category-websites2x.jpg",
          savings: "Save 35%"
        },
        {
          id: "website-builder-premium",
          category: "website",
          name: "Website Builder Premium",
          description: "Reach more customers with expanded social media and email marketing tools",
          price: "$16.99",
          period: "/mo",
          originalPrice: "$29.99",
          tags: ["FOR LARGER CUSTOMER REACH"],
          learnMoreUrl: "https://www.godaddy.com/websites/website-builder",
          icon: "globe",
          visual: "https://img1.wsimg.com/cdn/Image/All/All/1/All/3650f391-adb0-4258-a855-d79e50927976/feature-category-websites2x.jpg",
          savings: "Save 43%",
          badge: "RECOMMENDED"
        },
        {
          id: "website-builder-commerce",
          category: "website",
          name: "Website Builder Commerce",
          description: "Easily manage your inventory and sell online",
          price: "$23.99",
          period: "/mo",
          originalPrice: "$34.99",
          tags: ["FOR SCALABILITY AND AUTOMATION"],
          learnMoreUrl: "https://www.godaddy.com/websites/website-builder",
          icon: "globe",
          visual: "https://img1.wsimg.com/cdn/Image/All/All/1/All/3650f391-adb0-4258-a855-d79e50927976/feature-category-websites2x.jpg",
          savings: "Save 31%"
        }
      ],
      "ssl-security": [
        {
          id: "ssl-dv-single-domain",
          category: "ssl-security",
          name: "Single Domain DV SSL",
          description: "Basic SSL certificate.",
          price: "$69.99",
          period: "/yr",
          originalPrice: "$119.99",
          tags: ["1 WEBSITE"],
          learnMoreUrl: "https://www.godaddy.com/web-security/ssl-certificate",
          icon: "shield",
          visual: "https://img1.wsimg.com/cdnassets/transform/e3f72038-9d34-4119-80e9-4a0277439707/FOSMO-97668-SSL-Marquee-Image-Bug",
          savings: "Save 41%"
        },
        {
          id: "ssl-dv-managed",
          category: "ssl-security",
          name: "Managed DV SSL Certificate",
          description: "Leave installation and maintenance to GoDaddy, while enjoying higher rankings and more traffic.",
          price: "$99.99",
          period: "/yr",
          originalPrice: "$199.99",
          tags: ["1 WEBSITE", "FULLY MANAGED"],
          learnMoreUrl: "https://www.godaddy.com/web-security/ssl-certificate",
          icon: "shield",
          visual: "https://img1.wsimg.com/cdnassets/transform/ad6407d6-dd19-40e3-8065-7deb0683af83/mrq-en-mssl-fosmo-90846",
          savings: "Save 50%",
          badge: "INSTALLED IN UNDER 1 HOUR"
        },
        {
          id: "ssl-san-multi-domain",
          category: "ssl-security",
          name: "Multi-domain SAN SSL Certificate",
          description: "Encrypt multiple websites and/or servers while saving cost vs. multiple single-domain certificates.",
          price: "$219.99",
          period: "/yr",
          originalPrice: "$299.99",
          tags: ["5 WEBSITES"],
          learnMoreUrl: "https://www.godaddy.com/web-security/ssl-certificate",
          icon: "shield",
          visual: "https://img1.wsimg.com/cdnassets/transform/e3f72038-9d34-4119-80e9-4a0277439707/FOSMO-97668-SSL-Marquee-Image-Bug",
          savings: "Save 26%"
        }
      ]
    };

    const products = mockProducts[category as keyof typeof mockProducts] || mockProducts.email;

    console.log(`[ProductRecommend] Loaded ${products.length} products for category: ${category}`);

    return {
      products,
      category,
      totalResults: products.length,
    };
  } catch (error) {
    console.error('[ProductRecommend] Error loading product recommendations:', error);

    // Fallback to email products if error
    return {
      products: [],
      category,
      totalResults: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Call GoDaddy API to get real domain search results
 */
async function loadCustomDomains(keywords: string) {
  try {
    const response = await fetch(
      `https://entourage.prod.aws.godaddy.com/v1/search/spins?q=${encodeURIComponent(keywords)}&pagesize=5`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'got (https://github.com/sindresorhus/got)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GoDaddy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[DomainSearch] API response received:`, data);

    // Transform GoDaddy API response to our domain format
    const domains = data.RecommendedDomains?.map((domain: any, index: number) => {
      // Find corresponding product info for pricing
      const product = data.Products?.find((p: any) => p.Tld === domain.Extension);

      return {
        id: (index + 1).toString(),
        name: domain.Fqdn,
        price: product?.PriceInfo?.CurrentPriceDisplay || "$0.00",
        originalPrice: product?.PriceInfo?.ListPriceDisplay || "$0.00",
        period: "for first year",
        description: `Perfect for ${keywords} businesses and services`,
        badge: domain.IsUnpricedAftermarketDomain ? "PREMIUM" : "AVAILABLE",
        tld: `.${domain.Extension}`,
        available: true,
        image: generateDomainImage(domain.Extension),
        metrics: {
          emotional: Math.floor(Math.random() * 3) + 3, // 3-5
          memorable: Math.floor(Math.random() * 3) + 3, // 3-5
          popular: Math.floor(Math.random() * 3) + 2,   // 2-4
        },
        // Additional GoDaddy-specific data
        isPremium: domain.IsPremiumTier,
        isAftermarket: domain.IsUnpricedAftermarketDomain,
        aftermarketPrice: domain.PriceDisplay,
        productId: domain.ProductId,
      };
    }) || [];

    console.log(`[DomainSearch] Transformed ${domains.length} domains`);

    return {
      domains,
      searchKeywords: keywords,
      totalResults: domains.length,
      apiResponse: data, // Include raw response for debugging
    };
  } catch (error) {
    console.error('[DomainSearch] Error calling GoDaddy API:', error);

    // Fallback to mock data if API fails
    return {
      domains: [
        {
          id: "1",
          name: `${keywords.replace(/\s+/g, '').toLowerCase()}.com`,
          price: "$11.99",
          originalPrice: "$21.99",
          period: "for first year",
          description: `Perfect for ${keywords} businesses and services`,
          badge: "AVAILABLE",
          tld: ".com",
          available: true,
          image: generateDomainImage("com"),
          metrics: {
            emotional: 3,
            memorable: 4,
            popular: 3,
          },
        },
      ],
      searchKeywords: keywords,
      totalResults: 1,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function loadCheapCustomDomains(keywords: string) {
  try {
    const response = await loadCustomDomains(keywords);
    // sort the domains to get the cheap ones
    const cheapDomains = [...response.domains].sort((a: any, b: any) => {
      const priceA = parseFloat(a.price.replace('$', ''));
      const priceB = parseFloat(b.price.replace('$', ''));
      return priceA - priceB;
    });
    return {
      domains: cheapDomains,
      searchKeywords: keywords,
      totalResults: cheapDomains.length,
    };
  } catch (error) {
    console.error('[CheapDomainSearch] Error:', error);
    return {
      domains: [],
      searchKeywords: keywords,
      totalResults: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a simple SVG image for domain TLD
 */
function generateDomainImage(tld: string): string {
  const colors: Record<string, string> = {
    'com': '#1e40af',
    'net': '#059669',
    'org': '#dc2626',
    'io': '#7c3aed',
    'co': '#ea580c',
    'info': '#0891b2',
    'services': '#be185d',
    'life': '#16a34a',
    'online': '#9333ea',
  };

  const color = colors[tld] || '#6b7280';

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='140'%3E%3Crect fill='${encodeURIComponent(color)}' width='280' height='140'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='28' font-weight='600' fill='white'%3E.${tld}%3C/text%3E%3C/svg%3E`;
}

const tools: Tool[] = widgets.map((widget) => {
  // Determine description based on widget type
  let description: string;
  if (widget.id.includes('domains')) {
    description = "Search for domain names based on user's business idea or request. Pass the user's exact words in the 'keywords' parameter to preserve context.";
  } else if (widget.id.includes('products')) {
    description = "Find and recommend GoDaddy products and services based on user's business needs. Pass the user's exact words in the 'keywords' and 'category' parameter to preserve context.";
  } else {
    description = "Search for GoDaddy services based on user's business idea or request. Pass the user's exact words in the 'keywords' parameter to preserve context.";
  }

  return {
    name: widget.id,
    description,
    inputSchema: toolInputSchema,
    title: widget.title,
    _meta: widgetMeta(widget),
    annotations: {
      destructiveHint: false,
      openWorldHint: false,
      readOnlyHint: true,
    }
  };
});

const resources: Resource[] = widgets.map((widget) => ({
  uri: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

const resourceTemplates: ResourceTemplate[] = widgets.map((widget) => ({
  uriTemplate: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

function createDomainsServer(): Server {
  const server = new Server(
    {
      name: "domains-node",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (_request: ListResourcesRequest) => ({
      resources,
    })
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request: ReadResourceRequest) => {
      const widget = widgetsByUri.get(request.params.uri);

      if (!widget) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      return {
        contents: [
          {
            uri: widget.templateUri,
            mimeType: "text/html+skybridge",
            text: widget.html,
            _meta: widgetMeta(widget),
          },
        ],
      };
    }
  );

  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.log('request.params', request.params);
      const widget = widgetsById.get(request.params.name);
      if (!widget) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }
      const args = toolInputParser.parse(request.params.arguments ?? {});


      // Handle product recommendations
      if (widget.id === "recommend-products") {
        const productResults = await loadProductRecommendations(args.category || "email");
        return {
          content: [
            {
              type: "text",
              text: `${widget.responseText} Found ${productResults.products.length} recommended plans for ${productResults.category} products`,
            },
          ],
          structuredContent: {
            ...productResults,
          },
          _meta: widgetMeta(widget),
        };
      }

      // Handle domain search
      let domainResults;
      if (widget.id === "cheap-search-domains") {
        domainResults = await loadCheapCustomDomains(args.keywords);
      } else {
        domainResults = await loadCustomDomains(args.keywords);
      }

      return {
        content: [
          {
            type: "text",
            text: `${widget.responseText} Found ${domainResults.domains.length} domains for "${args.keywords}"`,
          },
        ],
        structuredContent: {
          ...domainResults,
        },
        _meta: widgetMeta(widget),
      };
    }
  );

  return server;
}

type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};

const sessions = new Map<string, SessionRecord>();

const ssePath = "/mcp";
const postPath = "/mcp/messages";

async function handleSseRequest(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createDomainsServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    await server.close();
  };

  transport.onerror = (error) => {
    console.error("SSE transport error", error);
  };

  try {
    await server.connect(transport);
  } catch (error: unknown) {
    sessions.delete(sessionId);
    console.error("Failed to start SSE session", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to establish SSE connection");
    }
  }
}

async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400).end("Missing sessionId query parameter");
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    res.writeHead(404).end("Unknown session");
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error: unknown) {
    console.error("Failed to process message", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to process message");
    }
  }
}

const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;

const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400).end("Missing URL");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (
      req.method === "OPTIONS" &&
      (url.pathname === ssePath || url.pathname === postPath)
    ) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === ssePath) {
      await handleSseRequest(res);
      return;
    }

    if (req.method === "POST" && url.pathname === postPath) {
      await handlePostMessage(req, res, url);
      return;
    }

    res.writeHead(404).end("Not Found");
  }
);

httpServer.on("clientError", (err: Error, socket) => {
  console.error("HTTP client error", err);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

// Check if running in stdio mode (e.g., via MCP inspector)
if (process.argv.includes("--stdio") || process.stdin.isTTY === false) {
  const server = createDomainsServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((error) => {
    console.error("Failed to start stdio server", error);
    process.exit(1);
  });
} else {
  // Run HTTP server
  httpServer.listen(port, () => {
    console.log(`Domains MCP server listening on http://localhost:${port}`);
    console.log(`  SSE stream: GET http://localhost:${port}${ssePath}`);
    console.log(
      `  Message post endpoint: POST http://localhost:${port}${postPath}?sessionId=...`
    );
  });
}
