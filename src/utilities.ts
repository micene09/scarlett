import { HttpResponseFormat, IRequest } from ".";
import { IRestOptionsQuery, IKeyValue, IResponseAny, HttpResponseFormatResult } from "./interfaces";
import RestError from "./rest-error";

export function getRequestUrl(host: string = location.origin, basePath: string = "/", path: string = "/") {
	return new URL(`${basePath ?? "/"}/${path}`.replace(/\/+/g, "/"), host);
}
export function setUrlParameters(url: URL, options: Partial<IRestOptionsQuery>) {
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
					`Invalid type for '${key}' parameter: \r\n${JSON.stringify(newval)}`,
					undefined,
					"UrlParameter"
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
			url.searchParams.append(key, value ?? "")
		});
}
export async function transformResponseBody(request: IRequest, fetchResponse: Response | null = null): Promise<HttpResponseFormatResult> {
	let resultType: HttpResponseFormat = null;
	if (request.options.responseType && typeof request.options.responseType === "function") {
		let resolved = request.options.responseType(request, fetchResponse);
		resultType = resolved instanceof Promise ? await resolved : resolved;
	}
	else resultType = request.options.responseType;

	if (!fetchResponse || fetchResponse.status === 204 || !request.options.responseType)
		return { success: true, result: null, resultType };

	const contentLen = fetchResponse.headers.get("Content-Length");
	if (contentLen) {
		const responseSize = parseInt(fetchResponse.headers.get("Content-Length") ?? "");
		if (!responseSize)
			return { success: true, result: null, resultType };
	}

	if (!resultType)
		return { success: true, result: null, resultType };

	try {
		const result = await fetchResponse[resultType]();
		return { success: true, result, resultType };
	}
	catch (error) {
		return { success: false, result: null, resultType };
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
export const resolveAny: IResponseAny = (prom: Promise<any>) => {
	return new Promise<any>(resolve => {
		prom.then((response: any) => resolve([response, null]))
			.catch((err: any) => resolve([null, err]));
	});
};

export function cloneObject (obj: IKeyValue) {
	let cloned: IKeyValue = {};
	for (let [key] of Object.entries(obj)) {
		const clonedVal = cloneValue(obj, key);
		cloned[key] = clonedVal;
	}
	return cloned;
}
export function cloneValue (original: IKeyValue, propName: string | number): any {
	const oldval = original[propName];
	if (oldval === null) return null;
	const type = typeof oldval;
	if (type === "undefined") return undefined;
	if (type === "function") return oldval;
	if (type === "string") return String(oldval);
	if (type === "number") return Number(oldval);
	if (type === "boolean") return Boolean(oldval);
	if (globalThis.Headers && oldval instanceof Headers) return new Headers(oldval);
	if (globalThis.AbortController && oldval instanceof AbortController) return new AbortController();
	if (globalThis.FormData && oldval instanceof FormData) {
		const cloned = new FormData();
		oldval.forEach((value, key) => cloned.append(key, value));
		return cloned;
	}
	if (Array.isArray(oldval)) return oldval.map((v, i) => cloneValue(oldval, i));
	if (type === 'object') return { ...oldval };
}
export function mergeObject (target: IKeyValue, mergeWith: IKeyValue) {
	for (let [key] of Object.entries(mergeWith)) {
		const mergedVal = mergeValue(target, mergeWith, key);
		target[key] = mergedVal;
	}
	return target;
}
export function mergeValue (original: IKeyValue, mergeWith: IKeyValue, propName: string) {
	const oldval = original[propName];
	const newval = mergeWith[propName];
	if (propName !== "responseType" && (typeof newval === "undefined" || newval === null))
		return oldval;
	else if (newval instanceof AbortController)
		return newval;
	else if (Array.isArray(newval)) return oldval ? [...oldval, ...newval] : newval;
	else if (newval instanceof Headers) {
		const headers = (oldval as Headers);
		if (!headers) return newval;
		newval.forEach((hval, hkey) => {
			if (!hval || hval == "null" || hval == "undefined")
				headers.delete(hkey);
			else headers.set(hkey, hval);
		});
		return headers;
	}
	else if (typeof newval === 'object' && newval !== null)
		return mergeObject(oldval ?? {}, newval);

	return newval;
}