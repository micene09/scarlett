import RestClient, { RestOptions } from "../src/index";
import { startWebServer, stopWebServer, ITestStatusCodeResponse, ITestJsonResponse, ITestMirrorResponse } from "./runtime.setup";
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

describe('Request utilities and shortcuts', () => {
	test("Typed response data (responseType)", async () => {
		const response1 = await baseClient.get<ITestJsonResponse>("/json");
		expect(response1.data!.fake).toEqual("model");
		expect(response1.request.options.responseType).toEqual("json");

		const response2 = await baseClient.delete<string>("/text", { responseType: "text" });
		expect(response2.data).toEqual("text");
		expect(response2.request.options.responseType).toEqual("text");

		const response3 = await baseClient.get("/status-code/200/empty", { responseType: undefined });
		expect(response3.data).toBeNull();
		expect(response3.request.options.responseType).toBeUndefined();
		const response3AsText = await response3.fetchResponse?.text();
		expect(response3AsText).toEqual("");

		const response4 = await baseClient.get("/status-code/200/empty", { responseType: null });
		expect(response4.data).toBeNull();
		expect(response4.request.options.responseType).toBeNull();
		const response4AsText = await response4.fetchResponse?.text();
		expect(response4AsText).toEqual("");

		const response5 = await baseClient.get<ITestStatusCodeResponse, string | null>("/status-code/500", {
			throw: false,
			responseType(request, response) {
				if (response?.status === 500)
					return "text";

				return "json";
			}
		});
		expect(response5.request.options.responseType).toEqual("text");
		expect(typeof response5.error?.data).toEqual("string");
	});
	test("Auto-translation for objects on body property", async () => {
		const obj = { test: 1, x: null };
		const response = await baseClient.post<ITestMirrorResponse>("/mirror", { body: obj });
		const responseAsText = response.data?.body;
		expect(responseAsText).toEqual('{"test":1,"x":null}');
	});
	test("Object to query string", async () => {
		const response = await baseClient.get<any>("/mirror", {
			responseType: "json",
			query: { a: "1", b: "2", c: 3 }
		});
		expect(response.data.queryString).toEqual("a=1&b=2&c=3");
	});
	test("Query string transformer before send", async () => {
		const response = await baseClient.get<any>("/mirror", {
			responseType: "json",
			query: { a: "1", b: "2", some: ["one", "two"] },
			queryParamsTransformer: (key, value) => {
				if (key === "some")
					return value.join(",");
				return value;
			}
		});
		expect(decodeURIComponent(response.data.queryString)).toEqual("a=1&b=2&some=one,two");
	});
	test("Cache responses using custom keys", async () => {
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
	});
	test("Abort request supported", async () => {
		let abortController = new AbortController()
		const rest = baseClient.options.clone()
			.set("responseType", "text")
			.set("throw", false)
			.createRestClient()
		const milliseconds = 10000;

		let requestedAt = Date.now()
		setTimeout(() => abortController.abort(), 200)
		await rest.get<string>(`/reply-in/${milliseconds}/milliseconds`, { abortController })
		let elapsed = Date.now() - requestedAt
		expect(elapsed).toBeLessThan(milliseconds)

		requestedAt = Date.now()
		abortController = new AbortController();
		abortController.abort();
		await rest.get<string>(`/reply-in/${milliseconds}/milliseconds`, { abortController })
		elapsed = Date.now() - requestedAt
		expect(elapsed).toBeLessThan(10)
	})
	test("Repeat the same request using the response object", async () => {
		const expected = "a=1&b=2&c=3";

		const firstR = await baseClient.get<ITestMirrorResponse>("/mirror", {
			query: { a: "1", b: "2", c: 3 }
		});
		expect(firstR.data?.queryString).toEqual(expected);

		const secondR = await firstR.repeat();
		expect(secondR.data?.queryString).toEqual(expected);

		const thirdR = await secondR.repeat({
			queryParamsIncludeEmpty: true,
			query: { a: "1", b: "2", c: 3, d: "" }
		});
		expect(thirdR.data?.queryString).toEqual(expected + "&d=");
	})
});