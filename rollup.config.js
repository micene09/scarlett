
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
const input = "src/index.ts";
const outDir = "./lib";
const output = `${outDir}/index`;

/** @type {import('rollup').RollupTypescriptOptions} */
const tsOptions = {
	tsconfig: "./tsconfig.json",
	declaration: true,
	declarationDir: ".",
	include: [ "src/*.ts", "src/**/*.ts" ],
};

/** @type {import('rollup').RollupOptions} */
const options = {
	input,
	output: [
		{
			file: output + ".js",
			format: 'esm',
			sourcemap: true
		},
		{
			file: output + ".min.js",
			format: 'esm',
			sourcemap: true,
			plugins: [terser()]
		},
		{
			file: output + ".common.js",
			format: 'cjs',
			sourcemap: true
		},
		{
			name: "scarlett",
			file: output + ".umd.js",
			format: 'umd',
			sourcemap: true
		},
		{
			name: "scarlett",
			file: output + ".umd.min.js",
			format: 'umd',
			sourcemap: true,
			plugins: [terser()]
		}
	],
	plugins: [
		typescript(tsOptions),
		resolve()
	],
	onwarn(warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		warn(warning);
	}
};

/** @type {import('rollup').RollupOptions} */
const es3Options = {
	output: [
		{
			file: output + ".es3.common.js",
			format: 'cjs',
			sourcemap: true
		},
		{
			file: output + ".es3.common.min.js",
			format: 'cjs',
			sourcemap: true,
			plugins: [terser()]
		}
	],
	plugins: [
		typescript({
			...tsOptions,
			lib: ["es5", "es6", "dom"],
			target: "ES3",
			declaration: false
		}),
		resolve()
	]
};

/** @type {import('rollup').RollupOptions} */
const es6Options = {
	output: [
		{
			file: output + ".es6.common.js",
			format: 'cjs',
			sourcemap: true
		},
		{
			file: output + ".es6.common.min.js",
			format: 'cjs',
			sourcemap: true,
			plugins: [terser()]
		}
	],
	plugins: [
		typescript({
			...tsOptions,
			lib: ["es6", "dom"],
			target: "ES6",
			declaration: false
		}),
		resolve()
	]
};

export default cliArgs => {
	if (cliArgs.es3) {
		delete cliArgs.es3;
		Object.assign(options, es3Options);
	}
	if (cliArgs.es6) {
		delete cliArgs.es6;
		Object.assign(options, es6Options);
	}
	return options;
};