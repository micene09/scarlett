import RestClient, { RestError, RestOptions } from "../src/index";
import { startWebServer, stopWebServer, ITestStatusCodeResponse, ITestJsonResponse, ITestMirrorResponse } from "./runtime.setup";
import { fail, ok } from "assert";
import { beforeAll, afterAll, describe, test, expect, vi } from "vitest";

let baseClient: RestClient;
let baseOptions: RestOptions;
let host: string = "";
beforeAll(async () => {
	host = await startWebServer();
	baseOptions = new RestOptions()
		.set("host", host)
		.set("responseType", "json")
		.set("throw", true);
	baseClient = baseOptions.createRestClient();
});
afterAll(() => {
	stopWebServer();
});

describe('Timeout support', () => {
	test("Supported timeout on requests", async () => {
		const ms = 2000;
		const response = await baseClient.get<string>(`/reply-in/${ms}/milliseconds`, {
			responseType: "text",
			timeout: 100,
			throw: false
		});
		expect(response.status).toBeUndefined()
		expect(response.error?.code).toEqual("Timeout")
	})
	test("Timeout can also be disabled", async () => {
		const rest = baseClient.options.clone()
			.set("responseType", "text")
			.set("throw", false)
			.set("timeout", 0)
			.createRestClient();
		const response = await rest.get<string>(`/reply-in/1000/milliseconds`);
		expect(response.error).toBeFalsy();
	})
	test("Timeout error handling", async () => {
		const rest = baseClient.options.clone()
			.set("responseType", "text")
			.set("timeout", 100)
			.set("throwExcluding", [{ errorCode: "Timeout" }])
			.createRestClient();

		const response = await rest.get<string>(`/reply-in/1000/milliseconds`);
		expect(response.error?.code).toEqual("Timeout");
	})
});