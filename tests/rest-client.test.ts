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

describe('Features', () => {
	test("RestOptions builder", async () => {
		const restOpts1 = baseClient.options.clone()
			.set("responseType", "json")
			.set("headers", new Headers({ "x-restoptions": "1" }))
			.createRestClient();

		const restOpts2 = restOpts1.options.clone()
			.set("responseType", "json")
			.set("headers", new Headers({ "x-restoptions": "2" }))
			.createRestClient();

		const restOpts3 = baseOptions.clone()
			.set("headers", new Headers({ "x-restoptions": "3" }))
			.createRestClient();

		const resp1 = await restOpts1.get<ITestMirrorResponse>("/mirror");
		const resp2 = await restOpts2.get<ITestMirrorResponse>("/mirror");
		const resp3 = await restOpts3.get<ITestMirrorResponse>("/mirror");

		expect(resp1.data?.headers["x-restoptions"]).toEqual("1");
		expect(resp2.data?.headers["x-restoptions"]).toEqual("2");
		expect(resp3.data?.headers["x-restoptions"]).toEqual("3");
	});
	test("Override global settings on local requests", async () => {
		const response = await baseClient.get<string>("/mirror", { responseType: "text" });
		const respType = typeof response.data;
		expect(respType).toEqual("string");
	});
	test("Override global settings using merge vs assign strategies", async () => {

		const restOverrides = baseOptions.clone()
			.set("query", { a: 1, b: 2 }) // << default query-string for every request
			.createRestClient();

		// Merge strategy
		restOverrides.options.set("overrideStrategy", "merge");

		const merged = await restOverrides.get<ITestMirrorResponse>("/mirror", { query: { c: 3 } });
		expect(merged.data?.queryString).toEqual("a=1&b=2&c=3"); // << merged!

		// Assign strategy
		restOverrides.options.set("overrideStrategy", "assign");

		const assigned = await restOverrides.get<ITestMirrorResponse>("/mirror", { query: { c: 3 } });
		expect(assigned.data?.queryString).toEqual("c=3"); // << assigned!
	});
	test("Global handlers (onRequest, onResponse, onError)", async () => {
		const onError = vi.fn();
		const onRequest = vi.fn();
		const onResponse = vi.fn();
		const rest = baseClient.options.clone()
			.set("responseType", "json")
			.set("throw", true)
			.set("onRequest", () => onRequest())
			.set("onResponse", () => onResponse())
			.set("onError", () => onError())
			.createRestClient();

		try {
			await rest.get<ITestMirrorResponse>("/mirror");
			await rest.get<ITestMirrorResponse>("/status-code/412/empty");
		} catch (e) {}

		expect(onRequest).toBeCalledTimes(2);
		expect(onResponse).toBeCalledTimes(1);
		expect(onError).toBeCalledTimes(1);
	});
	test("onRequest can be a Promise", async () => {
		const rest = baseClient.options.clone()
			.set("responseType", "json")
			.set("throw", false)
			.set("onRequest", (request: any) => new Promise<void>(resolve => {
				request.options.headers = new Headers({
					"X-Example": "1234"
				});
				setTimeout(() => resolve(), 600);
			}))
			.createRestClient();

		const response = await rest.get<ITestMirrorResponse>("/mirror");
		const headers = new Headers(response.data?.headers);
		expect(headers.get("X-Example")).toEqual("1234");
	});
});