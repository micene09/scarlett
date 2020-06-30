import { IRestOptions } from './interfaces';
import RestClient from '.';
import { cloneObject, mergeObject } from './utilities';

export class RestOptions {
	private _options: Partial<IRestOptions>;
	private _restFactory: typeof RestClient;
	constructor(options?: Partial<IRestOptions>, factoryClass?: typeof RestClient) {
		this._options = options ?? {
			responseType: "json",
			timeout: 30000
		};
		if (!this._options.throw && this._options.throwExcluding && this._options.throwExcluding.length)
			this._options.throw = true;

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
	public merge(obj: Partial<IRestOptions>) {
		mergeObject(this._options, obj);
		return this;
	}
	public assign(obj?: Partial<IRestOptions>) {
		Object.assign(this._options, obj ?? {});
		return this;
	}
}