// Isolated real Chromium checks against the built site (prefer Wrangler for CSP/routing).
// Start `npm exec -- wrangler dev --local --port 8787` first. No personal browser profile is used.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8787';
const output = 'tmp/visual';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [], external = [], measurements = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(base).origin) external.push(request.url()); });
const go = async path => {
  const response = await page.goto(`${base}${path}`);
  assert.equal(response.status(), 200, path);
  await page.evaluate(() => document.fonts.ready);
};
const shot = async name => {
  // Capture fixed navigation from the top of the page, not a prior interaction's scroll offset.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  return page.screenshot({ path: `${output}/${name}.png`, fullPage: true, animations: 'disabled', style: '#toast { visibility: hidden; }' });
};
const visible = async selector => assert.equal(await page.locator(selector).isVisible(), true, `${selector} visible`);
const text = selector => page.locator(selector).textContent();
try {
  const routes = ['', 'tools/', 'tools/date-converter/', 'tools/age-calculator/', 'tools/preeti-unicode/', 'tools/photo-resizer/', 'tools/land-converter/'];
  for (const lang of ['en', 'ne']) {
    for (const width of [320, 360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
      for (const route of routes) {
        await go(`/${lang}/${route}`);
        const measure = await page.evaluate(() => ({
          viewport: innerWidth, document: document.documentElement.scrollWidth,
          body: getComputedStyle(document.body).fontSize,
          horizontal: [...document.querySelectorAll('main *')].filter(e => {
            const r = e.getBoundingClientRect();
            return r.width && (r.right > innerWidth + 1 || r.left < -1);
          }).slice(0, 8).map(e => `${e.tagName}.${e.className}`)
        }));
        measurements.push({ lang, width, route, ...measure });
        assert.ok(measure.document <= width + 1, `Horizontal overflow ${lang}/${route} at ${width}: ${JSON.stringify(measure)}`);
        if ((width === 390 || width === 1440) && ['', 'tools/date-converter/', 'tools/photo-resizer/'].includes(route)) {
          await shot(`${lang}-${route ? route.split('/')[1] : 'home'}-${width}`);
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await go(`/${lang}/`);
    await page.locator('#tool-search').fill('jagga');
    assert.equal(await page.locator('[data-tool-card]:visible').count(), 1);
    assert.equal(await page.locator('[data-tool-card]:visible').getAttribute('data-tool-id'), 'land-converter');
    await page.locator('#tool-search').fill('प्रीति');
    assert.equal(await page.locator('[data-tool-card]:visible').count(), 1);
    await page.locator('#tool-search').fill('');
    await page.evaluate(() => localStorage.removeItem('sajilo-favorites'));
    await page.reload();
    await page.locator('[data-favorite=photo-resizer]').click();
    await go(`/${lang}/saved/`);
    assert.equal(await page.locator('[data-tool-card]:visible').count(), 1);
    assert.equal(await page.locator('[data-tool-card]:visible').getAttribute('data-tool-id'), 'photo-resizer');

    await go(`/${lang}/tools/date-converter/`);
    await page.locator('#date-example').click();
    assert.equal(await text('#result-iso'), 'BS 2082-01-01 = AD 2025-04-14');
    await page.locator('#copy-date').click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /AD: 2025-04-14/);
    await shot(`${lang}-date-result-390`);
    await page.locator('#date-day').fill('३२');
    await page.locator('#date-form [type=submit]').click();
    await visible('#form-error');
    assert.equal(await page.locator('#date-result').isVisible(), false);
    await page.locator('[data-direction=AD]').click();
    await page.locator('#date-example').click();
    await visible('#date-result');

    await go(`/${lang}/tools/age-calculator/`);
    await page.locator('#age-example').click();
    assert.equal(await text('#age-years'), lang === 'ne' ? '२५' : '25');
    await page.locator('#copy-age').click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /2000-02-29/);
    await shot(`${lang}-age-result-390`);

    await go(`/${lang}/tools/preeti-unicode/`);
    await page.locator('#preeti-example').click();
    assert.equal(await page.locator('#preeti-output').inputValue(), 'नेपाल\nनिर्माण\nEmail: hello@example.com');
    await page.locator('#copy-preeti').click();
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n'), await page.locator('#preeti-output').inputValue());
    const textDownload = page.waitForEvent('download');
    await page.locator('#download-preeti').click();
    const savedText = await textDownload;
    assert.equal(await readFile(await savedText.path(), 'utf8'), 'नेपाल\nनिर्माण\nEmail: hello@example.com');
    await shot(`${lang}-preeti-result-390`);

    await go(`/${lang}/tools/land-converter/`);
    await page.locator('#land-form [type=submit]').click();
    assert.equal(await text('#land-sqft-result'), lang === 'ne' ? '५,४७६' : '5,476');
    await shot(`${lang}-land-result-390`);

    await go(`/${lang}/tools/photo-resizer/`);
    const canvas = createCanvas(640, 480), ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6d8af'; ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#312840'; ctx.fillRect(180, 80, 280, 280);
    ctx.fillStyle = '#fff'; ctx.font = '28px sans-serif'; ctx.fillText('Sajilo test', 250, 220);
    await page.locator('#photo-file').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: canvas.toBuffer('image/png') });
    await page.waitForFunction(() => !document.querySelector('#photo-controls').disabled);
    await page.locator('#photo-width').fill('240');
    assert.equal(await page.locator('#photo-height').inputValue(), '180');
    await page.locator('#photo-mode').selectOption('crop');
    await page.locator('#photo-height').fill('240');
    await page.locator('#process-photo').click();
    await page.locator('#photo-result').waitFor({ state: 'visible' });
    const download = page.waitForEvent('download');
    await page.locator('#download-photo').click();
    const result = await download, bytes = await readFile(await result.path());
    const decoded = await loadImage(bytes);
    assert.equal(result.suggestedFilename(), 'sajilo-photo.jpg');
    assert.equal(decoded.width, 240); assert.equal(decoded.height, 240);
    assert.equal(bytes[0], 0xff); assert.equal(bytes[1], 0xd8);
    assert.ok((await text('#output-size')).includes(new Intl.NumberFormat(lang === 'ne' ? 'ne-NP' : 'en-US').format(bytes.length)));
    await shot(`${lang}-photo-result-390`);
    await page.locator('#clear-photo').click();
    assert.equal(await page.locator('#photo-result').isVisible(), false);
    assert.equal(await page.locator('#process-photo').isDisabled(), true);
  }
  assert.deepEqual(errors, [], 'Browser console/runtime errors');
  assert.deepEqual(external, [], 'Unexpected external requests');
  await writeFile(`${output}/browser-report.json`, JSON.stringify({ browser: browser.version(), responsiveChecks: measurements.length, languages: ['en', 'ne'], workflowsPerLanguage: 7, errors, external, measurements }, null, 2));
  console.log(`PASS: ${measurements.length} responsive page/viewport checks; 14 real-browser workflows; clipboard, UTF-8 text and real JPEG download; zero runtime errors or external requests. Browser ${browser.version()}. Screenshots in ${output}.`);
} finally { await browser.close(); }
