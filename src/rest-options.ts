import { IRequestOptions, HttpResponseFormat, IResponseFilter, IQueryParamTransformer } from './interfaces';
export class RestOptions implements IRequestOptions {
	query?: { [key: string]: any };
	queryParamsTransormer?: IQueryParamTransformer;
	queryParamsIncludeEmpty?: boolean;
	host?: string;
	basePath?: string;
	responseType?: HttpResponseFormat;
	body?: ArrayBuffer | ArrayBufferView | Blob | File | string | URLSearchParams | FormData | {
		[key: string]: any;
	};
	abortController?: AbortController;
	keepalive?: boolean;
	timeout?: number;
	headers?: Headers;
	useCache?: boolean;
	cacheKey?: string;
	throw?: boolean;
	throwExcluding?: IResponseFilter<any>[];
	constructor(opts: IRequestOptions) {
		this.assign(opts, this);
	}
	private assign(source: IRequestOptions, target: any) {
		Object.assign(target, source);
	}
	public overrideWith(opts?: IRequestOptions | undefined) {
		if (!opts) return;
		this.assign(opts, this);
	}
}
