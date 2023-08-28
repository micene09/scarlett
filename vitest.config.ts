import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: "node",
		testTimeout: 120000,
		coverage: {
			provider: "v8",
			reporter: ["json", "text"]
		}
	}
});