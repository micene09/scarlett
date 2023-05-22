import fetch from 'node-fetch';
import AbortController from "abort-controller"
import fastify from "fastify";
import RestClient, { createRestClient } from '../src';

(globalThis as any).fetch = fetch;
(globalThis as any).Headers = (fetch as any).Headers;
(globalThis as any).AbortController = AbortController;

let testServer = fastify({ logger: false });
interface ITestJsonResponse {
	fake: "model"
}
interface ITestMirrorResponse {
	queryString: string;
	queryObject: Record<string, string>;
	headers: Record<string, string>;
	body: string;
}
interface ITestStatusCodeResponse {
	statusText: "CustomStatusCode",
	statusCode: number
}
export async function useTestServer() {
	testServer
		.all("/json", (req, res) => {
			res.header("Content-type", "application/json");
			res.send({ fake: "model" });
		})
		.all("/text", (req, res) => {
			res.header("Content-type", "text/plain");
			res.send("text");
		})
		.get("/status-code/:code", (req, res) => {
			res.header("Content-type", "application/json");
			res.status(+(req.params as any).code);
			res.send({
				statusText: "CustomStatusCode",
				statusCode: +(req.params as any).code
			} as ITestStatusCodeResponse);
		})
		.get("/status-code/:code/empty", (req, res) => {
			res.status(+(req.params as any).code);
			res.send();
		})
		.all("/mirror", (req, res) => {
			res.header("Content-type", "application/json");
			res.send({
				queryString: req.raw.url?.split("?")[1] ?? "",
				queryObject: req.query,
				headers: req.headers,
				body: req.body
			} as ITestMirrorResponse);
		})
		.all("/reply-in/:ms/milliseconds", (req, res) => {
			res.header("Content-type", "text/plain");
			setTimeout(() => {
				res.send("ok");
			}, +(req.params as any).ms);
		});
	const host = await testServer.listen({
		host: "localhost",
		port: 0
	});
	return {
		host,
		stop() {
			testServer.close()
		}
	}
}

export function useTestRestClient(host: string) {
	const useRestClient = createRestClient({
		host,
		responseType: "json",
		throw: true
	});
	const { setOption, request, get } = useRestClient()
	return {
		setOption,
		requestJson(method: Parameters<typeof request>[0], overrides: Parameters<typeof request>[2]) {
			return request<ITestJsonResponse, null>(method, "/json", overrides);
		},
		requestText(method: Parameters<typeof request>[0], overrides: Parameters<typeof request>[2]) {
			return request<string, null>(method, "/text", {
				responseType: "text",
				...overrides
			});
		},
		getStatusCode(statusCode: number) {
			return get<ITestStatusCodeResponse, ITestStatusCodeResponse>(`/status-code/${statusCode}`);
		},
		getStatusCodeEmpty(statusCode: number) {
			return get<null, null>(`/status-code/${statusCode}/empty`, { responseType: undefined });
		},
		mirror(method: Parameters<typeof request>[0], overrides: Parameters<typeof request>[2]) {
			return request<ITestMirrorResponse, ITestMirrorResponse>(method, "/mirror", overrides);
		},
		delayedResponse(milliseconds: number, overrides: Parameters<typeof request>[2]) {
			return get<string, null>(`/reply-in/${milliseconds}/milliseconds`, {
				responseType: "text",
				...overrides
			});
		}
	};
}
export class TestRestClient extends RestClient {
	constructor(host: string, ...options: ConstructorParameters<typeof RestClient>) {
		super({
			...(options ?? {}),
			host,
			responseType: "json",
			throw: true
		});
	}
	requestJson(method: Parameters<RestClient["request"]>[0], overrides: Parameters<RestClient["request"]>[2]) {
		return this.request<ITestJsonResponse, null>(method, "/json", overrides);
	}
	requestText(method: Parameters<RestClient["request"]>[0], overrides: Parameters<RestClient["request"]>[2]) {
		return this.request<string, null>(method, "/text", {
			responseType: "text",
			...overrides
		});
	}
	getStatusCode(statusCode: number) {
		return this.get<ITestStatusCodeResponse, ITestStatusCodeResponse>(`/status-code/${statusCode}`);
	}
	getStatusCodeEmpty(statusCode: number) {
		return this.get<null, null>(`/status-code/${statusCode}/empty`, { responseType: undefined });
	}
	mirror(method: Parameters<RestClient["request"]>[0], overrides?: Parameters<RestClient["request"]>[2]) {
		return this.request<ITestMirrorResponse, ITestMirrorResponse>(method, "/mirror", overrides);
	}
	delayedResponse(milliseconds: number, overrides: Parameters<RestClient["request"]>[2]) {
		return this.get<string, null>(`/reply-in/${milliseconds}/milliseconds`, {
			responseType: "text",
			...overrides
		});
	}
}