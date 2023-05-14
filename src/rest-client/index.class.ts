import type { CacheClear, CacheClearByKey, CacheGet, CacheKey, CacheSet, OptionsOverride, RequestMethod, RequestMethodFull } from ".";
import createRestClient from ".";
import type { IResponse, IRestOptionsGlobals } from "../interfaces";
import RestOptions from "../rest-options";

export default class RestClient<TResponse = any, TError = any> {
	private _cache: Map<string, IResponse<TResponse, TError>>;
	protected options: RestOptions<TResponse, TError>;
	protected cacheKey: CacheKey;
	protected cacheClear: CacheClear;
	protected cacheClearByKey: CacheClearByKey;
	protected cacheSet: CacheSet<TResponse, TError>;
	protected cacheGet: CacheGet<TResponse, TError>;
	protected optionsOverride: OptionsOverride<TResponse, TError>;
	protected get: RequestMethod<TResponse, TError>;
	protected delete: RequestMethod<TResponse, TError>;
	protected post: RequestMethod<TResponse, TError>;
	protected put: RequestMethod<TResponse, TError>;
	protected patch: RequestMethod<TResponse, TError>;
	protected request: RequestMethodFull<TResponse, TError>;
	constructor(options?: Partial<IRestOptionsGlobals<TResponse, TError>>) {
		this._cache = new Map();
		const useRestClient = createRestClient(options, this._cache);
		const client = useRestClient();
		this.options = new RestOptions(options ?? {});
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