import { expect, test } from '@playwright/test';
import { formSlugs, htmlDir } from '../lib/forms.js';
import { serveDir } from '../lib/server.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REFERENCE_FORM = 'pre-operative-assessment-by-clinician';

function hasFormExport(slug: string): boolean {
  const index = join(htmlDir(slug), 'index.html');
  return existsSync(index) && readFileSync(index, 'utf8').includes('form-export.js');
}

/**
 * Precise round-trip on the reference form: fill two known fields, download
 * JSON (asserting the exact filename pattern and that the content carries
 * both filled values under their real field paths), sanity-check XML/CSV/TSV
 * each download and carry a filled value, Start over, then import the JSON
 * back in and assert both fields are restored.
 */
test.skip(!hasFormExport(REFERENCE_FORM), `${REFERENCE_FORM} does not have form-export.js wired`);
test(`${REFERENCE_FORM} wizard export -> reset -> import round-trips the same values`, async ({
  page,
}) => {
  page.on('dialog', (d) => d.accept());

  const dir = htmlDir(REFERENCE_FORM);
  const server = await serveDir(dir);
  try {
    await page.goto(`${server.url}/index.html`, { waitUntil: 'networkidle' });

    const firstName = page.locator('#patient-firstName');
    const lastName = page.locator('#patient-lastName');
    await expect(firstName).toBeVisible();
    await firstName.fill('Priya');
    await lastName.fill('Anand');

    const jsonBtn = page.getByRole('button', { name: 'Download JSON' });
    const xmlBtn = page.getByRole('button', { name: 'Download XML' });
    const csvBtn = page.getByRole('button', { name: 'Download CSV' });
    const tsvBtn = page.getByRole('button', { name: 'Download TSV' });
    await expect(jsonBtn).toBeVisible();
    await expect(xmlBtn).toBeVisible();
    await expect(csvBtn).toBeVisible();
    await expect(tsvBtn).toBeVisible();

    const [jsonDownload] = await Promise.all([page.waitForEvent('download'), jsonBtn.click()]);
    expect(jsonDownload.suggestedFilename()).toMatch(
      new RegExp(`^${REFERENCE_FORM}-\\d{4}-\\d{2}-\\d{2}\\.json$`),
    );
    const jsonStream = await jsonDownload.createReadStream();
    const jsonChunks: Buffer[] = [];
    for await (const c of jsonStream) jsonChunks.push(c as Buffer);
    const exported = Buffer.concat(jsonChunks).toString('utf8');
    const parsed = JSON.parse(exported);
    expect(parsed.patient.firstName).toBe('Priya');
    expect(parsed.patient.lastName).toBe('Anand');

    // Sanity-check the other three formats download without asserting full
    // content shape (JSON is the round-trip contract; XML/CSV/TSV just need
    // to fire and carry the filled value somewhere in the text).
    for (const [btn, ext] of [
      [xmlBtn, 'xml'],
      [csvBtn, 'csv'],
      [tsvBtn, 'tsv'],
    ] as const) {
      const [dl] = await Promise.all([page.waitForEvent('download'), btn.click()]);
      expect(dl.suggestedFilename()).toMatch(new RegExp(`\\.${ext}$`));
      const stream = await dl.createReadStream();
      const chunks: Buffer[] = [];
      for await (const c of stream) chunks.push(c as Buffer);
      expect(Buffer.concat(chunks).toString('utf8')).toContain('Priya');
    }

    // Start over: clears both fields.
    await page.getByRole('button', { name: /reset|start over/i }).click();
    await expect(firstName).toHaveValue('');
    await expect(lastName).toHaveValue('');

    // Import the previously-exported JSON back in.
    await page.setInputFiles('#form-import-input', {
      name: `${REFERENCE_FORM}-import.json`,
      mimeType: 'application/json',
      buffer: Buffer.from(exported, 'utf8'),
    });

    await expect(firstName).toHaveValue('Priya');
    await expect(lastName).toHaveValue('Anand');
  } finally {
    await server.stop();
  }
});

/**
 * Generic fleet-wide round-trip: every other form with js/form-export.js
 * wired, field shapes unknown. Fills the first visible free-text input with
 * a unique marker (skipping the content assertions if a form has none),
 * downloads JSON (filename + marker present in content), Start-overs, then
 * imports the JSON back in and asserts the same input shows the marker
 * again. Weaker than the reference form's precise assertions, but exercises
 * the real button-click / download / file-input path on every rolled-out
 * form rather than just "the page loads".
 */
for (const slug of formSlugs()) {
  if (slug === REFERENCE_FORM || !hasFormExport(slug)) continue;

  test(`${slug} wizard export -> reset -> import round-trips a filled field`, async ({ page }) => {
    page.on('dialog', (d) => d.accept());

    const dir = htmlDir(slug);
    const server = await serveDir(dir);
    try {
      await page.goto(`${server.url}/index.html`, { waitUntil: 'networkidle' });

      const marker = 'ExportImportE2EMarker';
      const textInput = page
        .locator('main input[type="text"]:visible, main input:not([type]):visible')
        .first();
      const hasTextInput = (await textInput.count()) > 0;
      if (hasTextInput) {
        await textInput.fill(marker);
      }

      const jsonBtn = page.getByRole('button', { name: 'Download JSON' });
      await expect(jsonBtn).toBeVisible();
      const [jsonDownload] = await Promise.all([page.waitForEvent('download'), jsonBtn.click()]);
      expect(jsonDownload.suggestedFilename()).toMatch(
        new RegExp(`^${slug}-\\d{4}-\\d{2}-\\d{2}\\.json$`),
      );
      const jsonStream = await jsonDownload.createReadStream();
      const jsonChunks: Buffer[] = [];
      for await (const c of jsonStream) jsonChunks.push(c as Buffer);
      const exported = Buffer.concat(jsonChunks).toString('utf8');
      expect(() => JSON.parse(exported)).not.toThrow();
      if (hasTextInput) {
        expect(exported).toContain(marker);
      }

      const resetBtn = page.getByRole('button', { name: /reset|start over/i }).first();
      if ((await resetBtn.count()) > 0) {
        await resetBtn.click();
        if (hasTextInput) {
          await expect(textInput).not.toHaveValue(marker);
        }
      }

      await page.setInputFiles('#form-import-input', {
        name: `${slug}-import.json`,
        mimeType: 'application/json',
        buffer: Buffer.from(exported, 'utf8'),
      });

      if (hasTextInput) {
        await expect(textInput).toHaveValue(marker);
      }
    } finally {
      await server.stop();
    }
  });
}
