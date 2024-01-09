import { TestRestClient, useTestRestClient } from "./mock/rest-client";
import { describe, test, expect, vi } from "vitest";

describe('Rest Client using Functional API', () => {
	test("Override global settings", async () => {

		const { mirror, getOption, setOption } = useTestRestClient();
		setOption("responseType", "text");
		setOption("headers", new Headers());
		const response = await mirror("GET");
		const respType = typeof response.data;
		expect(respType).toEqual("string");

		const headers = getOption("headers");
		headers.set("Accept-Language", "it-IT");
		setOption("responseType", "json")
		setOption("headers", headers);
		const response2 = await mirror("GET");
		expect(response2.data?.headers["accept-language"]).toEqual("it-IT");
	});
	test("Override global settings on local requests", async () => {

		const { mirror } = useTestRestClient();
		const response = await mirror("GET", { responseType: "text" });
		const respType = typeof response.data;
		expect(respType).toEqual("string");
	});
	test("Override global settings using merge vs assign strategies", async () => {

		const { setOption, mirror } = useTestRestClient();
		setOption("query", { a: 1, b: 2 }) // << default query-string for every request

		// Merge strategy
		setOption("overrideStrategy", "merge");

		const merged = await mirror("GET", { query: { c: 3 } });
		expect(merged.data?.queryString).toEqual("a=1&b=2&c=3"); // << merged!

		// Assign strategy
		setOption("overrideStrategy", "assign");

		const assigned = await mirror("GET", { query: { c: 3 } });
		expect(assigned.data?.queryString).toEqual("c=3"); // << assigned!
	});
	test("Global handlers (onRequest, onResponse, onError)", async () => {

		const onError = vi.fn();
		const onRequest = vi.fn();
		const onResponse = vi.fn();
		const { setOption, mirror, getStatusCodeEmpty } = useTestRestClient();
		setOption("responseType", "json");
		setOption("throw", true);
		setOption("onRequest", () => onRequest());
		setOption("onResponse", () => onResponse());
		setOption("onError", () => onError());

		try {
			await mirror("GET");
			await getStatusCodeEmpty(412);
		} catch (e) {}

		expect(onRequest).toBeCalledTimes(2);
		expect(onResponse).toBeCalledTimes(1);
		expect(onError).toBeCalledTimes(1);
	});
	test("onRequest can be a Promise", async () => {

		const { setOption, mirror } = useTestRestClient();
		setOption("responseType", "json");
		setOption("throw", false);
		setOption("onRequest", (request: any) => new Promise<void>(resolve => {
			request.options.headers = new Headers({
				"X-Example": "1234"
			});
			setTimeout(() => resolve(), 100);
		}));

		const response = await mirror("GET");
		const headers = new Headers(response.data?.headers);
		expect(headers.get("X-Example")).toEqual("1234");
	});
});
describe('Rest Client using Class API', () => {
	test("Override global settings", async () => {

		const baseClient = new TestRestClient();
		baseClient.options.set("responseType", "text");
		baseClient.options.set("headers", new Headers());
		const response = await baseClient.mirror("GET");
		const respType = typeof response.data;
		expect(respType).toEqual("string");

		const headers = baseClient.options.get("headers");
		headers.set("Accept-Language", "it-IT");
		baseClient.options
			.set("responseType", "json")
			.set("headers", headers);
		const response2 = await baseClient.mirror("GET");
		expect(response2.data?.headers["accept-language"]).toEqual("it-IT");
	});
	test("Override global settings on local requests", async () => {

		const baseClient = new TestRestClient();
		const response = await baseClient.mirror("GET", { responseType: "text" });
		const respType = typeof response.data;
		expect(respType).toEqual("string");
	});
	test("Override global settings using merge vs assign strategies", async () => {

		const restOverrides = new TestRestClient();
		restOverrides.options.set("query", { a: 1, b: 2 }) // << default query-string for every request

		// Merge strategy
		restOverrides.options.set("overrideStrategy", "merge");

		const merged = await restOverrides.mirror("GET", { query: { c: 3 } });
		expect(merged.data?.queryString).toEqual("a=1&b=2&c=3"); // << merged!

		// Assign strategy
		restOverrides.options.set("overrideStrategy", "assign");

		const assigned = await restOverrides.mirror("GET", { query: { c: 3 } });
		expect(assigned.data?.queryString).toEqual("c=3"); // << assigned!
	});
	test("Global handlers (onRequest, onResponse, onError)", async () => {

		const onError = vi.fn();
		const onRequest = vi.fn();
		const onResponse = vi.fn();
		const rest = new TestRestClient();
		rest.options.set("responseType", "json");
		rest.options.set("throw", true);
		rest.options.set("onRequest", () => onRequest());
		rest.options.set("onResponse", () => onResponse());
		rest.options.set("onError", () => onError());

		try {
			await rest.mirror("GET");
			await rest.getStatusCodeEmpty(412);
		} catch (e) {}

		expect(onRequest).toBeCalledTimes(2);
		expect(onResponse).toBeCalledTimes(1);
		expect(onError).toBeCalledTimes(1);
	});
	test("onRequest can be a Promise", async () => {

		const rest = new TestRestClient();
		rest.options.set("responseType", "json");
		rest.options.set("throw", false);
		rest.options.set("onRequest", (request: any) => new Promise<void>(resolve => {
			request.options.headers = new Headers({
				"X-Example": "1234"
			});
			setTimeout(() => resolve(), 100);
		}));

		const response = await rest.mirror("GET");
		const headers = new Headers(response.data?.headers);
		expect(headers.get("X-Example")).toEqual("1234");
	});
});