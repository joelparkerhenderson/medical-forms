import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	timeout: 30000,
	retries: 0,
	use: {
		baseURL: 'http://localhost:5173',
		headless: true
	},
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: true,
		timeout: 30000
	}
});
