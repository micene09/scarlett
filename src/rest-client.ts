import { cloneDeep, assign } from 'lodash';
import { IRequestOptions, IResponse, IRequest, HttpMethod, HTTPStatusCode } from './interfaces';
import RestError from "./rest-error";
import { getRequestUrl, setUrlParameters, getRequestHeaders, resolveAny, transformResponse, transformResponseBody } from './utilities';
export default class RestClient {
	private _options: IRequestOptions;
	private _cache = new Map<string, IResponse<any>>();
	constructor(options?: IRequestOptions) {
		this._options = cloneDeep(options) ?? {};
	}
	protected cacheKey(options: IRequestOptions, url: URL) {
		const cacheKey = options.cacheKey ?? '';
		function formDataToObj(formData: FormData) {
			let o: any = {};
			formData.forEach((value, key) => (o[key] = value));
			return o;
		}
		const inputs = options.body ? (
			options.responseType === "json" ? JSON.stringify(options.body)
			: options.responseType === "text" ? options.body
			: options.responseType === "formData" ? JSON.stringify(formDataToObj(options.body as FormData))
			: ""
		) : "";
		return `${cacheKey}|${url.href}|${inputs}`;
	}
	protected cacheEraseByCacheKey(cacheKey: string) {
		const keysIterator = this._cache.keys();
		let result = keysIterator.next();
		while (!result.done) {
			if (result.value.startsWith(`${cacheKey}|`))
				this._cache.delete(result.value);
			result = keysIterator.next();
		}
	}
	protected cacheSet(options: IRequestOptions, response: IResponse<any>) {
		const key = this.cacheKey(options, response.request.url);
		this._cache.set(key, response);
	}
	protected cacheGet<T>(options: IRequestOptions, url: URL) {
		const key = this.cacheKey(options, url);
		return this._cache.get(key) as IResponse<T> | undefined | null;
	}
	//#region request shortcut
	public get<T>(path: string, overrides?: IRequestOptions) {
		return this.request<T>("GET", path, overrides);
	}
	public delete<T>(path: string, overrides?: IRequestOptions) {
		return this.request<T>("DELETE", path, overrides);
	}
	public post<T>(path: string, overrides?: IRequestOptions) {
		return this.request<T>("POST", path, overrides);
	}
	public put<T>(path: string, overrides?: IRequestOptions) {
		return this.request<T>("GET", path, overrides);
	}
	public patch<T>(path: string, overrides?: IRequestOptions) {
		return this.request<T>("GET", path, overrides);
	}
	//#endregion
	public async request<T>(method: HttpMethod, path: string, requestOptions?: IRequestOptions) {
		const options: IRequestOptions = requestOptions ? assign({}, cloneDeep(this._options), requestOptions) : cloneDeep(this._options);
		const url = getRequestUrl(options.host, options.basePath, path);

		if (method === "GET" && options.query)
			setUrlParameters(url, options);

		const headers = getRequestHeaders(method, options);
		options.cacheKey = options.cacheKey?.trim();

		if (options.useCache) {
			const cachedResponse = this.cacheGet<T>(options, url);
			if (cachedResponse) return cachedResponse;
		}

		if (!options.timeout)
			options.timeout = 30;

		const [fetchResponse, fetchError] = await resolveAny<Response, Error>(new Promise((resolve, reject) => {

			let timeoutTrigger = false;
			let fetchResolved = false;

			const abortController = options.abortController ?? new AbortController();
			const id = setTimeout(function requestTimeout() {
				if (fetchResolved)
					return;
				timeoutTrigger = true;
				abortController.abort();
				const timeoutError = new Error();
				timeoutError.name = "timeout";
				timeoutError.message = `Request timeout after ${options.timeout!/60} seconds.`;
				reject(timeoutError);
			}, options.timeout);

			fetch(url.href, {
				method,
				headers,
				body: method === "GET" ? undefined : transformResponseBody(options.body),
				cache: "no-cache",
				credentials: "same-origin",
				signal: abortController.signal,
			})
			.then((response) => {
				if (timeoutTrigger) return;
				clearTimeout(id);
				resolve(response);
			})
			.catch((error) => reject(error))
			.finally(() => (fetchResolved = true));
		}));

		const request: IRequest = {
			method, options, url,
			body: method === "GET" ? undefined : options.body
		};
		const data = fetchResponse ? await transformResponse<T>(fetchResponse, options.responseType) : null;
		const response: IResponse<T> = {
			fetchResponse: fetchResponse ?? undefined,
			request,
			headers: await fetchResponse?.trailer,
			data,
			status: fetchResponse?.status as HTTPStatusCode
		};

		if (fetchError) {
			let ser: RestError<any> = new RestError<T>(fetchError.name, fetchError.message);
			ser.stack = fetchError.stack;
			if (ser.name === "timeout")
				ser.code = HTTPStatusCode.RequestTimeout;
			ser.setRequest(request);
			ser.setResponse(response);
			response.error = ser;
		}
		else if (fetchResponse?.ok === false) {
			const ser = new RestError<T>(fetchResponse.status, fetchResponse.statusText);
			ser.setRequest(request);
			ser.setResponse(response);
			response.error = ser;
		}
		if (!options.throw && options.throwExcluding && options.throwExcluding.length)
			options.throw = true;
		if (response.error && Boolean(options.throw)) {
			const throwFilterFound = options.throwExcluding?.find((f: any) => response!.error!.throwFilterMatch(f))
				?? false;
			if (!throwFilterFound)
				throw response.error;
			else {
				if (typeof throwFilterFound.cback === "function")
					throwFilterFound.cback(response.error);
				response.throwFilter = throwFilterFound;
			}
		}

		if (options.useCache && method !== "POST" && method !== "PUT" && method !== "DELETE")
			this.cacheSet(options, response);

		return response;
	}
}