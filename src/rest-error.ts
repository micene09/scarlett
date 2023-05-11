import type { HTTPStatusCode } from ".";
import type { InternalErrorCode, IRequest, IResponseFilter } from "./interfaces";

export default class RestError<TError = any, TResponse = any> extends Error {
	isRestError = true;
	request?: IRequest<TResponse, TError>;
	fetchResponse?: Response;
	code?: InternalErrorCode;
	statusCode?: HTTPStatusCode;
	data?: TError;
	constructor(message: string, statusCode?: HTTPStatusCode, code?: InternalErrorCode) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.message = message;
	}
	private async filterIsMatching(flt: IResponseFilter<TError>): Promise<boolean> {
		if (typeof flt === "function") {
			const result: boolean | Promise<boolean> = flt(this);
			if (result instanceof Promise)
				return await result;
			else return result;
		}
		else {
			if (flt.method && !this.request?.method) return false;
			if (flt.statusCode && !this.statusCode) return false;
			if (flt.errorCode && !this.code) return false;
			return (!flt.path || (this.request?.url?.href ?? "").indexOf(flt.path) > -1)
				&& (!flt.method || flt.method.toLowerCase() === this.request?.method.toLowerCase())
				&& (!flt.statusCode || Boolean(flt.statusCode === this.statusCode))
				&& (!flt.errorCode || Boolean(flt.errorCode === this.code));
		}
	}
	findMatch(filters: IResponseFilter<TError>[]) {
		return new Promise<IResponseFilter<TError> | undefined>(async resolve => {
			if (!filters || !filters.length) return resolve(undefined);
			const find = async (index: number = 0): Promise<IResponseFilter<TError> | undefined> => {
				if (!(index in filters)) return;
				const isMatching = await this.filterIsMatching(filters[index]);
				if (isMatching) return filters[index];
				else return await find(index + 1);
			}
			const filterFound = await find();
			resolve(filterFound);
		});
	}
}