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
    id: "search-domains",
    title: "Search Domain Names",
    templateUri: "ui://widget/domain-carousel.html",
    invoking: "Searching available domains",
    invoked: "Found domain options",
    html: readWidgetHtml("domains-carousel"),
    responseText: "Found available domain names!",
  },
];

const widgetsById = new Map<string, DomainWidget>();
const widgetsByUri = new Map<string, DomainWidget>();

widgets.forEach((widget) => {
  widgetsById.set(widget.id, widget);
  widgetsByUri.set(widget.templateUri, widget);
});

const toolInputSchema = {
  type: "object",
  properties: {
    keywords: {
      type: "string",
      description: "Keywords to search for domain names (e.g., 'pet treats', 'bakery')",
    },
  },
  required: ["keywords"],
  additionalProperties: false,
} as const;

const toolInputParser = z.object({
  keywords: z.string(),
});

/**
 * Load custom domain search results
 * In production, this would call the GoDaddy API
 */
async function loadCustomDomains(keywords: string) {
  // Simulated domain search results based on keywords
  return {
    domains: [
      {
        id: "1",
        name: "pettreatsco.com",
        price: "$11.99",
        originalPrice: "$21.99",
        period: "for first year",
        description: "Perfect for pet treat businesses and animal care services",
        badge: "AVAILABLE",
        tld: ".com",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='140'%3E%3Crect fill='%231e40af' width='280' height='140'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='28' font-weight='600' fill='white'%3E.com%3C/text%3E%3C/svg%3E",
        metrics: {
          emotional: 3,
          memorable: 4,
          popular: 3,
        },
      },
      {
        id: "2",
        name: "furrybakery.com",
        price: "$11.99",
        originalPrice: "$21.99",
        period: "for first year",
        description: "Ideal for pet bakeries and specialty pet food shops",
        badge: "AVAILABLE",
        tld: ".com",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='140'%3E%3Crect fill='%231e40af' width='280' height='140'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='28' font-weight='600' fill='white'%3E.com%3C/text%3E%3C/svg%3E",
        metrics: {
          emotional: 4,
          memorable: 4,
          popular: 3,
        },
      },
      {
        id: "3",
        name: "pawsomedelights.com",
        price: "$11.99",
        originalPrice: "$21.99",
        period: "for first year",
        description: "Great for pet food delivery and subscription services",
        badge: "AVAILABLE",
        tld: ".com",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='140'%3E%3Crect fill='%231e40af' width='280' height='140'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='28' font-weight='600' fill='white'%3E.com%3C/text%3E%3C/svg%3E",
        metrics: {
          emotional: 4,
          memorable: 3,
          popular: 3,
        },
      },
      {
        id: "4",
        name: "goodboygourmet.com",
        price: "$11.99",
        originalPrice: "$21.99",
        period: "for first year",
        description: "Premium pet food and gourmet treats brand name",
        badge: "AVAILABLE",
        tld: ".com",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='140'%3E%3Crect fill='%231e40af' width='280' height='140'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='28' font-weight='600' fill='white'%3E.com%3C/text%3E%3C/svg%3E",
        metrics: {
          emotional: 4,
          memorable: 4,
          popular: 2,
        },
      },
      {
        id: "5",
        name: "tailwagtreats.com",
        price: "$11.99",
        originalPrice: "$21.99",
        period: "for first year",
        description: "Fun and memorable name for pet treat companies",
        badge: "AVAILABLE",
        tld: ".com",
        available: true,
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='140'%3E%3Crect fill='%231e40af' width='280' height='140'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='28' font-weight='600' fill='white'%3E.com%3C/text%3E%3C/svg%3E",
        metrics: {
          emotional: 5,
          memorable: 4,
          popular: 3,
        },
      },
    ],
    searchKeywords: keywords,
  };
}

const tools: Tool[] = widgets.map((widget) => ({
  name: widget.id,
  description: widget.title,
  inputSchema: toolInputSchema,
  title: widget.title,
  _meta: widgetMeta(widget),
  annotations: {
    destructiveHint: false,
    openWorldHint: false,
    readOnlyHint: true,
  },
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
      const widget = widgetsById.get(request.params.name);

      if (!widget) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const args = toolInputParser.parse(request.params.arguments ?? {});

      // Load custom domain search results
      const domainResults = await loadCustomDomains(args.keywords);

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

