import { setTimeout } from "timers/promises";
import { TestRestClient, useTestRestClient, useTestServer } from "./runtime.setup";
import { beforeAll, afterAll, describe, test, expect } from "vitest";

let stopWebServer = () => {};
let testServer = "";
beforeAll(async () => {
	const { host, stop } = await useTestServer();
	testServer = host as string
	stopWebServer = stop;
});
afterAll(() => stopWebServer());

describe('Request utilities and shortcuts using Functional API', () => {
	test("Typed response data (responseType)", async () => {

		const { requestJson, requestText, getStatusCodeEmpty, getStatusCode } = useTestRestClient(testServer);
		const response1 = await requestJson("GET");
		expect(response1.data!.fake).toEqual("model");
		expect(response1.request.options.responseType).toEqual("json");

		const response2 = await requestText("DELETE");
		expect(response2.data).toEqual("text");
		expect(response2.request.options.responseType).toEqual("text");

		const response3 = await getStatusCodeEmpty(200);
		expect(response3.data).toBeNull();
		expect(response3.request.options.responseType).toBeFalsy();
		const response3AsText = await response3.fetchResponse?.text();
		expect(response3AsText).toEqual("");

		const response4 = await getStatusCodeEmpty(200);
		expect(response4.data).toBeNull();
		expect(response4.request.options.responseType).toBeFalsy();
		const response4AsText = await response4.fetchResponse?.text();
		expect(response4AsText).toEqual("");

		const response5 = await getStatusCode(500, {
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
		const { mirror } = useTestRestClient(testServer);
		const response = await mirror("POST", { body: obj });
		const responseAsText = response.data?.body;
		expect(responseAsText).toEqual('{"test":1,"x":null}');
	});
	test("Object to query string", async () => {
		const { mirror } = useTestRestClient(testServer);
		const response = await mirror("GET", {
			responseType: "json",
			query: { a: "1", b: "2", c: 3 }
		});
		expect(response.data?.queryString).toEqual("a=1&b=2&c=3");
	});
	test("Query string transformer before send", async () => {
		const { mirror } = useTestRestClient(testServer);
		const response = await mirror("GET", {
			responseType: "json",
			query: { a: "1", b: "2", some: ["one", "two"] },
			queryParamsTransformer: (key, value) => {
				if (key === "some")
					return value.join(",");
				return value;
			}
		});
		expect(decodeURIComponent(response.data?.queryString ?? "")).toEqual("a=1&b=2&some=one,two");
	});
	test("Cache responses using custom keys", async () => {
		const cacheKey = "the very slow call...";
		const { delayedResponse, cacheClearByKey } = useTestRestClient(testServer);
		async function repliedIn(ms: number) {
			const starting = Date.now();
			await delayedResponse(ms, {
				cacheInMemory: true,
				cacheKey
			});
			return Date.now() - starting;
		}
		const t1 = await repliedIn(300);
		const t2 = await repliedIn(300);
		expect(t2).toBeLessThan(300);
		cacheClearByKey(cacheKey);
		const t3 = await repliedIn(400);
		expect(t3).toBeGreaterThan(t1);
	});
	test("Cache responses using expire mechanism", async () => {

		const { getTimestamp } = useTestRestClient(testServer);
		const cacheExpireAt = Date.now() + 500;
		const response = await getTimestamp({ cacheInMemory: true, cacheExpireAt });
		const cachedTimestamp = response.data ?? "";

		const firstTs = (await response.repeat()).data ?? "";
		expect(firstTs).toEqual(cachedTimestamp);

		const secondTs = (await response.repeat()).data ?? "";
		expect(secondTs).toEqual(cachedTimestamp);

		await setTimeout(500);
		const thirdTs = (await response.repeat()).data ?? "";
		expect(thirdTs).not.toEqual(cachedTimestamp);
	});
	test("Abort request supported", async () => {
		let abortController = new AbortController()
		const { setOption, delayedResponse } = useTestRestClient(testServer);
		setOption("responseType", "text");
		setOption("throw", false);
		const milliseconds = 200;

		let requestedAt = Date.now()
		setTimeout(milliseconds / 2).then(() => abortController.abort());
		await delayedResponse(milliseconds, { abortController })
		let elapsed = Date.now() - requestedAt
		expect(elapsed).toBeLessThan(milliseconds)

		requestedAt = Date.now()
		abortController = new AbortController();
		abortController.abort();
		await delayedResponse(milliseconds, { abortController })
		elapsed = Date.now() - requestedAt
		expect(elapsed).toBeLessThan(10)
	})
	test("Repeat the same request using the response object", async () => {
		const expected = "a=1&b=2&c=3";

		const { mirror } = useTestRestClient(testServer);
		const firstR = await mirror("GET", {
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

describe('Request utilities and shortcuts using Class API', () => {
	test("Typed response data (responseType)", async () => {

		const baseClient = new TestRestClient(testServer);
		const response1 = await baseClient.requestJson("GET");
		expect(response1.data!.fake).toEqual("model");
		expect(response1.request.options.responseType).toEqual("json");

		const response2 = await baseClient.requestText("DELETE");
		expect(response2.data).toEqual("text");
		expect(response2.request.options.responseType).toEqual("text");

		const response3 = await baseClient.getStatusCodeEmpty(200);
		expect(response3.data).toBeNull();
		expect(response3.request.options.responseType).toBeFalsy();
		const response3AsText = await response3.fetchResponse?.text();
		expect(response3AsText).toEqual("");

		const response4 = await baseClient.getStatusCodeEmpty(200);
		expect(response4.data).toBeNull();
		expect(response4.request.options.responseType).toBeFalsy();
		const response4AsText = await response4.fetchResponse?.text();
		expect(response4AsText).toEqual("");

		const response5 = await baseClient.getStatusCode(500, {
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
		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.mirror("POST", { body: obj });
		const responseAsText = response.data?.body;
		expect(responseAsText).toEqual('{"test":1,"x":null}');
	});
	test("Object to query string", async () => {
		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.mirror("GET", {
			responseType: "json",
			query: { a: "1", b: "2", c: 3 }
		});
		expect(response.data?.queryString).toEqual("a=1&b=2&c=3");
	});
	test("Query string transformer before send", async () => {
		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.mirror("GET", {
			responseType: "json",
			query: { a: "1", b: "2", some: ["one", "two"] },
			queryParamsTransformer: (key, value) => {
				if (key === "some")
					return value.join(",");
				return value;
			}
		});
		expect(decodeURIComponent(response.data?.queryString ?? "")).toEqual("a=1&b=2&some=one,two");
	});
	test("Cache responses using custom keys", async () => {
		const cacheKey = "the very slow call...";
		const rest = new TestRestClient(testServer);
		async function repliedIn(ms: number) {
			const starting = Date.now();
			await rest.delayedResponse(ms, {
				cacheInMemory: true,
				cacheKey
			});
			return Date.now() - starting;
		}
		const t1 = await repliedIn(300);
		const t2 = await repliedIn(300);
		expect(t2).toBeLessThan(300);
		rest.cacheClearByKey(cacheKey);
		const t3 = await repliedIn(400);
		expect(t3).toBeGreaterThan(t1);
	});
	test("Cache responses using expire mechanism", async () => {

		const rest = new TestRestClient(testServer);
		const cacheExpireAt = Date.now() + 500;
		const response = await rest.getTimestamp({ cacheInMemory: true, cacheExpireAt });
		const cachedTimestamp = response.data ?? "";

		const firstTs = (await response.repeat()).data ?? "";
		expect(firstTs).toEqual(cachedTimestamp);

		const secondTs = (await response.repeat()).data ?? "";
		expect(secondTs).toEqual(cachedTimestamp);

		await setTimeout(500);
		const thirdTs = (await response.repeat()).data ?? "";
		expect(thirdTs).not.toEqual(cachedTimestamp);
	});
	test("Abort request supported", async () => {
		let abortController = new AbortController()
		const rest = new TestRestClient(testServer);
		rest.options.set("responseType", "text");
		rest.options.set("throw", false);
		const milliseconds = 200;

		let requestedAt = Date.now()
		setTimeout(milliseconds / 2).then(() => abortController.abort())
		await rest.delayedResponse(milliseconds, { abortController })
		let elapsed = Date.now() - requestedAt
		expect(elapsed).toBeLessThan(milliseconds)

		requestedAt = Date.now()
		abortController = new AbortController();
		abortController.abort();
		await rest.delayedResponse(milliseconds, { abortController })
		elapsed = Date.now() - requestedAt
		expect(elapsed).toBeLessThan(10)
	})
	test("Repeat the same request using the response object", async () => {
		const expected = "a=1&b=2&c=3";

		const baseClient = new TestRestClient(testServer);
		const firstR = await baseClient.mirror("GET", {
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