import type { IRestOptions, IRestOptionsGlobals } from '../interfaces';
import type { CheckAndRestoreDefault, MergeOrAssignOptions, GetOption } from '.';
import useRestClientBuilder from '.';
import RestClient from '../rest-client/index.class';

type SetOption<TResponse, TError, TRestClient extends RestClient = RestClient> = <O extends IRestOptionsGlobals<TResponse, TError>, K extends keyof O, V extends O[K]>(key: K, val: V) => RestClientBuilder<TResponse, TError, TRestClient>;
type UnsetOption<TResponse, TError, TRestClient extends RestClient = RestClient> = <K extends keyof IRestOptions<TResponse, TError>>(key: K) => RestClientBuilder<TResponse, TError, TRestClient>;
type CloneOptions<TResponse, TError, TRestClient extends RestClient = RestClient> = () => RestClientBuilder<TResponse, TError, TRestClient>


export default class RestClientBuilder<TResponse = any, TError = any, TRestClient extends RestClient = RestClient> {
	private _options: Partial<IRestOptionsGlobals<TResponse, TError>>;
	private _restFactory: TRestClient;
	checkAndRestoreDefaults: CheckAndRestoreDefault;
	current: (...params: Parameters<CloneOptions<TResponse, TError, TRestClient>>) => RestClientBuilder<TResponse, TError, TRestClient>;
	get: GetOption<TResponse, TError>;
	set: SetOption<TResponse, TError, TRestClient>;
	unset: UnsetOption<TResponse, TError, TRestClient>;
	clone: CloneOptions<TResponse, TError, TRestClient>;
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
		this.set = (key, val) => {
			restOpts.setOption(key as any, val);
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