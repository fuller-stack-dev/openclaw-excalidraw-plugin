// Manifest/package consistency checks (run with `npm test` / node --test).
// Dependency-free on purpose: the plugin ships no runtime deps, so its tests
// shouldn't introduce any either.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "openclaw.plugin.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

test("manifest declares the excalidraw plugin id and empty config schema", () => {
  assert.equal(manifest.id, "excalidraw");
  assert.equal(typeof manifest.name, "string");
  assert.equal(manifest.configSchema.type, "object");
  assert.equal(manifest.configSchema.additionalProperties, false);
  assert.equal(manifest.enabledByDefault, false);
});

test("manifest attaches the official Excalidraw MCP App server over HTTPS", () => {
  const server = manifest.mcpServers?.excalidraw;
  assert.ok(server, "mcpServers.excalidraw must be declared");
  assert.equal(server.transport, "streamable-http");
  assert.ok(server.url.startsWith("https://"), "server URL must be HTTPS");
  assert.equal(new URL(server.url).hostname, "mcp.excalidraw.com");
  assert.equal(server.command, undefined, "manifest-only plugin must not spawn commands");
});

test("package entry is compiled JS and included in the published files", () => {
  const entries = pkg.openclaw?.extensions;
  assert.deepEqual(entries, ["./index.js"], "package installs require a JS entry");
  for (const entry of entries) {
    assert.ok(existsSync(join(root, entry)), `${entry} must exist`);
    assert.ok(pkg.files.includes(entry.replace("./", "")), `${entry} must be in files[]`);
  }
  assert.ok(pkg.files.includes("openclaw.plugin.json"), "manifest must ship with the package");
});

test("entry id matches the manifest id", () => {
  const entrySource = readFileSync(join(root, "index.js"), "utf8");
  assert.match(entrySource, /id:\s*"excalidraw"/);
});

test("install metadata declares host floor and publish routes", () => {
  const install = pkg.openclaw?.install;
  assert.equal(install?.npmSpec, pkg.name);
  assert.match(install?.minHostVersion ?? "", /^>=\d{4}\.\d+\.\d+$/);
  assert.match(pkg.openclaw?.compat?.pluginApi ?? "", /^>=\d{4}\.\d+\.\d+$/);
  assert.equal(typeof pkg.openclaw?.release?.publishToClawHub, "boolean");
});

test("icon is an HTTPS image URL", () => {
  assert.ok(manifest.icon.startsWith("https://"));
});

test("bundled skill is declared, present, and packed", () => {
  assert.deepEqual(manifest.skills, ["./skills"]);
  assert.ok(pkg.files.includes("skills"), "skills dir must ship with the package");
  const skillPath = join(root, "skills", "excalidraw", "SKILL.md");
  assert.ok(existsSync(skillPath), "skills/excalidraw/SKILL.md must exist");
  const skill = readFileSync(skillPath, "utf8");
  assert.match(skill, /^---\nname: excalidraw\n/, "frontmatter must start with the skill name");
  assert.match(skill, /description: .*(draw|diagram)/i, "description must carry draw/diagram triggers");
  assert.match(skill, /read_me/, "skill must teach the read_me-first workflow");
  assert.match(skill, /"type":"excalidraw","version":2/, "skill must include the portable scene shape");
});
