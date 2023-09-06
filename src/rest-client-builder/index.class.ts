import type { IRestOptionsGlobals } from '../interfaces';
import type { CheckAndRestoreDefault, CloneOptions, MergeOrAssignOptions, GetOption, SetOption, UnsetOption } from '.';
import useRestClientBuilder from '.';
import RestClient from '../rest-client/index.class';

export default class RestClientBuilder<TResponse = any, TError = any, TRestClient extends RestClient = RestClient> {
	private _options: Partial<IRestOptionsGlobals<TResponse, TError>>;
	private _restFactory: TRestClient;
	checkAndRestoreDefaults: CheckAndRestoreDefault;
	current: (...params: Parameters<CloneOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError, TRestClient>;
	get: GetOption<TResponse, TError>;
	set: (...params: Parameters<SetOption<TResponse, TError>>) => RestClientBuilder<TResponse, TError, TRestClient>;
	unset: (...params: Parameters<UnsetOption<TResponse, TError>>) => RestClientBuilder<TResponse, TError, TRestClient>;
	clone: (...params: Parameters<CloneOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError, TRestClient>;
	merge: (...params: Parameters<MergeOrAssignOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError, TRestClient>;
	assign: (...params: Parameters<MergeOrAssignOptions<TResponse, TError>>) => RestClientBuilder<TResponse, TError, TRestClient>;

	constructor(options?: Partial<IRestOptionsGlobals<TResponse, TError>>, factoryClass?: TRestClient) {
		this._options = options ?? {};
		this._restFactory = factoryClass ?? RestClient as any;
		const restOpts = useRestClientBuilder<TResponse, TError>(this._options);
		this.checkAndRestoreDefaults = restOpts.checkAndRestoreDefaults;
		this.current = () => {
			restOpts.cloneOptions();
			return this;
		};
		this.get = (...args) => restOpts.getOption(...args);
		this.set = (...args) => {
			restOpts.setOption(...args);
			this._options = restOpts.cloneOptions();
			return this;
		};
		this.unset = (...args) => {
			restOpts.unsetOption(...args);
			this._options = restOpts.cloneOptions();
			return this;
		};
		this.clone = (...args) => {
			const options = restOpts.cloneOptions(...args);
			return new RestClientBuilder(options, this._restFactory);
		};
		this.merge = (...args) => {
			restOpts.mergeOptions(...args);
			this._options = restOpts.cloneOptions();
			return this;
		};
		this.assign = (...args) => {
			restOpts.mergeOptions(...args);
			this._options = restOpts.cloneOptions();
			return this;
		};
	}
	public setFactory<TRestClient extends new (...args: any) => any>(factoryClass: TRestClient) {
		this._restFactory = factoryClass as any;
		return this;
	}
	public createRestClient<T extends new (...args: any) => any>(...args: ConstructorParameters<T>): TRestClient {
		const inst = new (this._restFactory as any)(args) as RestClient;
		inst.options.assign(this._options);
		return inst as any;
	}
}