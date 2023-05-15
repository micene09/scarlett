import type { IRestOptionsGlobals, IResponse, HttpMethod, IRestOptions, IRequest, HTTPStatusCode } from "../interfaces";
import RestError from "../rest-error";
import useRestOptions from "../rest-client-builder";
import { cloneObject, getRequestUrl, mergeObject, resolveAny, setUrlParameters, transformRequestBody, transformResponseBody } from "../utilities";

export type CacheKey = (url: URL, method: HttpMethod | "*", customKey?: string) => string;
export type CacheClear = () => void;
export type CacheClearByKey = (cacheKey?: string | null) => void;
export type CacheSet = <TResponse = any, TError = any>(response: IResponse<TResponse, TError>, customKey?: string) => void;
export type CacheGet = <TResponse = any, TError = any>(url: URL, method: HttpMethod | "*", customKey?: string) => IResponse<TResponse, TError> | undefined;
export type OptionsOverride = <TResponse = any, TError = any>(overrides?: Partial<IRestOptions<TResponse, TError>>, base?: Partial<IRestOptions<TResponse, TError>>) => Partial<IRestOptions<TResponse, TError>>
export type RequestMethod = <TResponse = any, TError = any>(path: string, overrides?: Partial<IRestOptions<TResponse, TError>>) => Promise<IResponse<TResponse, TError>>;
export type RequestMethodFull = <TResponse = any, TError = any>(method: HttpMethod, path: string, overrides?: Partial<IRestOptions<TResponse, TError>>) => Promise<IResponse<TResponse, TError>>;

