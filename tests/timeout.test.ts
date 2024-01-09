import { TestRestClient, useTestRestClient } from "./mock/rest-client";
import { describe, test, expect } from "vitest";

describe('Timeout support using Functional API', () => {
	test("Supported timeout on requests", async () => {

		const delay = 100;
		const { delayedResponse } = useTestRestClient();
		const response = await delayedResponse(delay, {
			responseType: "text",
			timeout: delay / 2,
			throw: false
		});
		expect(response.status).toBeUndefined()
		expect(response.error?.code).toEqual("Timeout")
	})
	test("Timeout can also be disabled", async () => {

		const { delayedResponse } = useTestRestClient();
		const response = await delayedResponse(100, { timeout: 0 });
		expect(response.error).toBeFalsy();
	})
	test("Timeout error handling", async () => {

		const { delayedResponse } = useTestRestClient();
		const response = await delayedResponse(150, {
			timeout: 50,
			throwExcluding: [{ errorCode: "Timeout" }]
		});
		expect(response.error?.code).toEqual("Timeout");
	})
});
describe('Timeout support using Class API', () => {
	test("Supported timeout on requests", async () => {

		const delay = 100;
		const baseClient = new TestRestClient();
		const response = await baseClient.delayedResponse(delay, {
			responseType: "text",
			timeout: delay / 2,
			throw: false
		});
		expect(response.status).toBeUndefined()
		expect(response.error?.code).toEqual("Timeout")
	})
	test("Timeout can also be disabled", async () => {

		const baseClient = new TestRestClient();
		const response = await baseClient.delayedResponse(100, { timeout: 0 });
		expect(response.error).toBeFalsy();
	})
	test("Timeout error handling", async () => {

		const baseClient = new TestRestClient();
		const response = await baseClient.delayedResponse(150, {
			timeout: 50,
			throwExcluding: [{ errorCode: "Timeout" }]
		});
		expect(response.error?.code).toEqual("Timeout");
	})
});