
/** @type {import('../lib/index.d.ts')} */

import RestClient, { RestError } from "../lib/index";
import { HTTPStatusCode } from "../src/interfaces";
import { startWebServer, stopWebServer, ITestStatusCodeResponse, ITestJsonResponse, ITestMirrorResponse } from "./runtime.setup";
import { ok } from "assert";

let restClient: RestClient;
beforeAll(async done => {
	const host = await startWebServer();
	restClient = new RestClient({
		host,
		responseType: "json"
	});
	done();
});
afterAll(() => {
	stopWebServer();
});

describe('Features', () => {
	test("Typed response data (responseType)", async done => {
		const response = await restClient.get<ITestJsonResponse>("/json");
		expect(response.data!.fake).toEqual("model");
		done();
	});
	test("Can override global settings on local requests", async done => {
		const response = await restClient.request<string>("GET", "/mirror", { responseType: "text" });
		expect(response.data).not.toBeFalsy();
		done();
	});
	test("Auto-translation for objects on body property", async done => {
		const obj = { test: 1 };
		const response = await restClient.post<ITestMirrorResponse>("/mirror", { body: obj });
		const responseAsText = response.data?.body;
		expect(responseAsText).toEqual('{"test":1}');
		done();
	});
	test("Object to query string", async done => {
		const response = await restClient.get<any>("/mirror", {
			responseType: "json",
			query: { a: "1", b: "2", c: 3 }
		});
		expect(response.data.queryString).toEqual("a=1&b=2&c=3");
		done();
	});
	test("Query string transformer before send", async done => {
		const response = await restClient.get<any>("/mirror", {
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
			await restClient.get("/status-code/500", { throw: true });
			fail();
		}
		catch {
			ok("Error thrown successfully.");
			done();
		}
	});
	test("Custom Error Object Interfaces", async done => {

		const response = await restClient.get<any, ITestStatusCodeResponse>("/status-code/412");
		const errorData = response?.error?.data;
		// intellisense here should work data prop:
		expect(errorData?.statusText).toEqual("CustomStatusCode");
		expect(errorData?.statusCode).toEqual(412);
		done();
	});
	test("Custom Error Object handled as usual", async done => {
		try {
			await restClient.get("/status-code/412", { throw: true });
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
			const response = await restClient.get<ITestStatusCodeResponse>("/status-code/412", {
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
			await restClient.get<any>(`/reply-in/${ms}/milliseconds`, {
				responseType: "text",
				useCache: true,
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
		const response = await restClient.get<string>(`/reply-in/${ms}/milliseconds`, {
			responseType: "text",
			timeout: 1000
		});
		expect(response.error?.code).toEqual("timeout");
		expect(response.status).toEqual(HTTPStatusCode.RequestTimeout);
		done();
	})
	test("Repeat the same request using the response object", async done => {
		const expected = "a=1&b=2&c=3";

		const firstR = await restClient.get<any>("/mirror", {
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
});