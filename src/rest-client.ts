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
	protected cacheEraseByKey(cacheKey?: string | null) {
		if (!cacheKey) return;
		for (let key of this._cache.keys())
			if (key.startsWith(`${cacheKey}|`))
				this._cache.delete(key);
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

	private localOverrideWithStrategy(target: Partial<IRestOptions>, obj?: Partial<IRestOptions>) {
		if (this.options.get("overrideStrategy") === "merge") {
			let o = cloneObject(target);
			return mergeObject(o, obj ?? {});
		}
		else return Object.assign({}, target, obj ?? {});
	}
	public async request<TResponse, TError = any>(method: HttpMethod, path: string, requestOptions?: Partial<IRestOptions>) : Promise<IResponse<TResponse, TError>> {
		const that = this;
		const currentOptions = this.options.current();
		const localOptions: Partial<IRestOptions> = requestOptions
			? this.localOverrideWithStrategy(currentOptions, requestOptions)
			: currentOptions
		const url = getRequestUrl(localOptions.host, localOptions.basePath, path);

		if (localOptions.query && Object.keys(localOptions.query).length)
			setUrlParameters(url, localOptions);

		localOptions.cacheKey = localOptions.cacheKey?.trim();
		if (localOptions.internalCache) {
			const cachedResponse = this.cacheGet<TResponse>(localOptions, url);
			if (cachedResponse) return cachedResponse;
		}

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

		const request: IRequest = {
			method, options: localOptions, url,
			body: localOptions.body
		};

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
				const newOpts = that.localOverrideWithStrategy(localOptions, repeatOptions);
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
			const ser = new RestError<TResponse, TError>("BodyParseError", `An error occurred while parsing the response body as ${localOptions.responseType}`);
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

		if (response.error && Boolean(localOptions.throw)) {
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

		if (localOptions.internalCache && method !== "POST" && method !== "PUT" && method !== "DELETE")
			this.cacheSet(localOptions, response);

		return response;
	}
}