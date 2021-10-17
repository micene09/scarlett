import { IResponse, IRequest, IResponseFilter } from "./interfaces";

export default class RestError<TError> extends Error {
	isRestError = true;
	request?: IRequest;
	statusCode: string | number = "";
	data?: TError;
	constructor(statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
		this.message = `[${this.statusCode}] ${message}`;
	}
	setRequest(request: IRequest) {
		this.request = request;
		return this;
	}
	setResponse(response: IResponse<any>) {
		this.data = response.data ? { ...response.data } : null;
		return this;
	}
	throwFilterMatch(flt: IResponseFilter<TError>): boolean {
		if (!this.request || !this.statusCode) return false;
		return (!flt.path || this.request.url.href.indexOf(flt.path) > -1)
			&& (!flt.method || flt.method.toLowerCase() === this.request.method.toLowerCase())
			&& (!flt.statusCode || Boolean(flt.statusCode === this.statusCode));
	}
}