import assert from "node:assert/strict";
import { test } from "node:test";

import { pinManifest } from "./pin-deps.mjs";

const lock = {
  packages: {
    "node_modules/react": { version: "19.2.1" },
    "node_modules/typescript": { version: "5.9.3" },
    "node_modules/remotion": { version: "4.0.534" },
  },
};

test("replaces ranges with the locked versions", () => {
  const manifest = { dependencies: { react: "^19.0.0", remotion: "4.0.534" }, devDependencies: { typescript: "~5.6.0" } };
  const { pinned, changes } = pinManifest(manifest, lock);
  assert.deepEqual(pinned.dependencies, { react: "19.2.1", remotion: "4.0.534" });
  assert.equal(pinned.devDependencies.typescript, "5.9.3");
  assert.equal(changes.length, 2);
});

test("leaves the input untouched", () => {
  const manifest = { dependencies: { react: "^19.0.0" } };
  pinManifest(manifest, lock);
  assert.equal(manifest.dependencies.react, "^19.0.0");
});

test("keeps exact prerelease versions", () => {
  const manifest = { dependencies: { remotion: "4.1.0-beta.2" } };
  assert.equal(pinManifest(manifest, lock).changes.length, 0);
});

test("refuses a dependency npm never installed", () => {
  assert.throws(() => pinManifest({ dependencies: { three: "0.x" } }, lock), /three is not in package-lock/);
});
