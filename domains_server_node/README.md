# GoDaddy Domains MCP Server (Node)

This directory contains a Model Context Protocol (MCP) server implemented with the official TypeScript SDK. The server exposes GoDaddy domain search tools so you can experiment with domain discovery in ChatGPT developer mode.

## Prerequisites

- Node.js 18+
- pnpm, npm, or yarn for dependency management

## Install dependencies

```bash
pnpm install
```

If you prefer npm or yarn, adjust the command accordingly.

## Run the server

```bash
pnpm start
```

The script bootstraps the server over SSE (Server-Sent Events), which makes it compatible with the MCP Inspector as well as ChatGPT connectors. Once running you can list the tools and invoke domain search experiences.

Each tool responds with:

- `content`: a short text confirmation about the domain search results.
- `structuredContent`: a JSON payload containing domain data with pricing, availability, and metrics.
- `_meta.openai/outputTemplate`: metadata that binds the response to the matching domain carousel widget.

## Available Tools

- `search-domains`: Search for available domain names based on keywords
- `show-domain-carousel`: Display a carousel of recommended domains

Feel free to extend the handlers with real GoDaddy API integration, authentication, and persistence.

