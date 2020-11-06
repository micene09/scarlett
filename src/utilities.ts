import { IRestOptions, HttpMethod, HttpResponseFormat, IRestOptionsQuery, IKeyValue, IResponseAny } from "./interfaces";
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
			url.searchParams.append(key, value ?? "")
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
export const resolveAny: IResponseAny = (prom: Promise<any>) => {
	return new Promise<any>(resolve => {
		prom.then((response: any) => resolve([response, null]))
			.catch((err: any) => resolve([null, err]));
	});
};

export function cloneObject (obj: IKeyValue) {
	let cloned: IKeyValue = {};
	for (let [key, val] of Object.entries(obj)) {
		const clonedVal  = cloneValue(obj, key);
		cloned[key] = clonedVal;
	}
	return cloned;
}
export function cloneValue (original: IKeyValue, propName: string | number): any {
	const oldval = original[propName];
	const type = typeof oldval;
	if (!oldval) return;
	else if (type === "string") return String(oldval);
	else if (type === "number") return Number(oldval);
	else if (type === "boolean") return Boolean(oldval);
	else if (globalThis.Headers && oldval instanceof Headers) return new Headers(oldval);
	else if (globalThis.AbortController && oldval instanceof AbortController) return new AbortController();
	else if (globalThis.FormData && oldval instanceof FormData) {
		const cloned = new FormData();
		oldval.forEach((value, key) => cloned.append(key, value));
		return cloned;
	}
	else if (typeof oldval === 'object') return cloneObject(oldval);
	else if (Array.isArray(oldval)) return oldval.map((v, i) => cloneValue(oldval, i));
	return oldval;
}
export function mergeObject (target: IKeyValue, mergeWith: IKeyValue) {
	for (let [key, val] of Object.entries(mergeWith)) {
		const mergedVal = mergeValue(target, mergeWith, key);
		target[key] = mergedVal;
	}
	return target;
}
export function mergeValue (original: IKeyValue, mergeWith: IKeyValue, propName: string) {
	const oldval = original[propName];
	const newval = mergeWith[propName];
	if (typeof newval === "undefined" || newval === null)
		return oldval;
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
	else if (typeof newval === 'object') return mergeObject(oldval ?? {}, newval);
	return newval;
}