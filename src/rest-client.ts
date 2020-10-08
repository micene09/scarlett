import { IRestOptions, IResponse, IRequest, HttpMethod, HTTPStatusCode, IRestOptionsGlobals } from './interfaces';
import RestError from "./rest-error";
import { getRequestUrl, setUrlParameters, resolveAny, transformResponseBody, transformRequestBody, mergeObject, cloneObject } from './utilities';
import { RestOptions } from "./rest-options";

export default class RestClient {
	private _cache = new Map<string, IResponse<any>>();
	public options: RestOptions;
	constructor(options?: Partial<IRestOptionsGlobals>) {
		this.options = new RestOptions(options ?? {});
	}
	//#region cache
	protected cacheKey(url: URL, method: HttpMethod | "*" = "*", customKey?: string) {
		const cacheKey = customKey?.trim() ? customKey : (this.options.get("cacheKey") ?? '');
		function formDataToObj(formData: FormData) {
			let o: any = {};
			formData.forEach((value, key) => (o[key] = value));
			return o;
		}
		const body = this.options.get("body");
		const responseType = this.options.get("responseType");
		const inputs = body ? (
			responseType === "json" ? JSON.stringify(body)
			: responseType === "text" ? body
			: responseType === "formData" ? JSON.stringify(formDataToObj(body as FormData))
			: ""
		) : "";
		return `${cacheKey}|${url.href}|${method}|${inputs}`;
	}
	protected cacheClear() {
		this._cache.clear();
	}
	protected cacheClearByKey(cacheKey?: string | null) {
		if (!cacheKey) return;
		for (let key of this._cache.keys())
			if (key.startsWith(`${cacheKey}|`))
				this._cache.delete(key);
	}
	protected cacheSet(response: IResponse<any>, customKey?: string) {
		const key = this.cacheKey(response.request.url, response.request.method, customKey);
		this._cache.set(key, response);
	}
	protected cacheGet<TResponse>(url: URL, method: HttpMethod | "*" = "*", customKey?: string) {
		const key = this.cacheKey(url, method, customKey);
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

	protected optionsOverride(overrides?: Partial<IRestOptions>, base?: Partial<IRestOptions>) {
		const target = base ?? this.options.current();
		if (this.options.get("overrideStrategy") === "merge") {
			let o = cloneObject(target);
			return mergeObject(o, overrides ?? {});
		}
		else return Object.assign({}, target, overrides ?? {});
	}
	public async request<TResponse, TError = any>(method: HttpMethod, path: string, requestOptions?: Partial<IRestOptions>) : Promise<IResponse<TResponse, TError>> {
		const that = this;
		const localOptions: Partial<IRestOptions> = requestOptions
			? this.optionsOverride(requestOptions)
			: this.options.current()
		const url = getRequestUrl(localOptions.host, localOptions.basePath, path);

		if (localOptions.query && Object.keys(localOptions.query).length)
			setUrlParameters(url, localOptions);

		localOptions.cacheKey = localOptions.cacheKey?.trim();
		if (localOptions.internalCache) {
			const cachedResponse = this.cacheGet<TResponse>(url, method);
			if (cachedResponse) return cachedResponse;
		}

		const request: IRequest = {
			method, options: localOptions, url,
			body: localOptions.body
		};

		const onRequest = this.options.get("onRequest");
		if (typeof onRequest == "function")
			onRequest(request);

		const [fetchResponse, fetchError] = await resolveAny<Response, Error>(new Promise((resolve, reject) => {

			let timeoutTrigger = false;
			let fetchFullFilled = false;
			const timeoutId = setTimeout(function requestTimeout() {
				if (fetchFullFilled)
					return;
				timeoutTrigger = true;
				localOptions.abortController?.abort();
				let timeoutError = new Error();
				timeoutError.name = "timeout";
				const seconds = (localOptions.timeout!/1000).toFixed(1).replace(".0", "");
				timeoutError.message = `Request timeout after ${seconds} second${seconds == "1" ? "" : "s"}.`;
				reject(timeoutError);
			}, localOptions.timeout);

			const req: RequestInit = {
				method,
				body: method === "GET" ? undefined : transformRequestBody(localOptions.body),
				signal: localOptions.abortController?.signal,
				cache: localOptions.cache,
				headers: localOptions.headers,
				credentials: localOptions.credentials,
				keepalive: localOptions.keepalive,
				mode: localOptions.mode,
				redirect: localOptions.redirect,
				referrerPolicy: localOptions.referrerPolicy,
				referrer: localOptions.referrer
			};
			fetch(url.href, req).then((response) => {
				if (!timeoutTrigger)
					resolve(response);
			})
			.catch((error) => reject(error))
			.finally(() => {
				fetchFullFilled = true;
				clearTimeout(timeoutId);
			});
		}));

		const [ parseOk, data ] = await transformResponseBody<TResponse>(fetchResponse, localOptions.responseType);

		const response: IResponse<TResponse, TError> = {
			fetchResponse: fetchResponse ?? undefined,
			headers: await fetchResponse?.trailer,
			options: this.options,
			request, data,
			status: fetchResponse?.status as HTTPStatusCode,
			repeat(m?: HttpMethod | Partial<IRestOptions>, repeatOptions?: Partial<IRestOptions>) {
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
				const newOpts = that.optionsOverride(repeatOptions, localOptions);
				return that.request<TResponse, TError>(m as HttpMethod, path, newOpts);
			}
		};

		if (fetchError) {
			const ser = new RestError<TError, TResponse>(fetchError.name, fetchError.message);
			ser.stack = fetchError.stack;
			if (ser.code === "timeout")
				response.status = HTTPStatusCode.RequestTimeout;
			ser.setRequest(request);
			ser.setResponse(response);
			response.error = ser;
		}
		else if (!parseOk) {
			const ser = new RestError<TError, TResponse>("BodyParseError", `An error occurred while parsing the response body as ${localOptions.responseType}`);
			ser.setRequest(request);
			ser.setResponse(response);
			response.error = ser;
		}
		else if (fetchResponse?.ok === false) {
			const ser = new RestError<TError, TResponse>(fetchResponse.status, fetchResponse.statusText);
			ser.setRequest(request);
			ser.setResponse(response);
			response.error = ser;
		}

		if (response.error) {
			const onError = this.options.get("onError");
			if (typeof onError == "function")
				onError(response.error);

			if (localOptions.throw) {
				const throwFilterFound = localOptions.throwExcluding?.find((f: any) => response!.error!.throwFilterMatch(f))
					?? false;
				if (!throwFilterFound)
					throw response.error;
				else {
					if (typeof throwFilterFound.onFilterMatch === "function")
						throwFilterFound.onFilterMatch(response.error);
					response.throwFilter = throwFilterFound;
				}
			}
		}

		if (localOptions.internalCache)
			this.cacheSet(response);

		const onReponse = this.options.get("onResponse");
		if (typeof onReponse == "function")
			onReponse(response);

		return response;
	}
}