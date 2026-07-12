---
name: excalidraw-mcp
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

## Output rules (mandatory, every drawing)

After every successful `create_view`, do ALL of these steps — none are
optional:

1. Save the portable scene: write
   `{"type":"excalidraw","version":2,"source":"openclaw","elements":<your array>,"appState":{}}`
   to `diagrams/<short-topic-slug>.excalidraw` in your workspace (create the
   `diagrams/` folder if needed). Drop any `cameraUpdate` entries from the
   saved array — they are create_view streaming directives, not scene
   elements. Overwrite the same file when revising the same diagram.
2. Reply with one or two sentences saying what the diagram shows — never
   restate every element in prose, and never paste raw element JSON into chat
   unless the user explicitly asks for it.
3. Deliver the scene. Unless the surface renders the inline app canvas
   (Control UI app preview), the user CANNOT see what you drew, so this step
   is the difference between a result and nothing: attach
   `diagrams/<slug>.excalidraw` when the channel supports file attachments,
   and otherwise your reply MUST end with this exact line (filled in):
   "Editable scene saved at diagrams/<slug>.excalidraw — open it at
   https://excalidraw.com (File → Open)."
   Skip this step only when you can see your drawing rendered in an app
   canvas on the current surface. When in doubt, include the line.

## Quality tips

- Sketch structure first (boxes/containers), then arrows, then labels.
- Label everything that carries meaning: every box gets a `label`, and arrows
  get labels whenever the connection means something specific (sequence
  messages like "POST /login", data flows, conditions). An unlabeled arrow in
  a sequence or flow diagram is a bug.
- Use `read_me`'s palette colors instead of inventing hex values.
- For flow direction, lay out left-to-right or top-to-bottom and keep arrows
  orthogonal where possible.
- Large diagrams: prefer fewer, well-labeled elements over exhaustive detail;
  offer to zoom into a subsection as a follow-up drawing.
