import RestClient, { RestError, RestOptions } from "../lib/index";
import { HTTPStatusCode } from "../src/interfaces";
import { startWebServer, stopWebServer, ITestStatusCodeResponse, ITestJsonResponse, ITestMirrorResponse } from "./runtime.setup";
import { ok } from "assert";

let baseClient: RestClient;
let baseOptions: RestOptions;
let host: string = "";
beforeAll(async done => {
	host = await startWebServer();
	baseOptions = new RestOptions()
		.set("host", host)
		.set("responseType", "json");
	baseClient = baseOptions.createRestClient();
	done();
});
afterAll(() => {
	stopWebServer();
});

describe('Features', () => {
	test("Typed response data (responseType)", async done => {
		const response = await baseClient.get<ITestJsonResponse>("/json");
		expect(response.data!.fake).toEqual("model");
		done();
	});
	test("Auto-translation for objects on body property", async done => {
		const obj = { test: 1 };
		const response = await baseClient.post<ITestMirrorResponse>("/mirror", { body: obj });
		const responseAsText = response.data?.body;
		expect(responseAsText).toEqual('{"test":1}');
		done();
	});
	test("Object to query string", async done => {
		const response = await baseClient.get<any>("/mirror", {
			responseType: "json",
			query: { a: "1", b: "2", c: 3 }
		});
		expect(response.data.queryString).toEqual("a=1&b=2&c=3");
		done();
	});
	test("Query string transformer before send", async done => {
		const response = await baseClient.get<any>("/mirror", {
			responseType: "json",
			query: { a: "1", b: "2", some: ["one", "two"] },
			queryParamsTransormer: (key, value) => {
				if (key === "some")
					return value.join(",");
				return value;
			}
		});
		expect(decodeURIComponent(response.data.queryString)).toEqual("a=1&b=2&some=one,two");
		done();
	});
	test("Can throw error if specified", async done => {
		try {
			await baseClient.get("/status-code/500", { throw: true });
			fail();
		}
		catch {
			ok("Error thrown successfully.");
			done();
		}
	});
	test("Custom Error Object Interfaces", async done => {

		const response = await baseClient.get<any, ITestStatusCodeResponse>("/status-code/412");
		const errorData = response?.error?.data;
		// intellisense here should work data prop:
		expect(errorData?.statusText).toEqual("CustomStatusCode");
		expect(errorData?.statusCode).toEqual(412);
		done();
	});
	test("Custom Error Object handled as usual", async done => {
		try {
			await baseClient.get("/status-code/412", { throw: true });
			fail();
		}
		catch(err) {
			const error = err as RestError<any, ITestStatusCodeResponse>;
			expect(error.data?.statusText).toEqual("CustomStatusCode");
			expect(error.data?.statusCode).toEqual(412);
			done();
		}
	});
	test("Errors can be filtered to react properly", async done => {
		try {
			const response = await baseClient.get<ITestStatusCodeResponse>("/status-code/412", {
				throw: true,
				throwExcluding: [{ method: "GET", statusCode: 412 }]
			});
			expect(response.data?.statusCode).toEqual(412);
			ok("Error filtered successfully.");
			done();
		}
		catch { fail(); }
	});
	test("Cache responses using custom keys", async done => {
		const cacheKey = "the very slow call...";
		const ms = 1000;
		async function repliedIn() {
			const starting = Date.now();
			await baseClient.get<any>(`/reply-in/${ms}/milliseconds`, {
				responseType: "text",
				internalCache: true,
				cacheKey
			});
			return Date.now() - starting;
		}
		const t1 = await repliedIn();
		const t2 = await repliedIn();
		expect(t2).toBeLessThan(t1);
		done();
	});
	test("Support for timeout requests", async done => {
		const ms = 2000;
		const response = await baseClient.get<string>(`/reply-in/${ms}/milliseconds`, {
			responseType: "text",
			timeout: 1000
		});
		expect(response.error?.code).toEqual("timeout");
		expect(response.status).toEqual(HTTPStatusCode.RequestTimeout);
		done();
	})
	test("Repeat the same request using the response object", async done => {
		const expected = "a=1&b=2&c=3";

		const firstR = await baseClient.get<any>("/mirror", {
			responseType: "json",
			query: { a: "1", b: "2", c: 3 }
		});
		expect(firstR.data.queryString).toEqual(expected);

		const secondR = await firstR.repeat();
		expect(secondR.data.queryString).toEqual(expected);

		const thirdR = await secondR.repeat({
			queryParamsIncludeEmpty: true,
			query: { a: "1", b: "2", c: 3, d: "" }
		});
		expect(thirdR.data.queryString).toEqual(expected + "&d=");

		done();
	})
	test("RestOptions builder", async done => {
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

		done();
	});
	test("Override global settings on local requests", async done => {
		const response = await baseClient.get<string>("/mirror", { responseType: "text" });
		const respType = typeof response.data;
		expect(respType).toEqual("string");
		done();
	});
	test("Override global settings using merge vs assign strategies", async done => {

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

		done();
	});
});