import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: "node",
		testTimeout: 120000,
		coverage: {
			provider: "c8",
			reporter: ["json", "text"]
		}
	}
});
