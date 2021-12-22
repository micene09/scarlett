import RestClient, { RestError, RestOptions } from "../src/index";
import { startWebServer, stopWebServer, ITestStatusCodeResponse, ITestJsonResponse, ITestMirrorResponse } from "./runtime.setup";
import { fail, ok } from "assert";

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
	test("Typed response data (responseType)", async () => {
		const response = await baseClient.get<ITestJsonResponse>("/json");
		expect(response.data!.fake).toEqual("model");
	});
	test("Auto-translation for objects on body property", async () => {
		const obj = { test: 1 };
		const response = await baseClient.post<ITestMirrorResponse>("/mirror", { body: obj });
		const responseAsText = response.data?.body;
		expect(responseAsText).toEqual('{"test":1}');
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
			queryParamsTransormer: (key, value) => {
				if (key === "some")
					return value.join(",");
				return value;
			}
		});
		expect(decodeURIComponent(response.data.queryString)).toEqual("a=1&b=2&some=one,two");
	});
	test("Throw error on not successful requests", () => {

		const baseOptions = new RestOptions()
			.set("host", host)
			.set("responseType", "json")
			.set("throw", true)
		const client = baseOptions.createRestClient()

		expect(() => client.get("/status-code/500/empty"))
			.rejects
			.toThrowError();
	})
	test("Error will not be thrown, because of the onError callback", async () => {

		const onErrorCallback = jest.fn(err => err)
		const baseOptions = new RestOptions()
			.set("host", host)
			.set("responseType", "json")
			.set("onError", onErrorCallback)
			.set("throw", true)
		const client = baseOptions.createRestClient()

		await client.get("/status-code/500/empty");
		expect(onErrorCallback).toBeCalled();
	})
	test("Throw error disabled, onError() callback will never be called", async () => {

		const onErrorCallback = jest.fn(err => err)
		const baseOptions = new RestOptions()
			.set("host", host)
			.set("responseType", "json")
			.set("onError", onErrorCallback)
			.set("throw", false)
		const client = baseOptions.createRestClient()

		try {
			await client.get("/status-code/500/empty")
			expect(onErrorCallback).not.toBeCalled()
			ok("Error not thrown as expected.")
		}
		catch(e) { fail(e as any); }
	})
	test("Throw error enabled, but will not throw on 'special' requests", async () => {

		const handledStatusCode = 502
		const onErrorCallback = jest.fn(err => {})
		const baseOptions = new RestOptions()
			.set("host", host)
			.set("responseType", "json")
			.set("onError", onErrorCallback)
			.set("throwExcluding", [ { statusCode: handledStatusCode } ])
		const client = baseOptions.createRestClient()

		const response = await client.get(`/status-code/${handledStatusCode}/empty`)
		expect(onErrorCallback).not.toBeCalled()
		expect(response.status).toEqual(handledStatusCode)
		expect(response.data).toBeNull()

		try {
			await client.get(`/status-code/404/empty`)
			fail("Error not thrown on unhandled (404) status code")
		}
		catch {
			expect(onErrorCallback).toBeCalled()
		}
	});
	test("Throw error enabled, excluding errors via custom hook functions", async () => {
		const baseOptions = new RestOptions()
			.set("host", host)
			.set("responseType", "json")
		const client = baseOptions.createRestClient()

		const businessApiCall = jest.fn((body: any) => new Promise<void>(resolve => {
			setTimeout(resolve, 300);
		}));
		const businessApiTrigger = 405;

		client.options.set("throwExcluding", [
			{ statusCode: 404 },
			err => err.statusCode === 401,
			async (err) => {
				let isMatchingBusinessLogic = false;
				if (err.statusCode === businessApiTrigger) {
					await businessApiCall(err.data);
					isMatchingBusinessLogic = true;
				}
				return isMatchingBusinessLogic;
			},
			{ statusCode: 409 }
		]);

		await client.get(`/status-code/404`)
		await client.get(`/status-code/${businessApiTrigger}`)
		await client.get(`/status-code/409`)
		expect(businessApiCall).toBeCalledTimes(1)
		try {
			await client.get(`/status-code/500`)
			fail("Expected to throw error")
		} catch (error) {
			ok(error, "Error thrown as expected")
		}
	});
	test("Custom Error Object Interfaces", async () => {

		const response = await baseClient.get<any, ITestStatusCodeResponse>("/status-code/412", { throw: false });
		const errorData = response?.error?.data;
		// intellisense here should work data prop:
		expect(errorData?.statusText).toEqual("CustomStatusCode");
		expect(errorData?.statusCode).toEqual(412);
	});
	test("Custom Error Object handled as usual", async () => {
		try {
			await baseClient.get("/status-code/412", { throw: true });
			fail();
		}
		catch(err) {
			const error = err as RestError<ITestStatusCodeResponse>;
			expect(error.data?.statusText).toEqual("CustomStatusCode");
			expect(error.data?.statusCode).toEqual(412);
		}
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
		const onError = jest.fn();
		const onRequest = jest.fn();
		const onResponse = jest.fn();
		const rest = baseClient.options.clone()
			.set("responseType", "json")
			.set("throw", true)
			.set("onRequest", request => onRequest())
			.set("onResponse", response => onResponse())
			.set("onError", error => onError())
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
			.set("onRequest", request => new Promise(resolve => {
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