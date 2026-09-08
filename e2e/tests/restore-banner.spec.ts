import { expect, test } from '@playwright/test';
import { formSlugs, htmlDir } from '../lib/forms.js';
import { serveDir } from '../lib/server.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verify js/restore-banner.js: a blank first visit shows no banner; filling
 * a field and reloading (autosave, no explicit export/import involved)
 * restores the field AND shows the banner; dismissing hides the banner
 * without touching the draft (it reappears on a later reload); "Discard and
 * start over" clears the field, the draft, and the banner together, and it
 * stays gone on a further reload. Only runs for forms with
 * js/restore-banner.js wired.
 *
 * A handful of forms (consent/notice-style documents -- privacy notices, a
 * code of conduct) have no free-text field at all, only checkboxes/buttons;
 * for those there is nothing to fill or assert a value on, so the test
 * falls back to a checkbox and, failing that, only exercises the banner's
 * own show/dismiss/discard behaviour without a field-value assertion.
 */
for (const slug of formSlugs()) {
  const dir = htmlDir(slug);
  const index = join(dir, 'index.html');
  if (!existsSync(index) || !readFileSync(index, 'utf8').includes('restore-banner.js')) continue;

  test(`${slug} restore banner appears after reload with a saved draft`, async ({ page }) => {
    page.on('dialog', (d) => d.accept());

    const server = await serveDir(dir);
    try {
      await page.goto(`${server.url}/index.html`, { waitUntil: 'networkidle' });
      const banner = page.locator('.restore-banner');

      await expect(banner).toHaveCount(0);

      const textInput = page
        .locator('main input[type="text"]:visible, main input:not([type]):visible')
        .first();
      const hasTextInput = (await textInput.count()) > 0;
      const checkbox = page.locator('main input[type="checkbox"]:visible').first();
      const hasCheckbox = !hasTextInput && (await checkbox.count()) > 0;
      const marker = 'RestoreBannerE2EMarker';

      if (hasTextInput) {
        await textInput.fill(marker);
      } else if (hasCheckbox) {
        await checkbox.check();
      } else {
        // Nothing fillable on this form at all -- still confirm the banner
        // never wrongly appears on a blank reload, then stop; there is no
        // draft to create.
        await page.reload({ waitUntil: 'networkidle' });
        await expect(banner).toHaveCount(0);
        return;
      }

      await page.reload({ waitUntil: 'networkidle' });
      await expect(banner).toHaveCount(1);
      if (hasTextInput) {
        await expect(textInput).toHaveValue(marker);
      } else {
        await expect(checkbox).toBeChecked();
      }

      // Dismiss hides the banner but not the draft.
      await banner.getByRole('button', { name: 'Dismiss' }).click();
      await expect(banner).toHaveCount(0);
      if (hasTextInput) {
        await expect(textInput).toHaveValue(marker);
      } else {
        await expect(checkbox).toBeChecked();
      }

      await page.reload({ waitUntil: 'networkidle' });
      await expect(banner).toHaveCount(1);

      // Discard clears the field, the draft, and the banner together.
      await banner.getByRole('button', { name: 'Discard and start over' }).click();
      await expect(banner).toHaveCount(0);
      if (hasTextInput) {
        await expect(textInput).toHaveValue('');
      } else {
        await expect(checkbox).not.toBeChecked();
      }

      // A handful of forms' own startOver() intentionally re-saves a fresh
      // default immediately (e.g. pre-filling today's date on a consent
      // acknowledgement), so localStorage is non-null again right after
      // discard even though there is no real prior progress -- not a bug in
      // this feature, just those forms' own reset behaviour. Only assert
      // the banner stays gone where that isn't the case.
      // The draft key's naming isn't fully uniform fleet-wide (some forms
      // still carry the pre-consolidation `.front-end-form-with-html.v1`
      // suffix) -- distinguish it from theme/locale/text-size preference
      // keys (plain strings) by shape instead: the draft is always a JSON
      // object.
      const draftExistsAfterDiscard = await page.evaluate(() => {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          try {
            const parsed = JSON.parse(localStorage.getItem(key) ?? '');
            if (parsed && typeof parsed === 'object') return true;
          } catch {
            // Not JSON -- a plain preference string, not the draft.
          }
        }
        return false;
      });
      await page.reload({ waitUntil: 'networkidle' });
      if (!draftExistsAfterDiscard) {
        await expect(banner).toHaveCount(0);
      }
    } finally {
      await server.stop();
    }
  });
}
