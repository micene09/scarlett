import { HTTPStatusCode } from ".";
import { InternalErrorCode, IRequest, IResponseFilter } from "./interfaces";

export default class RestError<TError> extends Error {
	isRestError = true;
	request?: IRequest;
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
	throwFilterMatch(flt: IResponseFilter): boolean {
		if (flt.method && !this.request?.method) return false;
		if (flt.statusCode && !this.statusCode) return false;
		if (flt.errorCode && !this.code) return false;
		return (!flt.path || (this.request?.url?.href ?? "").indexOf(flt.path) > -1)
			&& (!flt.method || flt.method.toLowerCase() === this.request?.method.toLowerCase())
			&& (!flt.statusCode || Boolean(flt.statusCode === this.statusCode))
			&& (!flt.errorCode || Boolean(flt.errorCode === this.code));
	}
}