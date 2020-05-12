
const typescript = require("@rollup/plugin-typescript");
const resolve = require("@rollup/plugin-node-resolve");
const input = "src/index.ts";
const output = "./lib/index";

/** @type {import('rollup').RollupOptions} */
const options = {
	input,
	output: [
		{
			file: output + ".js",
			format: 'es',
			sourcemap: true
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
		}
	],
	plugins: [
		typescript({
			tsconfig: "src/tsconfig.json"
		}),
		resolve()
	]
};

/** @type {import('rollup').RollupOptions} */
const es3Options = {
	output: [
		{
			file: output + ".es3.common.js",
			format: 'cjs',
			sourcemap: true
		}
	],
	plugins: [
		typescript({
			tsconfig: "src/tsconfig.json",
			lib: ["es5", "es6", "dom"],
			target: "ES3"
		}),
		resolve()
	]
};

export default cliArgs => {
	if (cliArgs.es3) {
		delete cliArgs.es3;
		Object.assign(options, es3Options);
	}
	return options;
};