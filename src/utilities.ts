import { IRequestOptions, HttpMethod, HttpResponseFormat, IRequestQueryOptions } from "./interfaces";
import RestError from "./rest-error";

export function getRequestUrl(host: string = location.href, basePath: string = "/", path: string = "/") {
	return new URL(`${basePath ?? "/"}/${path}`.replace(/\/+/g, "/"), host);
}
export function getRequestHeaders(method: HttpMethod, overrides?: IRequestOptions) {
	const headers = overrides?.headers ?? new Headers();
	if (overrides?.headers)
		overrides.headers.forEach((value, key) => headers.append(key, value));
	if (method === "GET")
		headers.append("Pragma", "no-cache");
	return headers;
}
export function setUrlParameters(url: URL, options: IRequestQueryOptions) {
	const query = options.query;
	if (!query) return;
	const transf = options.queryParamsTransormer;
	const keys = Object.keys(query);
	if (typeof transf === "function")
		keys.forEach(key => {
			const value = query[key];
			let newval = transf(key, value, query);

			if (typeof newval == "number")
				newval = (newval as number).toString();

			const t = typeof newval;

			if (t !== "string" && t !== "undefined" && newval !== null)
				throw new RestError(
					"ArgumentException",
					`Invalid type for '${key}' parameter: \r\n${JSON.stringify(newval)}`
				);
			url.searchParams.delete(key);
			if (newval)
				url.searchParams.append(key, newval);
			else if (options.queryParamsIncludeEmpty === true)
				url.searchParams.append(key, "");
		});
	else
		keys.forEach(key => {
			const value = query[key];
			url.searchParams.append(key, value)
		});
}
export async function transformResponseBody<T>(response: Response | null = null, responseType: HttpResponseFormat = "json"): Promise<[boolean, T | null]> {
	if (!response)
		return [false, null];
	else try {
		return [true, await response[responseType]() as T];
	} catch (error) {
		return [false, null];
	}
}
export function transformRequestBody(body: | ArrayBuffer | Blob | File | FormData | string | any) {
	return (
		globalThis.ArrayBuffer && body instanceof ArrayBuffer && body.byteLength !== undefined ? body
		: globalThis.Blob && body instanceof Blob ? body
		: globalThis.File && body instanceof File ? body
		: globalThis.FormData && body instanceof FormData ? body
		: typeof body === "string" ? body
		: JSON.stringify(body)
	);
}
interface IResponseAny {
	<TData = any, TError = any>(prom: Promise<any>): Promise<[TData | null, TError | null]>
}
interface IResponseAny {
	<T>(prom: Promise<T>): Promise<[T | null, Error | RestError<any> | null]>
}
export const resolveAny: IResponseAny = (prom: Promise<any>) => {
	return new Promise<any>(resolve => {
		prom.then((response: any) => resolve([response, null]))
			.catch((err: any) => resolve([null, err]));
	});
};