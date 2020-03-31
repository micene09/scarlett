module.exports = {
	testEnvironment: "node",
	preset: 'ts-jest',
	testMatch: [ "<rootDir>/tests/**/*.test.ts" ],
	testPathIgnorePatterns: [ "<rootDir>/tests/*.setup.ts" ],
	moduleFileExtensions: [
		'js',
		'jsx',
		'json',
		'ts',
		'tsx'
	],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
		"^.+\\.jsx?$": "babel-jest",
	},
	transformIgnorePatterns: [
		'/node_modules/'
	],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	reporters: [
		"default",
		[ "jest-junit", { outputDirectory: "./test-results/" } ]
	],
	globals: {
		'ts-jest': {
			tsConfig: "<rootDir>/tests/tsconfig.json",
			diagnostics: false
		}
	}
}
