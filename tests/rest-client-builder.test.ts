import { RestClientBuilder, useRestClientBuilder } from "../src";
import { TestRestClient } from "./mock/rest-client";
import { describe, test, expect } from "vitest";

describe('Rest Client Builder using Functional API', () => {
	test("Create a rest client using builder", async () => {

		const builder1 = useRestClientBuilder({
			host: "https://scarlett.mock",
			responseType: "json",
			throw: true
		});
		builder1.setOption("headers", new Headers({ "x-restoptions": "1" }));
		const useRest1 = builder1.createRestClient();

		const builder2 = useRestClientBuilder({
			host: "https://scarlett.mock",
			responseType: "json",
			throw: true
		});
		builder2.setOption("headers", new Headers({ "x-restoptions": "2" }));
		const useRest2 = builder2.createRestClient();

		const builder3 = useRestClientBuilder({
			host: "https://scarlett.mock",
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
});
describe('Rest Client Builder using Class API', () => {
	test("Create a rest client using builder", async () => {

		const builder1 = new RestClientBuilder<any, any, TestRestClient>({
			host: "https://scarlett.mock",
			responseType: "json",
			throw: true
		});
		builder1.setFactory(TestRestClient);
		builder1.set("headers", new Headers({ "x-restoptions": "1" }));
		const restOpts1 = builder1.createRestClient<typeof TestRestClient>({ host: "https://scarlett.mock" })

		const builder2 = new RestClientBuilder<any, any, TestRestClient>({
			host: "https://scarlett.mock",
			responseType: "json",
			throw: true
		});
		builder2.set("headers", new Headers({ "x-restoptions": "2" }));
		builder2.setFactory(TestRestClient);
		const restOpts2 = builder2.createRestClient<typeof TestRestClient>({ host: "https://scarlett.mock" });

		const builder3 = new RestClientBuilder<any, any, TestRestClient>({
			host: "https://scarlett.mock",
			responseType: "json",
			throw: true
		});
		builder3.set("headers", new Headers({ "x-restoptions": "3" }));
		builder3.setFactory(TestRestClient);
		const restOpts3 = builder3.createRestClient<typeof TestRestClient>({ host: "https://scarlett.mock" });

		const resp1 = await restOpts1.mirror("GET");
		const resp2 = await restOpts2.mirror("GET");
		const resp3 = await restOpts3.mirror("GET");

		expect(resp1.data?.headers["x-restoptions"]).toEqual("1");
		expect(resp2.data?.headers["x-restoptions"]).toEqual("2");
		expect(resp3.data?.headers["x-restoptions"]).toEqual("3");
	});
	test("Create a rest client using a custom builder class", async () => {

		class TestRestBuilder extends RestClientBuilder<any, any, TestRestClient> {
			constructor(...options: ConstructorParameters<typeof RestClientBuilder>) {
				super({
					...(options ?? {}),
					host: "https://scarlett.mock",
					responseType: "json",
					throw: true
				});
				this.setFactory(TestRestClient);
			}
		}
		const builder = new TestRestBuilder();
		builder.set("headers", new Headers({ "x-restoptions": "1" }));
		const restOpts = builder.createRestClient<typeof TestRestClient>({ host: "https://scarlett.mock" })
		const resp1 = await restOpts.mirror("GET");
		expect(resp1.data?.headers["x-restoptions"]).toEqual("1");
	});
});