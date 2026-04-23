#!/usr/bin/env node
/**
 * build.mjs — MRC Scheduling Dashboard build script
 *
 * Usage:
 *   node build/build.mjs elizabeth        # builds one EA
 *   node build/build.mjs --all            # builds all ribs
 *
 * Output: build/<ea-name>.html
 *
 * Dependency-free. Requires Node 18+ (for built-in fetch if needed).
 * YAML parsing is handled with a tiny inline parser sufficient for our rib schema.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');

// ── Tiny YAML parser ─────────────────────────────────────────────────────────
// Handles the subset of YAML we actually use in ribs:
// strings, booleans, integers, arrays of strings, nested objects.
// Not a general YAML parser — just enough for our schema.

function parseYAML(text) {
  const lines = text.split('\n');
  const root = {};
  const stack = [{ obj: root, indent: -1 }];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trimEnd();

    // Skip comments and blank lines
    if (!trimmed || trimmed.trimStart().startsWith('#')) continue;

    const indent = raw.length - raw.trimStart().length;
    const line = trimmed.trimStart();

    // Array item
    if (line.startsWith('- ')) {
      const val = line.slice(2).trim();
      // Find parent array
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1];
      const arr = parent.currentArray;
      if (arr) {
        if (val.includes(':')) {
          // Array of objects
          const obj = {};
          arr.push(obj);
          stack.push({ obj, indent, isArrayItem: true });
          const [k, v] = splitKV(val);
          obj[k] = parseVal(v);
        } else {
          arr.push(parseVal(val));
        }
      }
      continue;
    }

    // Key: value
    if (line.includes(':')) {
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].obj;
      const [k, v] = splitKV(line);

      if (v === '' || v === null) {
        // Nested object or array coming next
        const next = lines[i + 1];
        if (next) {
          const nextTrimmed = next.trimStart();
          if (nextTrimmed.startsWith('- ')) {
            parent[k] = [];
            stack.push({ obj: parent, currentArray: parent[k], indent });
          } else {
            parent[k] = {};
            stack.push({ obj: parent[k], indent });
          }
        }
      } else {
        parent[k] = parseVal(v);
        if (stack[stack.length - 1].isArrayItem) {
          // still building this object
        }
      }
    }
  }

  return root;
}

function splitKV(line) {
  const idx = line.indexOf(':');
  const k = line.slice(0, idx).trim();
  const v = line.slice(idx + 1).trim() || null;
  return [k, v];
}

function parseVal(v) {
  if (v === null || v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  // Strip quotes
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  // Strip inline comment
  const commentIdx = v.indexOf(' #');
  if (commentIdx > 0) return v.slice(0, commentIdx).trim();
  return v;
}

// ── Build one EA ─────────────────────────────────────────────────────────────

function build(eaName) {
  const ribPath = join(ROOT, 'ribs', `${eaName}.yaml`);
  const tmplPath = join(ROOT, 'spine', 'index.html.template');

  if (!existsSync(ribPath)) {
    console.error(`✗ No rib found for "${eaName}" at ${ribPath}`);
    process.exit(1);
  }
  if (!existsSync(tmplPath)) {
    console.error(`✗ Spine template not found at ${tmplPath}`);
    process.exit(1);
  }

  const ribText  = readFileSync(ribPath,  'utf8');
  const template = readFileSync(tmplPath, 'utf8');
  const rib      = parseYAML(ribText);

  // Inject rib as window.__RIB__ — spine reads this for all config
  const ribScript = `<script>window.__RIB__ = ${JSON.stringify(rib, null, 2)};</script>`;

  // Embed git SHA for drift detection (best effort)
  let sha = 'unknown';
  try { sha = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
  const shaComment = `<!-- spine-sha: ${sha} -->`;

  // Replace placeholder in template
  let html = template
    .replace('<!-- __RIB_INJECT__ -->', `${shaComment}\n  ${ribScript}`)
    .replace('{{EA_NAME}}', rib.ea?.name || eaName);

  const outPath = join(ROOT, 'build', `${eaName}.html`);
  writeFileSync(outPath, html, 'utf8');

  console.log(`✓ Built ${eaName} → build/${eaName}.html`);
  console.log(`  Calendars: ${(rib.calendars || []).map(c => c.label).join(', ')}`);
  console.log(`  Features:  ${Object.entries(rib.features || {}).filter(([,v])=>v).map(([k])=>k).join(', ')}`);
  console.log(`  Artifact:  ${rib.artifact_id}`);

  return { eaName, outPath, rib };
}

// ── Entry point ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args[0] === '--all') {
  const ribFiles = readdirSync(join(ROOT, 'ribs'))
    .filter(f => f.endsWith('.yaml') && !f.startsWith('_'));
  for (const f of ribFiles) build(f.replace('.yaml', ''));
} else if (args[0]) {
  build(args[0]);
} else {
  console.log('Usage: node build/build.mjs <ea-name>');
  console.log('       node build/build.mjs --all');
  console.log('\nAvailable EAs:');
  readdirSync(join(ROOT, 'ribs'))
    .filter(f => f.endsWith('.yaml') && !f.startsWith('_'))
    .forEach(f => console.log(' ', f.replace('.yaml', '')));
  process.exit(1);
}
