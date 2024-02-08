import { createRestClient, useRestClientBuilder, RestClient } from '../../src';
import { ITestJsonResponse, ITestMirrorResponse, ITestStatusCodeResponse } from "./rest-server"

let _useRestClient = null as any as ReturnType<typeof createRestClient>;
export function clearRestClient() {
	_useRestClient = createRestClient({
		host: "https://scarlett.mock",
		responseType: "json",
		throw: true,
		mode: "cors"
	});
}
clearRestClient();
export function useTestRestClient() {
	const { setOption, getOption, optionsOverride, request, get, cacheClearByKey } = _useRestClient()
	return {
		getOption,
		setOption,
		optionsOverride,
		cacheClearByKey,
		requestJson(method: Parameters<typeof request>[0], overrides?: Parameters<typeof request>[2]) {
			return request<ITestJsonResponse, null>(method, "/json", overrides);
		},
		requestText(method: Parameters<typeof request>[0], overrides?: Parameters<typeof request>[2]) {
			return request<string, null>(method, "/text", {
				responseType: "text",
				...overrides
			});
		},
		getStatusCode(statusCode: number, overrides?: Parameters<typeof request>[2]) {
			return get<ITestStatusCodeResponse, ITestStatusCodeResponse>(`/status-code/${statusCode}`, overrides);
		},
		getStatusCodeEmpty(statusCode: number) {
			return get<null, null>(`/status-code/${statusCode}/empty`, { responseType: undefined });
		},
		mirror(method: Parameters<typeof request>[0], overrides?: Parameters<typeof request>[2]) {
			return request<ITestMirrorResponse, ITestMirrorResponse>(method, "/mirror", overrides);
		},
		delayedResponse(milliseconds: number, overrides?: Parameters<typeof request>[2]) {
			return get<string, null>(`/reply-in/${milliseconds}/milliseconds`, {
				responseType: "text",
				...overrides
			});
		},
		getTimestamp(overrides?: Parameters<RestClient["request"]>[2]) {
			return get<string, null>(`/timestamp`, { responseType: "text", ...overrides });
		}
	};
}
export function useTestRestBuilder() {
	const { setOption, cloneOptions } = useRestClientBuilder({
		host: "https://scarlett.mock",
		responseType: "json",
		throw: true,
		mode: "cors"
	});
	return {
		setOption,
		createRestClient() {
			const rest = useTestRestClient();
			const currentOptions = cloneOptions()
			rest.optionsOverride(undefined, currentOptions);
			return rest;
		}
	};
}
export class TestRestClient extends RestClient {
	constructor(...options: ConstructorParameters<typeof RestClient>) {
		super({
			...(options ?? {}),
			host: "https://scarlett.mock",
			responseType: "json",
			throw: true,
			mode: "cors"
		});
	}
	requestJson(method: Parameters<RestClient["request"]>[0], overrides?: Parameters<RestClient["request"]>[2]) {
		return this.request<ITestJsonResponse, null>(method, "/json", overrides);
	}
	requestText(method: Parameters<RestClient["request"]>[0], overrides?: Parameters<RestClient["request"]>[2]) {
		return this.request<string, null>(method, "/text", {
			responseType: "text",
			...overrides
		});
	}
	getStatusCode(statusCode: number, overrides?: Parameters<RestClient["request"]>[2]) {
		return this.get<ITestStatusCodeResponse, ITestStatusCodeResponse>(`/status-code/${statusCode}`, overrides);
	}
	getStatusCodeEmpty(statusCode: number) {
		return this.get<null, null>(`/status-code/${statusCode}/empty`, { responseType: undefined });
	}
	mirror(method: Parameters<RestClient["request"]>[0], overrides?: Parameters<RestClient["request"]>[2]) {
		return this.request<ITestMirrorResponse, ITestMirrorResponse>(method, "/mirror", overrides);
	}
	delayedResponse(milliseconds: number, overrides?: Parameters<RestClient["request"]>[2]) {
		return this.get<string, null>(`/reply-in/${milliseconds}/milliseconds`, {
			responseType: "text",
			...overrides
		});
	}
	getTimestamp(overrides?: Parameters<RestClient["request"]>[2]) {
		return this.get<string, null>(`/timestamp`, { responseType: "text", ...overrides });
	}
}
