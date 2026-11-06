#!/usr/bin/env node
// Rewrites every version range in a project's package.json to the exact version npm installed,
// read from package-lock.json. The engine template ships ranges (^19, 9.x); a film must rebuild
// identically next month, and a floating range is also a supply chain hole.
//   node <skill>/scripts/pin-deps.mjs [project-dir]
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SECTIONS = ["dependencies", "devDependencies", "optionalDependencies"];
const EXACT = /^\d+\.\d+\.\d+(-[\w.]+)?$/;

export function pinManifest(manifest, lock) {
  const pinned = structuredClone(manifest);
  const changes = [];
  for (const section of SECTIONS) {
    for (const [name, range] of Object.entries(pinned[section] ?? {})) {
      if (EXACT.test(range)) continue;
      const installed = lock.packages?.[`node_modules/${name}`]?.version;
      if (!installed) throw new Error(`${name} is not in package-lock.json: run npm install first`);
      pinned[section][name] = installed;
      changes.push(`${name}: ${range} -> ${installed}`);
    }
  }
  return { pinned, changes };
}

function main(dir) {
  const manifestPath = join(dir, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const lock = JSON.parse(readFileSync(join(dir, "package-lock.json"), "utf8"));
  const { pinned, changes } = pinManifest(manifest, lock);
  writeFileSync(manifestPath, `${JSON.stringify(pinned, null, 2)}\n`);
  console.log(changes.length ? changes.join("\n") : "already pinned");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(resolve(process.argv[2] ?? "."));
}
