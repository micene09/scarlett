import type { IRestOptions, IRestOptionsGlobals } from "../interfaces";
import createRestClient from "../rest-client";
import { cloneObject, cloneValue, mergeObject } from "../utilities";

export type CheckAndRestoreDefault = () => void
export type CurrentOptions<TResponse, TError> = () => Partial<IRestOptions<TResponse, TError>>
export type GetOption<TResponse, TError> = <K extends keyof IRestOptionsGlobals<TResponse, TError>>(key: K) => IRestOptionsGlobals<TResponse, TError>[K];
export type SetOption<TResponse, TError> = <K extends keyof IRestOptionsGlobals<TResponse, TError>>(key: K, val: IRestOptionsGlobals<TResponse, TError>[K]) => void;
export type UnsetOption<TResponse, TError> = <K extends keyof IRestOptions<TResponse, TError>>(key: K) => void;
export type CloneOptions<TResponse, TError> = () => Partial<IRestOptions<TResponse, TError>>
export type MergeOrAssignOptions<TResponse, TError> = (obj?: Partial<IRestOptions<TResponse, TError>>) => void

export default function useRestClientBuilder<TResponse = any, TError = any>(options?: Partial<IRestOptionsGlobals<TResponse, TError>>) {
	const _options: Partial<IRestOptionsGlobals<TResponse, TError>> = options ?? {};
	const checkAndRestoreDefaults: CheckAndRestoreDefault = () => {
		if (!_options.overrideStrategy) _options.overrideStrategy = "merge";
		if (!_options.abortController) _options.abortController = new AbortController();
		if (!_options.credentials) _options.credentials = "same-origin";
		if (!_options.mode) _options.mode = "same-origin";
		if (!_options.cache) _options.cache = "default";
		if (!_options.redirect) _options.redirect = "follow";
		if (typeof _options.referrer == "undefined") _options.referrer = "";
		if (!_options.referrerPolicy) _options.referrerPolicy = "no-referrer-when-downgrade";
		if (typeof _options.timeout === "undefined") _options.timeout = 30000;
		if (typeof _options.throw === "undefined" && _options.throwExcluding && _options.throwExcluding.length)
			_options.throw = true;
	}
	const currentOptions: CurrentOptions<TResponse, TError> = () => cloneObject(_options);
	const createRestClientFromOptions = () => {
		const options = cloneOptions();
		return createRestClient(options);
	};
	const getOption: GetOption<TResponse, TError> = key => cloneValue(_options, key);
	const setOption: SetOption<TResponse, TError> = (key, val) => {
		_options[key] = val
	}
	const unsetOption: UnsetOption<TResponse, TError> = key => {
		delete _options[key];
		checkAndRestoreDefaults();
	}
	const cloneOptions: CloneOptions<TResponse, TError> = () => cloneObject(_options);
	const mergeOptions: MergeOrAssignOptions<TResponse, TError> = obj => mergeObject(_options, obj ?? {});
	const assignOptions: MergeOrAssignOptions<TResponse, TError> = obj => Object.assign(_options, obj ?? {});

	return {
		checkAndRestoreDefaults,
		currentOptions,
		createRestClient: createRestClientFromOptions,
		getOption,
		setOption,
		unsetOption,
		cloneOptions,
		mergeOptions,
		assignOptions
	}
}