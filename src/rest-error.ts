import { HTTPStatusCode } from ".";
import { IRequest, IResponseFilter } from "./interfaces";

export default class RestError<TError> extends Error {
	isRestError = true;
	request?: IRequest;
	fetchResponse?: Response;
	statusCode: HTTPStatusCode | "timeout" | "body-parse-error" | null = null;
	data?: TError;
	constructor(statusCode: HTTPStatusCode | "timeout" | "body-parse-error", message: string) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
	}
	throwFilterMatch(flt: IResponseFilter<TError>): boolean {
		if (!this.request || !this.statusCode) return false;
		return (!flt.path || this.request.url.href.indexOf(flt.path) > -1)
			&& (!flt.method || flt.method.toLowerCase() === this.request.method.toLowerCase())
			&& (!flt.statusCode || Boolean(flt.statusCode === this.statusCode));
	}
}