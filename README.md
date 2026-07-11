# openclaw-excalidraw-plugin

OpenClaw plugin that attaches the official [Excalidraw MCP App server](https://github.com/excalidraw/excalidraw-mcp) (`https://mcp.excalidraw.com/mcp`, streamable HTTP) to agent sessions.

The server's `create_view` tool draws hand-drawn diagrams and carries an [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) `ui://` resource. On MCP Apps-capable surfaces it renders as an interactive Excalidraw canvas; every other surface (Telegram, Discord, CLI, …) receives the plain text/structured result — the tool works everywhere, the canvas is progressive enhancement.

## Requirements

This plugin declares its MCP server through the `mcpServers` field in `openclaw.plugin.json`, which requires OpenClaw with native-plugin MCP server support ([openclaw/openclaw#104742](https://github.com/openclaw/openclaw/pull/104742), currently in review). The same PR adds the Control UI's MCP Apps preview.

**On any current OpenClaw release** you don't need this plugin to use the Excalidraw server as a normal MCP tool source — add it directly to user config instead:

```bash
openclaw mcp set excalidraw '{"transport":"streamable-http","url":"https://mcp.excalidraw.com/mcp"}'
```

You get the same `create_view` / `read_me` tools with text results; the interactive canvas rendering additionally needs the PR above.

## Install

```bash
openclaw plugins install github:fuller-stack-dev/openclaw-excalidraw-plugin
openclaw plugins enable excalidraw
```

No configuration is required.

## Override the server

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

## Notes and limitations

- Tools the server marks app-only (`_meta.ui.visibility: ["app"]`, e.g. checkpoint save/restore) are never exposed to the model.
- The interactive canvas needs an MCP Apps-capable surface. OpenClaw's Control UI host (from the PR above) renders it in a sandboxed iframe (`allow-scripts`, no same-origin); the app loads its bundle from `https://esm.sh` per its declared CSP, so offline gateways fall back to text results.
- The Phase 0 host is view-only for app→host calls: pan/zoom/local edits work, but app-initiated MCP requests (checkpoint restore across turns, "Export to excalidraw.com") are rejected until OpenClaw's full host bridge lands.

## License

MIT
