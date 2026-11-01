// Prints built document pages to PDF with Chromium (Playwright).
// Usage: node pdf.js <page.html> <out.pdf> [rules|privacy]
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const [src, out, kind = 'rules'] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  const options = { path: out, format: 'A4', printBackground: true };
  if (kind === 'rules') {
    const footer = await page.$eval('meta[name=footer]', m => m.content);
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    Object.assign(options, {
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;margin:0 20mm;padding-top:4px;border-top:0.6px solid #d9dfec;
        display:flex;justify-content:space-between;font-family:Arial,Helvetica,sans-serif;font-size:7.5px;color:#5b6475">
        <span>${esc(footer)}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    });
  } else {
    options.margin = { top: '16mm', bottom: '16mm', left: '16mm', right: '16mm' };
  }
  await page.pdf(options);
  await browser.close();
  console.log(out);
})();
