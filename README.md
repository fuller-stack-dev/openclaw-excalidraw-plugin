# @fuller-stack-dev/openclaw-excalidraw-plugin

OpenClaw plugin that attaches the official [Excalidraw MCP App server](https://github.com/excalidraw/excalidraw-mcp) (`https://mcp.excalidraw.com/mcp`, streamable HTTP) to agent sessions.

The server's `create_view` tool draws hand-drawn diagrams and carries an [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) `ui://` resource. On MCP Apps-capable surfaces it renders as an interactive Excalidraw canvas; every other surface (Telegram, Discord, CLI, …) receives the plain text/structured result — the tool works everywhere, the canvas is progressive enhancement.

## Install

```bash
openclaw plugins install github:fuller-stack-dev/openclaw-excalidraw-plugin
openclaw plugins enable excalidraw
```

Restart the Gateway after installing or enabling the plugin. No configuration is required.

## What it provides

- The `excalidraw` MCP server attached to agent sessions while the plugin is enabled (declared via `mcpServers` in `openclaw.plugin.json` — manifest-only, no runtime code).
- Agent tools `create_view` (draw/stream a diagram) and `read_me` (element format reference).
- Tools the server marks app-only (`_meta.ui.visibility: ["app"]`, e.g. checkpoint save/restore) are never exposed to the model.
- An interactive, hand-drawn Excalidraw canvas inside the tool card on MCP Apps-capable surfaces; text results everywhere else.
- A bundled `excalidraw` skill that triggers when the user asks to draw, diagram, sketch, or visualize something: it teaches the agent the `read_me`-first element workflow and per-channel outputs — a short summary next to the inline canvas on app-capable surfaces, and a portable `.excalidraw` scene file (opens at excalidraw.com) for text-only channels.

## Compatibility

The `mcpServers` plugin-manifest field and the Control UI MCP Apps host require OpenClaw with [openclaw/openclaw#104742](https://github.com/openclaw/openclaw/pull/104742) (in review). On earlier hosts the plugin installs but attaches nothing.

Until that lands, any current OpenClaw release can use the Excalidraw server as a normal MCP tool source without this plugin:

```bash
openclaw mcp set excalidraw '{"transport":"streamable-http","url":"https://mcp.excalidraw.com/mcp"}'
```

Known host limitations while MCP Apps support stabilizes:

- The Phase 0 host is view-only for app→host calls: pan/zoom/local edits work, but app-initiated MCP requests (checkpoint restore across turns, "Export to excalidraw.com") are rejected until OpenClaw's full host bridge lands.
- Gateway-served Control UI deployments enforce a strict page CSP that currently blocks the inline app preview (text results are unaffected); the dedicated app-document route is the tracked upstream follow-up.

## Configure

User `mcp.servers` entries always win by server name — point at your own deployment with:

```json
{
  "mcp": {
    "servers": {
      "excalidraw": {
        "transport": "streamable-http",
        "url": "https://your-deployment.example.com/mcp"
      }
    }
  }
}
```

Set `mcp.servers.excalidraw.enabled: false` to keep the plugin enabled but detach the server.

The app loads its bundle from `https://esm.sh` per its declared CSP, so offline gateways fall back to text results.

## Package

- Plugin id: `excalidraw`
- Package: `@fuller-stack-dev/openclaw-excalidraw-plugin`
- Minimum host version: `2026.7.2`
- Runtime dependencies: none (manifest-only)
- Tests: `npm test` (dependency-free `node --test` manifest/package consistency checks)

## License

MIT
