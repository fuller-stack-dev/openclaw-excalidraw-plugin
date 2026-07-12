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
   `{"type":"excalidraw","version":2,"source":"openclaw","elements":<converted array>,"appState":{"viewBackgroundColor":"#ffffff"}}`
   to `diagrams/<short-topic-slug>.excalidraw` in your workspace (create the
   `diagrams/` folder if needed). Overwrite the same file when revising the
   same diagram. Converting the array is REQUIRED — `label` and
   `cameraUpdate` are create_view conveniences, not valid Excalidraw JSON,
   and excalidraw.com silently drops them (blank shapes, lost labels):
   - Drop every `cameraUpdate` entry.
   - Replace every shape/arrow `label` with a container-bound text pair:
     remove the `label` prop, add
     `"boundElements": [{"id": "t_<elementId>", "type": "text"}]` to the
     element, and insert immediately after it:
     `{"type":"text","id":"t_<elementId>","x":<element.x+10>,"y":<element.y+element.height/2-12>,"width":<element.width-20>,"height":24,"text":"<label text>","fontSize":16,"fontFamily":1,"textAlign":"center","verticalAlign":"middle","containerId":"<elementId>","originalText":"<label text>","autoResize":true}`
     (Excalidraw recalculates exact text geometry on load; approximate
     coordinates are fine, but both sides of the link must be present.)
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

## Layout rules (design before you draw)

Bad diagrams fail four ways: inconsistent box sizes, meaningless colors,
crossing lines, disorganized arrangement. Prevent all four:

- **Grid**: place boxes on a virtual grid — x positions every ~240px, y
  positions every ~120px, minimum 30px horizontal / 25px vertical gaps.
  Never place elements ad-hoc.
- **Consistent sizing**: boxes with the same role get identical dimensions
  (main nodes ~200×70, sub-nodes ~180×60, title banner ~400×50). Vary size
  only to show hierarchy.
- **Text must fit** (the #1 visible failure): box width ≥ label characters
  × 9.5 at fontSize 16; labels max 28 characters per line (`\n` for a second
  line, max 2); a labeled arrow must be at least label characters × 9.5 + 40
  long. If a label feels tight, add 40px of width.
- **Color = meaning**: pick ONE scheme per diagram — flow states (input
  blue, decision yellow, success green, error red), layered zones, or
  side-by-side comparison — and never mix schemes or color decoratively.
  Take hex values from `read_me`'s palette.
- **No crossing lines**: keep flow in one direction (left→right or
  top→bottom); when a straight arrow would cross something, route an
  L-shape via `points: [[0,0],[dx,0],[dx,dy]]`.
- **Stream in z-order**: background zones first, then each shape followed by
  its label and its outgoing arrows, decorations last. Array order is both
  stacking order and the draw-on animation order viewers watch.
- **Label everything that carries meaning**: every box, and every arrow
  whose connection means something specific (sequence messages like
  "POST /login", data flows, conditions). An unlabeled arrow in a sequence
  or flow diagram is a bug.
- **Fonts**: 20 for titles, 16 for labels, 14 minimum — never smaller.

Pre-flight before calling `create_view`: check the longest label in each row
against its box width (chars × 9.5), confirm meaningful arrows are labeled,
and confirm no elements overlap.

## Quality tips

- Prefer fewer, well-labeled elements over exhaustive detail; offer to zoom
  into a subsection as a follow-up drawing.
- Center the title over the diagram's estimated total width.
