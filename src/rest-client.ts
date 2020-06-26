import { IRequestOptions, IResponse, IRequest, HttpMethod, HTTPStatusCode } from './interfaces';
import RestError from "./rest-error";
import { getRequestUrl, setUrlParameters, getRequestHeaders, resolveAny, transformResponseBody, transformRequestBody } from './utilities';
import { RestOptions } from "./rest-options";

export default class RestClient {
	private _options: RestOptions;
	private _cache = new Map<string, IResponse<any>>();
	constructor(options?: IRequestOptions) {
		this._options = new RestOptions(options ?? {});
	}
	//#region cache
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
	protected cacheGet<TResponse>(options: IRequestOptions, url: URL) {
		const key = this.cacheKey(options, url);
		return this._cache.get(key) as IResponse<TResponse> | undefined | null;
	}
	//#endregion
	//#region request shortcut
	public get<TResponse, TError = any>(path: string, overrides?: IRequestOptions) {
		return this.request<TResponse, TError>("GET", path, overrides);
	}
	public delete<TResponse, TError = any>(path: string, overrides?: IRequestOptions) {
		return this.request<TResponse, TError>("DELETE", path, overrides);
	}
	public post<TResponse, TError = any>(path: string, overrides?: IRequestOptions) {
		return this.request<TResponse, TError>("POST", path, overrides);
	}
	public put<TResponse, TError = any>(path: string, overrides?: IRequestOptions) {
		return this.request<TResponse, TError>("GET", path, overrides);
	}
	public patch<TResponse, TError = any>(path: string, overrides?: IRequestOptions) {
		return this.request<TResponse, TError>("GET", path, overrides);
	}
	//#endregion
	public async request<TResponse, TError = any>(method: HttpMethod, path: string, requestOptions?: IRequestOptions) : Promise<IResponse<TResponse, TError>> {
		const that = this;
		const options = this._options.localOverride(requestOptions);
		const url = getRequestUrl(options.host, options.basePath, path);

		if (method === "GET" && options.query)
			setUrlParameters(url, options);

		const headers = getRequestHeaders(method, options);
		options.cacheKey = options.cacheKey?.trim();

		if (options.useCache) {
			const cachedResponse = this.cacheGet<TResponse>(options, url);
			if (cachedResponse) return cachedResponse;
		}

		if (!options.timeout)
			options.timeout = 30000;

		const [fetchResponse, fetchError] = await resolveAny<Response, Error>(new Promise((resolve, reject) => {

			let timeoutTrigger = false;
			let fetchFullFilled = false;

			const abortController = options.abortController ?? new AbortController();
			const id = setTimeout(function requestTimeout() {
				if (fetchFullFilled)
					return;
				timeoutTrigger = true;
				abortController.abort();
				let timeoutError = new Error();
				timeoutError.name = "timeout";
				const seconds = (options.timeout!/1000).toFixed(1).replace(".0", "");
				timeoutError.message = `Request timeout after ${seconds} second${seconds == "1" ? "" : "s"}.`;
				reject(timeoutError);
			}, options.timeout);

			fetch(url.href, {
				method,
				headers,
				body: method === "GET" ? undefined : transformRequestBody(options.body),
				cache: "no-cache",
				credentials: "same-origin",
				signal: abortController.signal,
			})
			.then((response) => {
				if (timeoutTrigger) return;
				resolve(response);
			})
			.catch((error) => reject(error))
			.finally(() => {
				fetchFullFilled = true;
				clearTimeout(id);
			});
		}));

		const request: IRequest = {
			method, options, url,
			body: method === "GET" ? undefined : options.body
		};

		const [ parseOk, data ] = await transformResponseBody<TResponse>(fetchResponse, options.responseType);

		const response: IResponse<TResponse, TError> = {
			fetchResponse: fetchResponse ?? undefined,
			request,
			headers: await fetchResponse?.trailer,
			data,
			status: fetchResponse?.status as HTTPStatusCode,
			repeat: function (m?: HttpMethod | IRequestOptions, repeatOptions?: IRequestOptions) {
				if (arguments.length == 2) {
					m = (m ? m : method);
					repeatOptions = (repeatOptions ? repeatOptions : {});
				}
				else if (arguments.length == 1) {
					repeatOptions = (m ? m : {}) as IRequestOptions;
					m = method;
				}
				else if (!arguments.length) {
					m = method;
					repeatOptions = {};
				}
				const newOpts = Object.assign({}, options, repeatOptions ?? {});
				return that.request<TResponse, TError>(m as HttpMethod, path, newOpts);
			}
		};

		if (fetchError) {
			const ser = new RestError<TResponse, TError>(fetchError.name, fetchError.message);
			ser.stack = fetchError.stack;
			if (ser.code === "timeout")
				response.status = HTTPStatusCode.RequestTimeout;
			ser.setRequest(request);
			ser.setResponse(response);
			response.error = ser;
		}
		else if (!parseOk) {
			const ser = new RestError<TResponse, TError>("BodyParseError", `An error occurred while parsing the response body as ${options.responseType}`);
			ser.setRequest(request);
			ser.setResponse(response);
			response.error = ser;
		}
		else if (fetchResponse?.ok === false) {
			const ser = new RestError<TResponse, TError>(fetchResponse.status, fetchResponse.statusText);
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
				if (typeof throwFilterFound.onFilterMatch === "function")
					throwFilterFound.onFilterMatch(response.error);
				response.throwFilter = throwFilterFound;
			}
		}

		if (options.useCache && method !== "POST" && method !== "PUT" && method !== "DELETE")
			this.cacheSet(options, response);

		return response;
	}
}