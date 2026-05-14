import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const html  = readFileSync(join(root, 'docs/index.html'), 'utf8');
const appJs = readFileSync(join(root, 'docs/assets/scripts/app.js'), 'utf8');

// Inject app.js inline — avoids JSDOM external-resource loading issues
const htmlInlined = html.replace(
  /<script\s+src=["'][^"']*app\.js[^"']*["'][^>]*><\/script>/i,
  `<script>${appJs}</script>`
);

// Suppress non-critical browser API noise (CSS, fonts, scrollIntoView)
const vc = new VirtualConsole();
vc.sendTo(console, { omitJSDOMErrors: true });

const dom = new JSDOM(htmlInlined, {
  runScripts:        'dangerously',
  url:               'http://localhost/',
  pretendToBeVisual: true,
  virtualConsole:    vc,
});

const { window } = dom;

// Give DOMContentLoaded + app init time to settle
await new Promise(r => setTimeout(r, 1500));

try {
  window.eval('runOutputTests()');
} catch (e) {
  console.error('runOutputTests() threw:', e.message);
  process.exit(1);
}

await new Promise(r => setTimeout(r, 800));

const summary = window.document.getElementById('testSummary');
const text    = summary?.textContent?.trim() ?? '';

console.log('\n' + (text || '(kein Testergebnis — testSummary leer)'));

process.exit(text && !text.includes('❌') && !text.includes('fehlgeschlagen') ? 0 : 1);
