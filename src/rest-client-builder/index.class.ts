import type { IRestOptionsGlobals } from '../interfaces';
import type { CheckAndRestoreDefault, CloneOptions, CurrentOptions, GetOption, MergeOrAssignOptions, SetOption, UnsetOption } from '.';
import useRestClientBuilder from '.';
import RestClient from '../rest-client/index.class';

export default class RestClientBuilder<TResponse = any, TError = any> {
	private _options: Partial<IRestOptionsGlobals<TResponse, TError>>;
	private _restFactory: typeof RestClient;
	checkAndRestoreDefaults: CheckAndRestoreDefault;
	current: (...params: Parameters<CurrentOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError>;
	get: (...params: Parameters<GetOption<TResponse, TError>>) => RestClientBuilder<TResponse, TError>;
	set: (...params: Parameters<SetOption<TResponse, TError>>) => RestClientBuilder<TResponse, TError>;
	unset: (...params: Parameters<UnsetOption<TResponse, TError>>) => RestClientBuilder<TResponse, TError>;
	clone: (...params: Parameters<CloneOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError>;
	merge: (...params: Parameters<MergeOrAssignOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError>;
	assign: (...params: Parameters<MergeOrAssignOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError>;

	constructor(options?: Partial<IRestOptionsGlobals<TResponse, TError>>, factoryClass?: typeof RestClient) {
		this._options = options ?? {};
		this._restFactory = factoryClass ?? RestClient;
		const restOpts = useRestClientBuilder<TResponse, TError>(this._options);
		this.checkAndRestoreDefaults = restOpts.checkAndRestoreDefaults;
		this.current = () => {
			restOpts.currentOptions();
			return this;
		};
		this.get = (...args) => {
			restOpts.getOption(...args);
			return this;
		};
		this.set = (...args) => {
			restOpts.setOption(...args);
			return this;
		};
		this.unset = (...args) => {
			restOpts.unsetOption(...args);
			return this;
		};
		this.clone = (...args) => {
			const options = restOpts.cloneOptions(...args);
			return new RestClientBuilder(options, this._restFactory);
		};
		this.merge = (...args) => {
			restOpts.mergeOptions(...args);
			return this;
		};
		this.assign = (...args) => {
			restOpts.mergeOptions(...args);
			return this;
		};
	}
	public setFactory(factoryClass: typeof RestClient) {
		this._restFactory = factoryClass;
		return this;
	}
	public createRestClient<T extends RestClient<TResponse, TError>>(): T {
		const options = this.clone()._options;
		return new this._restFactory(options) as T;
	}
}