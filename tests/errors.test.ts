import type { RestError } from "../src/index";
import { useTestServer, useTestRestClient, TestRestClient } from "./runtime.setup";
import { beforeAll, afterAll, describe, test, expect, vi } from "vitest";
import { fail, ok } from "assert";

let stopWebServer = () => {};
let testServer = "";
beforeAll(async () => {
	const { host, stop } = await useTestServer();
	testServer = host as string
	stopWebServer = stop;
});
afterAll(() => stopWebServer());

describe('Rest Error using Functional API', () => {
	test("Throw error on not successful requests", () => {

		const { getStatusCodeEmpty } = useTestRestClient(testServer)
		expect(() => getStatusCodeEmpty(500))
			.rejects
			.toThrowError();
	})
	test("Error will not be thrown, because of the onError callback", async () => {

		const onErrorCallback = vi.fn(err => err)
		const { getStatusCodeEmpty, setOption } = useTestRestClient(testServer);
		setOption("onError", onErrorCallback);
		await getStatusCodeEmpty(500);
		expect(onErrorCallback).toBeCalled();
	})
	test("Throw error disabled, onError() callback will never be called", async () => {

		const onErrorCallback = vi.fn(err => err)
		const { getStatusCodeEmpty, setOption } = useTestRestClient(testServer);
		setOption("onError", onErrorCallback);
		setOption("throw", false);

		try {
			await getStatusCodeEmpty(500);
			expect(onErrorCallback).not.toBeCalled()
			ok("Error not thrown as expected.")
		}
		catch(e) { fail(e as any); }
	})
	test("Throw error enabled, but will not throw on 'special' requests", async () => {

		const handledStatusCode = 502
		const onErrorCallback = vi.fn(err => {})
		const { getStatusCodeEmpty, setOption } = useTestRestClient(testServer);
		setOption("onError", onErrorCallback);
		setOption("throwExcluding", [ { statusCode: handledStatusCode } ]);

		const response = await getStatusCodeEmpty(handledStatusCode);
		expect(onErrorCallback).not.toBeCalled();
		expect(response.status).toEqual(handledStatusCode);
		expect(response.data).toBeNull();

		try {
			await getStatusCodeEmpty(404);
			fail("Error not thrown on unhandled (404) status code");
		}
		catch {
			expect(onErrorCallback).toBeCalled()
		}
	});
	test("Throw error enabled, excluding errors via custom hook functions", async () => {

		const { getStatusCode, setOption } = useTestRestClient(testServer);
		const whiteListedCall = vi.fn((body: any) => new Promise<void>(resolve => setTimeout(resolve, 100)));
		const whiteListedStatusCode = 405;
		setOption("throwExcluding", [
			{ statusCode: 404 },
			err => err.statusCode === 401,
			async err => {
				let isMatchingBusinessLogic = false;
				if (err.statusCode === whiteListedStatusCode) {
					await whiteListedCall(err.data);
					isMatchingBusinessLogic = true;
				}
				return isMatchingBusinessLogic;
			},
			{ statusCode: 409 }
		]);

		await getStatusCode(404);
		await getStatusCode(whiteListedStatusCode);
		await getStatusCode(409);
		expect(whiteListedCall).toBeCalledTimes(1)
		try {
			await getStatusCode(500);
			fail("Expected to throw error")
		} catch (error) {
			ok(error, "Error thrown as expected")
		}
	});
	test("Custom Error Object Interfaces", async () => {

		const { getStatusCode, setOption } = useTestRestClient(testServer);
		setOption("throw", false);
		const response = await getStatusCode(412);
		const errorData = response?.error?.data;
		// intellisense here should work data prop:
		expect(errorData?.statusText).toEqual("CustomStatusCode");
		expect(errorData?.statusCode).toEqual(412);
	});
	test("Custom Error Object handled as usual", async () => {
		const { getStatusCode } = useTestRestClient(testServer);
		try {
			await getStatusCode(412);
			fail();
		}
		catch(err) {
			type Response = Awaited<ReturnType<typeof getStatusCode>>
			type Error = Required<Response>["error"]
			const error = err as Error;
			expect(error.data?.statusText).toEqual("CustomStatusCode");
			expect(error.data?.statusCode).toEqual(412);
		}
	});
});
describe('Rest Error using Class API', () => {
	test("Throw error on not successful requests", () => {

		const client = new TestRestClient(testServer)
		expect(() => client.getStatusCodeEmpty(500))
			.rejects
			.toThrowError();
	})
	test("Error will not be thrown, because of the onError callback", async () => {

		const onErrorCallback = vi.fn(err => err);
		const client = new TestRestClient(testServer);
		client.options.set("onError", onErrorCallback);

		await client.getStatusCodeEmpty(500);
		expect(onErrorCallback).toBeCalled();
	})
	test("Throw error disabled, onError() callback will never be called", async () => {

		const onErrorCallback = vi.fn(err => err);
		const client = new TestRestClient(testServer);
		client.options.set("onError", onErrorCallback);
		client.options.set("throw", false);

		try {
			await client.getStatusCodeEmpty(500);
			expect(onErrorCallback).not.toBeCalled()
			ok("Error not thrown as expected.")
		}
		catch(e) { fail(e as any); }
	})
	test("Throw error enabled, but will not throw on 'special' requests", async () => {

		const handledStatusCode = 502
		const onErrorCallback = vi.fn(err => {})
		const client = new TestRestClient(testServer);
		client.options.set("onError", onErrorCallback);
		client.options.set("throw", false);
		client.options.set("throwExcluding", [ { statusCode: handledStatusCode } ]);

		const response = await client.getStatusCodeEmpty(handledStatusCode);
		expect(onErrorCallback).not.toBeCalled();
		expect(response.status).toEqual(handledStatusCode);
		expect(response.data).toBeNull();

		try {
			await client.getStatusCodeEmpty(404);
			fail("Error not thrown on unhandled (404) status code")
		}
		catch {
			expect(onErrorCallback).toBeCalled()
		}
	});
	test("Throw error enabled, excluding errors via custom hook functions", async () => {

		const client = new TestRestClient(testServer);
		const whiteListedCall = vi.fn((body: any) => new Promise<void>(resolve => setTimeout(resolve, 100)));
		const whiteListedStatusCode = 405;
		client.options.set("throwExcluding", [
			{ statusCode: 404 },
			err => err.statusCode === 401,
			async err => {
				let isMatchingBusinessLogic = false;
				if (err.statusCode === whiteListedStatusCode) {
					await whiteListedCall(err.data);
					isMatchingBusinessLogic = true;
				}
				return isMatchingBusinessLogic;
			},
			{ statusCode: 409 }
		]);

		await client.getStatusCodeEmpty(404);
		await client.getStatusCodeEmpty(whiteListedStatusCode);
		await client.getStatusCodeEmpty(409);
		expect(whiteListedCall).toBeCalledTimes(1)
		try {
			await client.getStatusCodeEmpty(500);
			fail("Expected to throw error")
		} catch (error) {
			ok(error, "Error thrown as expected")
		}
	});
	test("Custom Error Object Interfaces", async () => {

		const client = new TestRestClient(testServer);
		client.options.set("throw", false);
		const response = await client.getStatusCode(412);
		const errorData = response?.error?.data;
		// intellisense here should work data prop:
		expect(errorData?.statusText).toEqual("CustomStatusCode");
		expect(errorData?.statusCode).toEqual(412);
	});
	test("Custom Error Object handled as usual", async () => {
		const client = new TestRestClient(testServer);
		try {
			await client.getStatusCode(412);
			fail();
		}
		catch(err) {
			type Response = Awaited<ReturnType<typeof client.getStatusCode>>
			type Error = Required<Response>["error"]
			const error = err as Error;
			expect(error.data?.statusText).toEqual("CustomStatusCode");
			expect(error.data?.statusCode).toEqual(412);
		}
	});
});