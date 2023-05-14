import { IRestOptionsGlobals } from "../interfaces";

export type CheckAndRestoreDefault = () => void

export default function useRestOptions<TResponse, TError>(options?: Partial<IRestOptionsGlobals<TResponse, TError>>) {
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

	return {
		checkAndRestoreDefaults
	}
}