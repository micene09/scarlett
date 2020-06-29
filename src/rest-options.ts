import { IRequestOptions, IKeyValue } from './interfaces';
import RestClient from '.';

export class RestOptions {
	private _options: IRequestOptions;
	private _restFactory: typeof RestClient;
	constructor(options?: IRequestOptions, factoryClass?: typeof RestClient) {
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
	}
	public createRestClient() {
		const options = this.clone().current();
		return new this._restFactory(options);
	}
	public set<K extends keyof IRequestOptions>(key: K, val: IRequestOptions[K]) {
		this._options[key] = val;
	}
	public clone() {
		const cloned = Object.assign({}, this._options);
		return new RestOptions(cloned);
	}
	public merge(obj: IRequestOptions) {
		const deepMergeValue = (original: IKeyValue, propName: string, newval: any) => {
			const oldval = original[propName];
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
			else if (typeof newval === 'object') {
				let oldnestedObj = original[propName] as IKeyValue;
				let newObj = {};
				for (let [key, val] of Object.entries(newval as object)) {
					let nestedv = deepMergeValue(oldnestedObj, key, val) as any;
					newObj = {...newObj, [key]: nestedv};
				}
				return newObj;
			}
			return newval;
		}
		for (let [key, val] of Object.entries(obj)) {
			const merged  = deepMergeValue(this._options, key, val);
			this._options[key as keyof IRequestOptions] = merged;
		}
		return this;
	}
	public assign(obj?: IRequestOptions | undefined) {
		Object.assign(this._options, obj ?? {});
		return this;
	}
}