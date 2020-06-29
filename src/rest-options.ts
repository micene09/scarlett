import { IRestOptions, IKeyValue } from './interfaces';
import RestClient from '.';

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
		const cloneObject = (obj: IKeyValue) => {
			let cloned: IKeyValue = {};
			for (let [key, val] of Object.entries(obj)) {
				const clonedVal  = cloneValue(obj, key);
				cloned[key] = clonedVal;
			}
			return cloned;
		}
		const cloneValue = (original: IKeyValue, propName: string | number): any => {
			const oldval = original[propName];
			const type = typeof oldval;
			if (!oldval) return;
			else if (type === "string") return String(oldval);
			else if (type === "number") return Number(oldval);
			else if (type === "boolean") return Boolean(oldval);
			else if (oldval instanceof Headers) return new Headers(oldval);
			else if (oldval instanceof AbortController) return new AbortController();
			else if (typeof oldval === 'object') return cloneObject(oldval);
			else if (Array.isArray(oldval)) return oldval.map((v, i) => cloneValue(v, i));
			return oldval;
		}
		const cloned = cloneObject(this._options);
		return new RestOptions(cloned);
	}
	public merge(obj: Partial<IRestOptions>) {
		const mergeObject = (original: IKeyValue, mergeWith: IKeyValue) => {
			for (let [key, val] of Object.entries(mergeWith)) {
				const mergedVal = mergeValue(original, mergeWith, key);
				original[key] = mergedVal;
			}
			return original;
		}
		const mergeValue = (original: IKeyValue, mergeWith: IKeyValue, propName: string) => {
			const oldval = original[propName];
			const newval = mergeWith[propName];
			if (!newval) return;
			else if (Array.isArray(newval)) return [...oldval, ...newval];
			else if (newval instanceof Headers) {
				const headers = oldval as Headers;
				newval.forEach((hval, hkey) => {
					if (!hval || hval == "null" || hval == "undefined")
						headers.delete(hkey);
					else headers.set(hkey, hval);
				});
				return headers;
			}
			else if (typeof newval === 'object') return mergeObject(oldval, newval);
			return newval;
		}
		mergeObject(this._options, obj);
		return this;
	}
	public assign(obj?: Partial<IRestOptions> | undefined) {
		Object.assign(this._options, obj ?? {});
		return this;
	}
}