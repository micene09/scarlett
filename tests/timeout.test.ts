import { TestRestClient, useTestServer } from "./runtime.setup";
import { beforeAll, afterAll, describe, test, expect } from "vitest";

let stopWebServer = () => {};
let testServer = "";
beforeAll(async () => {
	const { host, stop } = await useTestServer();
	testServer = host as string
	stopWebServer = stop;
});
afterAll(() => stopWebServer());

describe('Timeout support using Class API', () => {
	test("Supported timeout on requests", async () => {

		const delay = 100;
		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.delayedResponse(delay, {
			responseType: "text",
			timeout: delay / 2,
			throw: false
		});
		expect(response.status).toBeUndefined()
		expect(response.error?.code).toEqual("Timeout")
	})
	test("Timeout can also be disabled", async () => {

		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.delayedResponse(100, { timeout: 0 });
		expect(response.error).toBeFalsy();
	})
	test("Timeout error handling", async () => {

		const baseClient = new TestRestClient(testServer);
		const response = await baseClient.delayedResponse(150, {
			timeout: 50,
			throwExcluding: [{ errorCode: "Timeout" }]
		});
		expect(response.error?.code).toEqual("Timeout");
	})
});