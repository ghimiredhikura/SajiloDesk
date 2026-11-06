import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base = (process.env.TEST_BASE_URL || 'http://127.0.0.1:8791').replace(/\/$/, '');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const checks = [], errors = [];
async function visitor(options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 20000));
  return { context, page };
}
try {
  for (const language of ['ne', 'en']) {
    const { context, page } = await visitor();
    if (language === 'en') await context.addInitScript(() => localStorage.setItem('sajilo-language', 'en'));
    assert.equal((await page.goto(`${base}/`)).status(), 200);
    await page.clock.runFor(2900);
    assert.equal(new URL(page.url()).pathname, '/');
    assert.equal(await page.locator('.root-welcome h1').isVisible(), true);
    await page.clock.runFor(200);
    await page.waitForURL(`${base}/${language}/`);
    checks.push(`${language}: welcome remains for 2.9s, then opens the preferred language after 3s`);
    await context.close();
  }
  {
    const { context, page } = await visitor();
    await page.goto(`${base}/`);
    const choice = page.locator('.root-welcome [data-language=en]');
    await choice.focus();
    await page.clock.runFor(5000);
    assert.equal(new URL(page.url()).pathname, '/', 'Language focus pauses the automatic redirect');
    await choice.evaluate(link => link.click());
    await page.waitForURL(`${base}/en/`);
    assert.equal(await page.evaluate(() => localStorage.getItem('sajilo-language')), 'en');
    checks.push('Keyboard users can take longer; choosing a language opens it immediately');
    await context.close();
  }
  {
    const { context, page } = await visitor();
    await page.goto(`${base}/`);
    const choice = page.locator('.root-welcome [data-language=en]');
    await page.clock.runFor(2500);
    await choice.dispatchEvent('pointerdown');
    await page.clock.runFor(1000);
    assert.equal(new URL(page.url()).pathname, '/', 'Pointer interaction cancels a pending redirect');
    await choice.evaluate(link => link.click());
    await page.waitForURL(`${base}/en/`);
    checks.push('Pointer selection does not race the automatic redirect');
    await context.close();
  }
  {
    const { context, page } = await visitor();
    await context.addInitScript(() => { Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); }; });
    await page.goto(`${base}/`); await page.clock.runFor(3100);
    await page.waitForURL(`${base}/ne/`);
    checks.push('Blocked storage keeps the Nepali default');
    await context.close();
  }
  for (const language of ['ne', 'en']) {
    const { context, page } = await visitor();
    await page.goto(`${base}/${language}/`);
    assert.equal(await page.locator('.root-welcome').count(), 0);
    await page.clock.runFor(5000);
    assert.equal(new URL(page.url()).pathname, `/${language}/`);
    checks.push(`${language}: direct language links open without a welcome delay`);
    await context.close();
  }
  {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage(); await page.goto(`${base}/`);
    assert.equal(await page.locator('.root-welcome h1').isVisible(), true);
    assert.equal(await page.locator('.root-welcome [data-language=ne]').getAttribute('href'), '/ne/');
    assert.equal(await page.locator('.root-welcome [data-language=en]').getAttribute('href'), '/en/');
    await page.locator('.root-welcome [data-language=en]').click();
    await page.waitForURL(`${base}/en/`);
    checks.push('No-JavaScript welcome keeps working language links');
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'PASS', checks, pageErrors: errors.length }, null, 2));
} finally { await browser.close(); }
