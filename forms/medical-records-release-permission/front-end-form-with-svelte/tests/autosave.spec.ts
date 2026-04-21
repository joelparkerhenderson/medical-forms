import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'medical-records-release-permission-autosave';

test.describe('Autosave to localStorage', () => {
	test('persists form data across page reload', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Begin Form' }).click();

		// Fill in some data
		await page.fill('#firstName', 'Test');
		await page.fill('#lastName', 'Patient');

		// Wait for debounced save (500ms)
		await page.waitForTimeout(700);

		// Verify data is in localStorage
		const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(stored).not.toBeNull();
		const parsed = JSON.parse(stored!);
		expect(parsed.patientInformation.firstName).toBe('Test');
		expect(parsed.patientInformation.lastName).toBe('Patient');

		// Reload the page and navigate back to step 1
		await page.reload();
		await page.getByRole('button', { name: 'Begin Form' }).click();

		// Data should be restored
		await expect(page.locator('#firstName')).toHaveValue('Test');
		await expect(page.locator('#lastName')).toHaveValue('Patient');
	});

	test('clears localStorage on reset (New Form)', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Begin Form' }).click();

		// Fill in data and wait for save
		await page.fill('#firstName', 'ToBeCleared');
		await page.waitForTimeout(700);

		// Navigate to step 8 and submit to get to report
		await page.goto('/assessment/8');
		await page.getByRole('button', { name: 'Submit Form' }).click();
		await expect(page).toHaveURL('/report');

		// Click New Form which calls assessment.reset()
		await page.getByRole('button', { name: 'New Form' }).click();
		await expect(page).toHaveURL('/');

		// localStorage should be cleared
		const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(stored).toBeNull();
	});
});
