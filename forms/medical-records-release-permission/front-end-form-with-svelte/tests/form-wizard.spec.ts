import { test, expect } from '@playwright/test';

test.describe('Form Wizard', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('landing page shows title and begin button', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Medical Records Release Permission' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Begin Form' })).toBeVisible();
	});

	test('clicking begin navigates to step 1', async ({ page }) => {
		await page.getByRole('button', { name: 'Begin Form' }).click();
		await expect(page).toHaveURL('/assessment/1');
		await expect(page.getByText('Patient Information')).toBeVisible();
	});

	test('can fill step 1 and navigate to step 2', async ({ page }) => {
		await page.getByRole('button', { name: 'Begin Form' }).click();

		await page.fill('#firstName', 'Jane');
		await page.fill('#lastName', 'Smith');
		await page.fill('#dob', '1985-06-15');
		await page.fill('#address', '42 Oak Lane, London, SW1A 1AA');
		await page.fill('#nhsNumber', '943 476 5919');

		await page.getByRole('link', { name: /Next/i }).click();
		await expect(page).toHaveURL('/assessment/2');
		await expect(page.getByText('Authorized Recipient')).toBeVisible();
	});

	test('can navigate back to previous step', async ({ page }) => {
		await page.getByRole('button', { name: 'Begin Form' }).click();
		await page.getByRole('link', { name: /Next/i }).click();
		await expect(page).toHaveURL('/assessment/2');

		await page.getByRole('link', { name: /Previous/i }).click();
		await expect(page).toHaveURL('/assessment/1');
	});

	test('full wizard journey through all 8 steps to report', async ({ page }) => {
		await page.getByRole('button', { name: 'Begin Form' }).click();

		// Step 1: Patient Information
		await page.fill('#firstName', 'Jane');
		await page.fill('#lastName', 'Smith');
		await page.fill('#dob', '1985-06-15');
		await page.fill('#address', '42 Oak Lane, London');
		await page.fill('#nhsNumber', '943 476 5919');
		await page.getByRole('link', { name: /Next/i }).click();

		// Step 2: Authorized Recipient
		await page.fill('#recipientName', 'Dr James Wilson');
		await page.fill('#recipientOrganization', 'Royal London Hospital');
		await page.fill('#recipientAddress', 'Whitechapel Rd, London');
		await page.getByRole('link', { name: /Next/i }).click();

		// Step 3: Records to Release
		await page.getByLabel('Laboratory Results').check();
		await page.getByRole('link', { name: /Next/i }).click();

		// Step 4: Purpose of Release
		await page.getByLabel('Continuing Care').check();
		await page.getByRole('link', { name: /Next/i }).click();

		// Step 5: Authorization Period
		await page.fill('#startDate', '2026-03-08');
		await page.fill('#endDate', '2026-09-08');
		await page.getByRole('link', { name: /Next/i }).click();

		// Step 6: Restrictions
		await page.getByRole('link', { name: /Next/i }).click();

		// Step 7: Patient Rights
		await page.getByRole('link', { name: /Next/i }).click();

		// Step 8: Signature & Consent — Submit
		await page.getByRole('button', { name: 'Submit Form' }).click();

		// Report page
		await expect(page).toHaveURL('/report');
		await expect(page.getByText('Release Authorization Summary')).toBeVisible();
		await expect(page.getByText('Jane Smith')).toBeVisible();
	});

	test('conditional field: purpose "Other" shows details textarea', async ({ page }) => {
		await page.getByRole('button', { name: 'Begin Form' }).click();

		// Navigate to step 4
		await page.goto('/assessment/4');

		// Select "Other"
		await page.getByLabel('Other').check();

		// The "other details" field should be visible
		await expect(page.locator('#otherDetails')).toBeVisible();
	});

	test('report shows completeness score', async ({ page }) => {
		// Submit empty form to get Incomplete status
		await page.getByRole('button', { name: 'Begin Form' }).click();

		// Navigate directly to step 8 and submit
		await page.goto('/assessment/8');
		await page.getByRole('button', { name: 'Submit Form' }).click();

		await expect(page).toHaveURL('/report');
		await expect(page.getByText('Complete')).toBeVisible();
	});
});
