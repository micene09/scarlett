import { useRestClientBuilder } from "../src";
import { TestRestBuilder, TestRestClient, useTestServer } from "./runtime.setup";
import { beforeAll, afterAll, describe, test, expect, vi } from "vitest";

let stopWebServer = () => {};
let testServer = "";
beforeAll(async () => {
	const { host, stop } = await useTestServer();
	testServer = host as string
	stopWebServer = stop;
});
afterAll(() => stopWebServer());

describe('Rest Client using Functional API', () => {
	test("Rest client using builder", async () => {

		const builder1 = useRestClientBuilder({
			host: testServer,
			responseType: "json",
			throw: true
		});
		builder1.setOption("headers", new Headers({ "x-restoptions": "1" }));
		const useRest1 = builder1.createRestClient();

		const builder2 = useRestClientBuilder({
			host: testServer,
			responseType: "json",
			throw: true
		});
		builder2.setOption("headers", new Headers({ "x-restoptions": "2" }));
		const useRest2 = builder2.createRestClient();

		const builder3 = useRestClientBuilder({
			host: testServer,
			responseType: "json",
			throw: true
		});
		builder3.setOption("headers", new Headers({ "x-restoptions": "3" }));
		const useRest3 = builder3.createRestClient();

		const resp1 = await useRest1().get("/mirror");
		const resp2 = await useRest2().get("/mirror");
		const resp3 = await useRest3().get("/mirror");

		expect(resp1.data?.headers["x-restoptions"]).toEqual("1");
		expect(resp2.data?.headers["x-restoptions"]).toEqual("2");
		expect(resp3.data?.headers["x-restoptions"]).toEqual("3");
	});
	test("Override global settings on local requests", async () => {

		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.get<string>("/mirror", { responseType: "text" });
		const respType = typeof response.data;
		expect(respType).toEqual("string");
	});
	test("Override global settings using merge vs assign strategies", async () => {

		const restOverrides = new TestRestClient(testServer);
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
		const rest = new TestRestClient(testServer);
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

		const rest = new TestRestClient(testServer);
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
describe('Rest Client using Class API', () => {
	test("Rest client using builder", async () => {

		const builder = new TestRestBuilder(testServer);
		const restOpts1 = builder.createRestClient<typeof TestRestClient>(testServer)
		restOpts1.options.set("headers", new Headers({ "x-restoptions": "1" }));

		const restOpts2 = builder.createRestClient<typeof TestRestClient>(testServer);
		restOpts2.options.set("headers", new Headers({ "x-restoptions": "2" }));


		const restOpts3 = builder.createRestClient<typeof TestRestClient>(testServer);
		restOpts3.options.set("headers", new Headers({ "x-restoptions": "3" }));

		const resp1 = await restOpts1.mirror("GET");
		const resp2 = await restOpts2.mirror("GET");
		const resp3 = await restOpts3.mirror("GET");

		expect(resp1.data?.headers["x-restoptions"]).toEqual("1");
		expect(resp2.data?.headers["x-restoptions"]).toEqual("2");
		expect(resp3.data?.headers["x-restoptions"]).toEqual("3");
	});
	test("Override global settings on local requests", async () => {

		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.mirror("GET", { responseType: "text" });
		const respType = typeof response.data;
		expect(respType).toEqual("string");
	});
	test("Override global settings using merge vs assign strategies", async () => {

		const restOverrides = new TestRestClient(testServer);
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
		const rest = new TestRestClient(testServer);
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

		const rest = new TestRestClient(testServer);
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