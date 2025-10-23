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
  {
    id: "generic-search-domains",
    title: "Search Domain Names",
    templateUri: "ui://widget/domain-carousel.html",
    invoking: "Searching for available domain names",
    invoked: "Found domain options for your business idea",
    html: readWidgetHtml("domains-carousel"),
    responseText: "Here are some great domain options for your business!",
  },
  {
    id: "cheap-search-domains",
    title: "Search Cheap Domain Names",
    templateUri: "ui://widget/domain-carousel.html",
    invoking: "Searching for domain names when prompt specifically requests cheap available domainnames",
    invoked: "Found cheap domain options for your business idea when prompt specifically requests cheap available domainnames",
    html: readWidgetHtml("domains-carousel"),
    responseText: "Here are some cheap domain options for your business!",
  },
  {
    id: "generic-search-domains-fullscreen",
    title: "Search Domain Names (List View)",
    templateUri: "ui://widget/domains-list-fullscreen.html",
    invoking: "Searching for available domain names",
    invoked: "Found domain options for your business idea",
    html: readWidgetHtml("domains-list-fullscreen"),
    responseText: "Here are available domains in a detailed list view. You can expand to see all results and cross-sell options!",
  },
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
      description: "The user's original request or query about domains (preserve the exact wording to analyze context)",
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
      description: "Budget range for domain (e.g., 'under $50', 'premium', 'any')",
    }
  },
  required: ["keywords"], // Make only keywords required
  additionalProperties: false,
} as const;

const toolInputParser = z.object({
  keywords: z.string()
});

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

const tools: Tool[] = widgets.map((widget) => ({
  name: widget.id,
  description: "Search for domain names based on user's business idea or request. Pass the user's exact words in the 'keywords' parameter to preserve context.",
  inputSchema: toolInputSchema,
  title: widget.title,
  _meta: widgetMeta(widget),
  annotations: {
    destructiveHint: false,
    openWorldHint: false,
    readOnlyHint: true,
  }
}));

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
