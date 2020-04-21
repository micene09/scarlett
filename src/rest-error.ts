import { IResponse, IRequest, IResponseFilter } from "./interfaces";

export default class RestError<T> extends Error {
	isRestError = true;
	request?: IRequest = undefined;
	response?: IResponse<T> = undefined;
	code: string | number = "";
	constructor(errorCode: string | number, message: string) {
		super(message);
		this.code = errorCode;
		this.message = this.decorateErrorMessage(message);
	}
	private decorateErrorMessage(message: string) {
		return `[${this.code}] ${message}`;
	}
	consoleTable(...tabularData: any[]) {
		console.table(...tabularData);
		return this;
	}
	consoleWarn(message: string) {
		console.warn(this.decorateErrorMessage(message));
		return this;
	}
	consoleError(message: string) {
		console.error(this.decorateErrorMessage(message));
		return this;
	}
	setRequest(request: IRequest) {
		this.request = request;
		return this;
	}
	setResponse(response: IResponse<T>) {
		this.response = response;
		return this;
	}
	throwFilterMatch(flt: IResponseFilter<T>): boolean {
		if (!this.request || !this.response) return false;
		return (!flt.path || this.request.url.href.indexOf(flt.path) > -1)
			&& (!flt.method || flt.method.toLowerCase() === this.request.method.toLowerCase())
			&& (!flt.statusCode || Boolean(flt.statusCode === this.response.status));
	}
}