import type { IRestOptions, IRestOptionsGlobals } from '../interfaces';
import useRestOptions, { CheckAndRestoreDefault, CloneOptions, CurrentOptions, GetOption, MergeOrAssignOptions, SetOption, UnsetOption } from '.';
import { cloneObject, mergeObject, cloneValue } from '../utilities';
import RestClient from '../rest-client/index.class';

export default class RestOptions<TResponse = any, TError = any> {
	private _options: Partial<IRestOptionsGlobals<TResponse, TError>>;
	private _restFactory: typeof RestClient;
	checkAndRestoreDefaults: CheckAndRestoreDefault;
	current: CurrentOptions<TResponse, TError>;
	get: GetOption<TResponse, TError>;
	set: SetOption<TResponse, TError>;
	unset: UnsetOption<TResponse, TError>;
	clone: CloneOptions<TResponse, TError>;
	merge: MergeOrAssignOptions<TResponse, TError>;
	assign: MergeOrAssignOptions<TResponse, TError>;

	constructor(options?: Partial<IRestOptionsGlobals<TResponse, TError>>, factoryClass?: typeof RestClient) {
		this._options = options ?? {};
		this._restFactory = factoryClass ?? RestClient;
		const restOpts = useRestOptions<TResponse, TError>(this._options);
		this.checkAndRestoreDefaults = restOpts.checkAndRestoreDefaults;
		this.current = restOpts.currentOptions;
		this.get = restOpts.getOption;
		this.set = restOpts.setOption;
		this.unset = restOpts.unsetOption;
		this.clone = restOpts.cloneOptions;
		this.merge = restOpts.mergeOptions;
		this.assign = restOpts.mergeOptions;
	}
	public setFactory(factoryClass: typeof RestClient) {
		this._restFactory = factoryClass;
		return this;
	}
	public createRestClient<T extends RestClient<TResponse, TError>>(): T {
		const options = this.clone();
		return new this._restFactory(options) as T;
	}
}