---
name: excalidraw
description: Draw hand-drawn diagrams with the Excalidraw MCP tools. Use whenever the user asks to draw, diagram, sketch, chart, flowchart, mind-map, wireframe, whiteboard, or visualize something — architecture diagrams, sequence/flow charts, org charts, entity relationships, timelines, quick illustrations. Read this skill before the first excalidraw tool call in a session, and follow its per-channel output guidance so text-only channels still get a useful result.
---

# Drawing with Excalidraw

The `excalidraw` MCP server draws hand-drawn-style diagrams. `create_view`
streams elements onto a canvas; on MCP Apps-capable surfaces (Control UI with
app previews) the canvas renders inline in the tool card, while text-only
channels (Telegram, Discord, CLI, …) only see the tool's text result — so your
reply must carry the value there.

## Workflow

1. Call `read_me` once per session BEFORE the first `create_view`. It returns
   the element format, color palettes, and layout tips. Do not guess the format.
2. Build the diagram as a compact JSON array string of Excalidraw elements and
   call `create_view` with it. Strict JSON only: no comments, no trailing
   commas. Prefer round coordinates, generous spacing, and label every shape.
3. Keep the element array you sent. To revise the diagram, send a full updated
   array in a new `create_view` call. Do not rely on server-side checkpoint
   restore (`restoreCheckpoint`) or widget-context reads: those need an MCP
   Apps host bridge that OpenClaw does not provide yet, and a restore-based
   call will render only the new delta.
4. Never try to call checkpoint or export tools (`save_checkpoint`,
   `read_checkpoint`, `export_to_excalidraw`). They are app-only and not
   available to you.

## Output per surface

After `create_view` succeeds, shape your reply for where the user is:

- **MCP Apps-capable surface** (Control UI with the app preview): the canvas
  appears inside the tool card. Reply with one short sentence about what you
  drew — do not restate the diagram contents.
- **Text-only channel** (Telegram, Discord, CLI, or any surface without the
  inline canvas): the user cannot see the canvas. In your reply:
  1. Summarize the diagram in one or two sentences (what it shows, not every
     element).
  2. Offer the portable scene so they can open it themselves: wrap your
     element array as an Excalidraw scene file —
     `{"type":"excalidraw","version":2,"source":"openclaw","elements":<your array>,"appState":{}}`
     — saved as `<topic>.excalidraw`. Attach the file if the channel supports
     file attachments; otherwise offer the JSON in a code block on request.
     The file opens at https://excalidraw.com (drag and drop or File → Open).
- When unsure which kind of surface you are on, use the text-only behavior —
  it degrades gracefully everywhere.

## Quality tips

- Sketch structure first (boxes/containers), then arrows, then labels.
- Use `read_me`'s palette colors instead of inventing hex values.
- For flow direction, lay out left-to-right or top-to-bottom and keep arrows
  orthogonal where possible.
- Large diagrams: prefer fewer, well-labeled elements over exhaustive detail;
  offer to zoom into a subsection as a follow-up drawing.
