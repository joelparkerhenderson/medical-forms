import { expect, test } from '@playwright/test';
import { formSlugs, htmlDir } from '../lib/forms.js';
import { serveDir } from '../lib/server.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verify the generic wizard-level export/import (js/form-export.js +
 * js/form-import.js): fill a couple of fields, download the JSON export,
 * start over (clearing the form), then import that same JSON file back and
 * assert the fields are restored. Only runs for forms whose wizard has
 * wired js/form-export.js — currently the reference form only; the fleet
 * rollout is separate follow-on work.
 */
for (const slug of formSlugs()) {
  const dir = htmlDir(slug);
  const index = join(dir, 'index.html');
  if (!existsSync(index) || !readFileSync(index, 'utf8').includes('form-export.js')) continue;

  test(`${slug} wizard export -> reset -> import round-trips the same values`, async ({
    page,
  }) => {
    page.on('dialog', (d) => d.accept());

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

      const [jsonDownload] = await Promise.all([
        page.waitForEvent('download'),
        jsonBtn.click(),
      ]);
      expect(jsonDownload.suggestedFilename()).toMatch(
        new RegExp(`^${slug}-\\d{4}-\\d{2}-\\d{2}\\.json$`),
      );
      const jsonStream = await jsonDownload.createReadStream();
      const jsonChunks: Buffer[] = [];
      for await (const c of jsonStream) jsonChunks.push(c as Buffer);
      const exported = Buffer.concat(jsonChunks).toString('utf8');
      const parsed = JSON.parse(exported);
      expect(parsed.patient.firstName).toBe('Priya');
      expect(parsed.patient.lastName).toBe('Anand');

      // Sanity-check the other three formats download without asserting
      // full content shape (JSON is the round-trip contract; XML/CSV/TSV
      // just need to fire and carry the filled value somewhere in the text).
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
        name: `${slug}-import.json`,
        mimeType: 'application/json',
        buffer: Buffer.from(exported, 'utf8'),
      });

      await expect(firstName).toHaveValue('Priya');
      await expect(lastName).toHaveValue('Anand');
    } finally {
      await server.stop();
    }
  });
}
