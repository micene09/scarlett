import { IRestOptions } from './interfaces';
import RestClient from '.';
import { cloneObject, mergeObject } from './utilities';

export class RestOptions {
	private _options: Partial<IRestOptions>;
	private _restFactory: typeof RestClient;
	constructor(options?: Partial<IRestOptions>, factoryClass?: typeof RestClient) {
		this._options = options ?? {};

		if (!this._options.overrideStrategy) this._options.overrideStrategy = "merge";

		if (!this._options.abortController) this._options.abortController = new AbortController();
		if (!this._options.credentials) this._options.credentials = "same-origin";
		if (!this._options.mode) this._options.mode = "same-origin";
		if (!this._options.cache) this._options.cache = "default";
		if (!this._options.redirect) this._options.redirect = "follow";
		if (typeof this._options.referrer == "undefined") this._options.referrer = "";
		if (!this._options.referrerPolicy) this._options.referrerPolicy = "no-referrer-when-downgrade";

		if (!this._options.throw && this._options.throwExcluding && this._options.throwExcluding.length)
			this._options.throw = true;
		if (!this._options.responseType) this._options.responseType = "json";
		if (!this._options.timeout) this._options.timeout = 30000;

		this._restFactory = factoryClass ?? RestClient;
	}
	public current() {
		return this._options;
	}
	public setFactory(factoryClass: typeof RestClient) {
		this._restFactory = factoryClass;
		return this;
	}
	public createRestClient<T extends RestClient>() {
		const options = this.clone().current();
		return new this._restFactory(options) as T;
	}
	public set<K extends keyof IRestOptions>(key: K, val: IRestOptions[K]) {
		this._options[key] = val;
		return this;
	}
	public unset<K extends keyof IRestOptions>(key: K) {
		delete this._options[key];
		return this;
	}
	public clone() {
		const cloned = cloneObject(this._options);
		return new RestOptions(cloned);
	}
	public merge(obj?: Partial<IRestOptions>) {
		mergeObject(this._options, obj ?? {});
		return this;
	}
	public assign(obj?: Partial<IRestOptions>) {
		Object.assign(this._options, obj ?? {});
		return this;
	}
}