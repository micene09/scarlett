import RestClient, { RestError, RestOptions } from "../src/index";
import { startWebServer, stopWebServer, ITestStatusCodeResponse } from "./runtime.setup";
import { beforeAll, afterAll, describe, test, expect, vi } from "vitest";
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

describe('Rest errors', () => {
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

		const onErrorCallback = vi.fn(err => err)
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

		const onErrorCallback = vi.fn(err => err)
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
		const onErrorCallback = vi.fn(err => {})
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

		const businessApiCall = vi.fn((body: any) => new Promise<void>(resolve => {
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
});