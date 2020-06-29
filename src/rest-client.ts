import { IRestOptions, IResponse, IRequest, HttpMethod, HTTPStatusCode } from './interfaces';
import RestError from "./rest-error";
import { getRequestUrl, setUrlParameters, getRequestHeaders, resolveAny, transformResponseBody, transformRequestBody } from './utilities';
import { RestOptions } from "./rest-options";

export default class RestClient {
	private _cache = new Map<string, IResponse<any>>();
	public options: RestOptions;
	constructor(options?: Partial<IRestOptions>) {
		this.options = new RestOptions(options ?? {});
	}
	//#region cache
	protected cacheKey(options: Partial<IRestOptions>, url: URL) {
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
	protected cacheSet(options: Partial<IRestOptions>, response: IResponse<any>) {
		const key = this.cacheKey(options, response.request.url);
		this._cache.set(key, response);
	}
	protected cacheGet<TResponse>(options: Partial<IRestOptions>, url: URL) {
		const key = this.cacheKey(options, url);
		return this._cache.get(key) as IResponse<TResponse> | undefined | null;
	}
	//#endregion
	//#region request shortcut
	public get<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>) {
		return this.request<TResponse, TError>("GET", path, overrides);
	}
	public delete<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>) {
		return this.request<TResponse, TError>("DELETE", path, overrides);
	}
	public post<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>) {
		return this.request<TResponse, TError>("POST", path, overrides);
	}
	public put<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>) {
		return this.request<TResponse, TError>("GET", path, overrides);
	}
	public patch<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>) {
		return this.request<TResponse, TError>("GET", path, overrides);
	}
	//#endregion
	public async request<TResponse, TError = any>(method: HttpMethod, path: string, requestOptions?: Partial<IRestOptions>) : Promise<IResponse<TResponse, TError>> {
		const that = this;
		this.options.assign(requestOptions);
		const currOptions = this.options.current();
		const url = getRequestUrl(currOptions.host, currOptions.basePath, path);

		if (method === "GET" && currOptions.query)
			setUrlParameters(url, currOptions.query);

		const headers = getRequestHeaders(method, currOptions);
		currOptions.cacheKey = currOptions.cacheKey?.trim();

		if (currOptions.useCache) {
			const cachedResponse = this.cacheGet<TResponse>(currOptions, url);
			if (cachedResponse) return cachedResponse;
		}

		const [fetchResponse, fetchError] = await resolveAny<Response, Error>(new Promise((resolve, reject) => {

			let timeoutTrigger = false;
			let fetchFullFilled = false;

			const abortController = currOptions.abortController ?? new AbortController();
			const id = setTimeout(function requestTimeout() {
				if (fetchFullFilled)
					return;
				timeoutTrigger = true;
				abortController.abort();
				let timeoutError = new Error();
				timeoutError.name = "timeout";
				const seconds = (currOptions.timeout!/1000).toFixed(1).replace(".0", "");
				timeoutError.message = `Request timeout after ${seconds} second${seconds == "1" ? "" : "s"}.`;
				reject(timeoutError);
			}, currOptions.timeout);

			fetch(url.href, {
				method,
				headers,
				body: method === "GET" ? undefined : transformRequestBody(currOptions.body),
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
			method, options: currOptions, url,
			body: currOptions.body
		};

		const [ parseOk, data ] = await transformResponseBody<TResponse>(fetchResponse, currOptions.responseType);

		const response: IResponse<TResponse, TError> = {
			fetchResponse: fetchResponse ?? undefined,
			headers: await fetchResponse?.trailer,
			options: this.options,
			request, data,
			status: fetchResponse?.status as HTTPStatusCode,
			repeat: function (m?: HttpMethod | IRestOptions, repeatOptions?: Partial<IRestOptions>) {
				if (arguments.length == 2) {
					m = (m ? m : method);
					repeatOptions = (repeatOptions ? repeatOptions : {});
				}
				else if (arguments.length == 1) {
					repeatOptions = (m ? m : {}) as IRestOptions;
					m = method;
				}
				else if (!arguments.length) {
					m = method;
					repeatOptions = {};
				}
				const newOpts = this.options.clone().assign(repeatOptions ?? {}).current();
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
			const ser = new RestError<TResponse, TError>("BodyParseError", `An error occurred while parsing the response body as ${currOptions.responseType}`);
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

		if (response.error && Boolean(currOptions.throw)) {
			const throwFilterFound = currOptions.throwExcluding?.find((f: any) => response!.error!.throwFilterMatch(f))
				?? false;
			if (!throwFilterFound)
				throw response.error;
			else {
				if (typeof throwFilterFound.onFilterMatch === "function")
					throwFilterFound.onFilterMatch(response.error);
				response.throwFilter = throwFilterFound;
			}
		}

		if (currOptions.useCache && method !== "POST" && method !== "PUT" && method !== "DELETE")
			this.cacheSet(currOptions, response);

		return response;
	}
}