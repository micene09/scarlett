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
		'^.+\\.ts?$': 'ts-jest',
		"^.+\\.js?$": "babel-jest",
	},
	transformIgnorePatterns: [
		'/node_modules/'
	],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	globals: {
		'ts-jest': {
			tsconfig: "<rootDir>/tsconfig.json",
			diagnostics: false
		}
	}
}
