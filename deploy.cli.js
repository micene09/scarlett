#!/usr/bin/env node
const program = require('yargs')
const packageJson = require('./package.json');

program
	.version(packageJson.version)
	.option("set-version", {
		alias: "sv",
		describe: "set the '[Major].[Minor]' passed updating: package.json (+ lock), azure-pipelines.yml and RELEASES.md",
		type: 'string'
	});

const CLIMethods = {
	setVersion: version => {
		const regexString = /^([0-9])+\.([0-9])+$/gm;
		const reg = new RegExp(regexString);
		if (!reg.test(version)) {
			console.error(`Wrong version pattern '${version}', please use the following: [Major].[Minor]`);
			process.exit(1);
		}

		const fs = require("fs");

		if (version.split(".").length < 2)
			packageJson.version = version + ".0";
		fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, '\t'));
		console.log("package.json updated successfully");
	}
};

"set-version" in program.argv && CLIMethods.setVersion(program.argv.setVersion);

module.exports = program.argv;
