import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: "node",
		setupFiles: "./vitest.setup.ts",
		testTimeout: 120000,
		coverage: {
			provider: "v8",
			reporter: ["json", "text"]
		}
	}
});