export default function createRestClient<TResponse = any, TError = any>(options?: Partial<IRestOptionsGlobals<TResponse, TError>>, cache?: Map<string, IResponse<TResponse, TError>>) {
	const _cache = cache ?? new Map<string, IResponse<TResponse, TError>>();
	const { getOption, currentOptions } = useRestOptions(options ?? {});
	const cacheKey: CacheKey = (url, method = "*", customKey) => {
		const cacheKey = customKey?.trim() ? customKey : (getOption("cacheKey") ?? '');
		function formDataToObj(formData: FormData) {
			let o: any = {};
			formData.forEach((value, key) => (o[key] = value));
			return o;
		}
		const body = getOption("body");
		const responseType = getOption("responseType");
		const inputs = body ? (
			responseType === "json" ? JSON.stringify(body)
			: responseType === "text" ? body
			: responseType === "formData" ? JSON.stringify(formDataToObj(body as FormData))
			: ""
		) : "";
		return `${cacheKey}|${url.href}|${method}|${inputs}`;
	};
	const cacheClear: CacheClear = () => {
		_cache.clear();
	};
	const cacheClearByKey: CacheClearByKey = cacheKey => {
		if (!cacheKey) return;
		for (let key of _cache.keys())
			if (key.startsWith(`${cacheKey}|`))
				_cache.delete(key);
	}
	const cacheSet: CacheSet = <TResponse, TError>(response: IResponse<TResponse, TError>, customKey?: string) => {
		const key = cacheKey(response.request.url, response.request.method, customKey);
		_cache.set(key, response as any);
	};
	const cacheGet: CacheGet = <TResponse, TError>(url: URL, method: HttpMethod | "*" = "*", customKey?: string) => {
		const key = cacheKey(url, method, customKey);
		return _cache.get(key) as IResponse<TResponse, TError> | undefined;
	};
	const optionsOverride: OptionsOverride = <TResponse, TError>(overrides?: Partial<IRestOptions<TResponse, TError>>, base?: Partial<IRestOptions<TResponse, TError>>) => {
		const target = base ?? currentOptions();
		if (getOption("overrideStrategy") === "merge") {
			let o = cloneObject(target);
			return mergeObject(o, overrides ?? {}, ["body"]) as Partial<IRestOptions<TResponse, TError>>;
		}
		else return Object.assign({}, target, overrides ?? {});
	}
	const requestFull: RequestMethodFull = async <TResponse, TError>(method: HttpMethod, path: string, requestOptions?: Partial<IRestOptions<TResponse, TError>>): Promise<IResponse<TResponse, TError>> => {
		const localOptions = (requestOptions
			? optionsOverride(requestOptions)
			: currentOptions()) as Partial<IRestOptions<TResponse, TError>>
		const url = getRequestUrl(localOptions.host, localOptions.basePath, path);

		if (localOptions.query && Object.keys(localOptions.query).length)
			setUrlParameters(url, localOptions);

		localOptions.cacheKey = localOptions.cacheKey?.trim();
		if (localOptions.internalCache) {
			const cachedResponse = cacheGet(url, method);
			if (cachedResponse) return Promise.resolve(cachedResponse);
		}
		if (!localOptions.abortController)
			localOptions.abortController = new AbortController();

		const request: IRequest<TResponse, TError> = {
			method, options: localOptions, url,
			body: localOptions.body
		};

		const onRequest = getOption("onRequest");
		if (typeof onRequest == "function") {
			const result = onRequest(request as any);
			if (result instanceof Promise)
				await result;
		}

		let timeoutTriggered = false;
		let fetchFullFilled = false;
		const [fetchResponse, fetchError] = await resolveAny<Response, Error>(new Promise((resolve, reject) => {
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
			const timeoutId = localOptions.timeout
				? setTimeout(onRequestTimeout, localOptions.timeout)
				: null;
			function onRequestTimeout() {
				if (fetchFullFilled) return;
				timeoutTriggered = true;
				localOptions.abortController?.abort();
				reject(new Error("timeout"));
			}
			function stopTimeout() {
				if (timeoutId)
					clearTimeout(timeoutId);
				if (timeoutTriggered) return;
				timeoutTriggered = false;
			};
			fetch(url.href, req)
				.then((response) => {
					if (timeoutTriggered) return;
					stopTimeout();
					fetchFullFilled = true;
					resolve(response);
				})
				.catch(error => {
					if (timeoutTriggered) return;
					stopTimeout();
					reject(error);
				});
		}));

		const transformResult = await transformResponseBody(request, fetchResponse);
		localOptions.responseType = transformResult.resultType;
		const data = transformResult.result;
		const isBodyParseError = transformResult.success === false;
		const isTimeout = timeoutTriggered && !fetchFullFilled;
		const isAbort = fetchError?.name === 'AbortError' && !fetchFullFilled;
		const response: IResponse<TResponse, TError> = {
			fetchResponse,
			headers: fetchResponse?.headers,
			request, data,
			status: fetchResponse?.status as HTTPStatusCode,
			repeat(m?: HttpMethod | Partial<IRestOptions<TResponse, TError>>, repeatOptions?: Partial<IRestOptions<TResponse, TError>>) {
				if (arguments.length == 2) {
					m = (m ? m : method);
					repeatOptions = (repeatOptions ? repeatOptions : {});
				}
				else if (arguments.length == 1) {
					repeatOptions = (m ? m : {}) as IRestOptions<TResponse, TError>;
					m = method;
				}
				else if (!arguments.length) {
					m = method;
					repeatOptions = {};
				}
				const newOpts = optionsOverride(repeatOptions, localOptions);
				return requestFull(m as HttpMethod, path, newOpts);
			}
		};

		if (isBodyParseError || isTimeout || isAbort) {
			const seconds = (localOptions.timeout!/1000).toFixed(2);
			const secondsIsOne = (localOptions.timeout!/1000).toFixed(1).replace(".0", "") == "1";
			const message = isTimeout ? `Request timed out after ${seconds} second${secondsIsOne ? "" : "s"}`
				: isBodyParseError ? `An error occurred while parsing the response body as ${localOptions.responseType}`
				: isAbort ? `Request aborted` : ""
			response.error = new RestError<TError>(message, undefined, isTimeout ? "Timeout" : "BodyParse");
		}
		else if (fetchError) {
			const err = new RestError<TError>(fetchError.message, response.status);
			err.stack = fetchError.stack;
			response.error = err;
		}
		else if (fetchResponse?.ok === false) {
			const err = new RestError<TError>(fetchResponse.statusText, fetchResponse.status);
			response.error = err;
		}

		let onErrorCalled = false;
		if (response.error && !isAbort) {
			response.error.data = data;
			response.error.request = request;
			response.error.fetchResponse = fetchResponse ?? undefined;
			response.data = null;
			const couldThrow = Boolean(localOptions.throw || localOptions.throwExcluding?.length);
			if (couldThrow) {
				const throwFilterFound = await response.error.findMatch(localOptions.throwExcluding ?? []);
				if (throwFilterFound)
					response.throwFilter = throwFilterFound;
				else {
					const onError = getOption("onError");
					if (typeof onError == "function") {
						onErrorCalled = true;
						onError(response.error as any, response as any);
					}
					else throw response.error;
				}
			}
		}
		if (localOptions.internalCache)
			cacheSet(response);

		if (!onErrorCalled) {
			const onResponse = getOption("onResponse");
			if (typeof onResponse == "function")
				onResponse(response as any);
		}

		return response;
	};
	const get: RequestMethod = <TResponse, TError>(path: string, overrides?: Partial<IRestOptions<TResponse, TError>>) => requestFull<TResponse, TError>("GET", path, overrides);
	const del: RequestMethod = <TResponse, TError>(path: string, overrides?: Partial<IRestOptions<TResponse, TError>>) => requestFull<TResponse, TError>("DELETE", path, overrides);
	const post: RequestMethod = <TResponse, TError>(path: string, overrides?: Partial<IRestOptions<TResponse, TError>>) => requestFull<TResponse, TError>("POST", path, overrides);
	const patch: RequestMethod = <TResponse, TError>(path: string, overrides?: Partial<IRestOptions<TResponse, TError>>) => requestFull<TResponse, TError>("PATCH", path, overrides);
	const put: RequestMethod = <TResponse, TError>(path: string, overrides?: Partial<IRestOptions<TResponse, TError>>) => requestFull<TResponse, TError>("PUT", path, overrides);

	return () => ({
		cacheKey,
		cacheClear,
		cacheClearByKey,
		cacheSet,
		cacheGet,
		optionsOverride,
		request: requestFull,
		get,
		del,
		post,
		patch,
		put
	})
};