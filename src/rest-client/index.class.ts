import type { CacheClear, CacheClearByKey, CacheGet, CacheKey, CacheSet, OptionsOverride, RequestMethod, RequestMethodFull } from ".";
import createRestClient from ".";
import type { IResponse, IRestOptionsGlobals } from "../interfaces";
import RestClientBuilder from "../rest-client-builder/index.class";

export default class RestClient<TResponse = any, TError = any> {
	private _cache: Map<string, IResponse<TResponse, TError>>;
	options: RestClientBuilder<TResponse, TError>;
	cacheKey: CacheKey;
	cacheClear: CacheClear;
	cacheClearByKey: CacheClearByKey;
	cacheSet: CacheSet;
	cacheGet: CacheGet;
	optionsOverride: OptionsOverride;
	get: RequestMethod;
	delete: RequestMethod;
	post: RequestMethod;
	put: RequestMethod;
	patch: RequestMethod;
	request: RequestMethodFull;
	constructor(options?: Partial<IRestOptionsGlobals<TResponse, TError>>) {
		this._cache = new Map();
		const useRestClient = createRestClient<TResponse, TError>(options, this._cache);
		const client = useRestClient();
		this.options = new RestClientBuilder(options ?? {});
		this.cacheKey = client.cacheKey;
		this.cacheClear = client.cacheClear;
		this.cacheClearByKey = client.cacheClearByKey;
		this.cacheSet = client.cacheSet;
		this.cacheGet = client.cacheGet;
		this.optionsOverride = client.optionsOverride;
		this.get = client.get;
		this.delete = client.del;
		this.post = client.post;
		this.put = client.put;
		this.patch = client.patch;
		this.request = client.request;
	}
}