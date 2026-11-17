// Builds assets/icons.svg (a <symbol> sprite) from assets/icons.js, so the set has one source.
// Run from the repo root: node tools/build-icons.mjs
// Use the sprite with: <svg class="round-icon" width="24" height="24" aria-hidden="true"><use href="assets/icons.svg#i-copy"/></svg>
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

// icons.js is a browser script; run it with a stand-in window and read Round.ICONS back.
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(new URL('../assets/icons.js', import.meta.url), 'utf8'), sandbox);
const { ICONS } = sandbox.window.Round;

const symbols = Object.entries(ICONS).map(([name, body]) =>
  `  <symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`
).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <!-- Round icons. Generated from assets/icons.js by tools/build-icons.mjs; edit the JS, not this file. -->
${symbols}
</svg>
`;
writeFileSync(new URL('../assets/icons.svg', import.meta.url), svg);
console.log(`assets/icons.svg: ${Object.keys(ICONS).length} icons`);
