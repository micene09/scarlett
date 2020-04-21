import RestError from "./rest-error";

export interface IRequestQueryOptions {
	query?: { [key: string]: any };
	queryParamsTransormer?: IQueryParamTransformer;
	queryParamsIncludeEmpty?: boolean;
}
export interface IRequestOptions extends IRequestQueryOptions {
	host?: string;
	basePath?: string;
	responseType?: HttpResponseFormat;
	body?: | ArrayBuffer | ArrayBufferView | Blob | File | string | URLSearchParams | FormData | { [key: string]: any };
	abortController?: AbortController;
	keepalive?: boolean;
	timeout?: number;
	headers?: Headers;
	useCache?: boolean;
	cacheKey?: string;
	throw?: boolean;
	throwExcluding?: IResponseFilter<any>[];
}
export interface IRequest {
	options: IRequestOptions;
	url: URL
	method: HttpMethod
	body: any
}
export interface IResponse<T> {
	fetchResponse?: Response;
	request: IRequest;
	error?: RestError<T>;
	status: HTTPStatusCode;
	headers?: Headers;
	data: T | null;
	throwFilter?: IResponseFilter<T>;
	repeat: IRepeat<T>;
}
export interface IRepeat<T> {
	(method?: HttpMethod, requestOptions?: IRequestOptions): Promise<IResponse<T>>
}
export interface IRepeat<T> {
	(requestOptions?: IRequestOptions): Promise<IResponse<T>>
}
export interface IResponseFilter<T> {
	path?: string;
	method?: HttpMethod;
	statusCode?: HTTPStatusCode;
	cback?: {
		(error: RestError<T>): void
	};
}
export interface IQueryParamTransformer {
	(key: string, value: any, query: any): string
}
export type HttpMethod = | 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'LINK';
export type HttpResponseFormat = | "json" | "text" | "blob" | "arrayBuffer" | "formData";
export const enum HTTPStatusCode {
	Continue = 100,
	SwitchingProtocols = 101,
	Processing = 102,
	EarlyHints = 103,

	/**
	 * All `1xx` status codes.
	 */
	InformationalResponses = Continue | SwitchingProtocols | Processing | EarlyHints,


	OK = 200,
	Created = 201,
	Accepted = 202,
	NonAuthoritativeInformation = 203,
	NoContent = 204,
	ResetContent = 205,
	PartialContent = 206,
	MultiStatus = 207,
	AlreadyReported = 208,
	IMUsed = 226,

	/**
	 * All `2xx` status codes.
	 */
	Success = (
		OK | Created | Accepted | NonAuthoritativeInformation | NoContent | ResetContent | PartialContent | MultiStatus |
		AlreadyReported | IMUsed
	),


	MultipleChoices = 300,
	MovedPermanently = 301,
	Found = 302,
	SeeOther = 303,
	NotModified = 304,
	UseProxy = 305,
	SwitchProxy = 306,
	TemporaryRedirect = 307,
	PermanentRedirect = 308,

	/**
	 * All `3xx` status codes.
	 */
	Redirection = (
		MultipleChoices | MovedPermanently | Found | SeeOther | NotModified | UseProxy | SwitchProxy | TemporaryRedirect |
		PermanentRedirect
	),


	BadRequest = 400,
	Unauthorized = 401,
	PaymentRequired = 402,
	Forbidden = 403,
	NotFound = 404,
	MethodNotAllowed = 405,
	NotAcceptable = 406,
	ProxyAuthenticationRequired = 407,
	RequestTimeout = 408,
	Conflict = 409,
	Gone = 410,
	LengthRequired = 411,
	PreconditionFailed = 412,
	PayloadTooLarge = 413,
	URITooLong = 414,
	UnsupportedMediaType = 415,
	RangeNotSatisfiable = 416,
	ExpectationFailed = 417,
	ImATeapot = 418,
	MisdirectedRequest = 421,
	UnprocessableEntity = 422,
	Locked = 423,
	FailedDependency = 424,
	UpgradeRequired = 426,
	PreconditionRequired = 428,
	TooManyRequests = 429,
	RequestHeaderFieldsTooLarge = 431,
	UnavailableForLegalReasons = 451,

	/**
	 * All `4xx` error codes.
	 */
	ClientErrors = (
		BadRequest | Unauthorized | PaymentRequired | Forbidden | NotFound | MethodNotAllowed | NotAcceptable |
		ProxyAuthenticationRequired | RequestTimeout | Conflict | Gone | LengthRequired | PreconditionFailed |
		PayloadTooLarge | URITooLong | UnsupportedMediaType | RangeNotSatisfiable | ExpectationFailed | ImATeapot |
		MisdirectedRequest | UnprocessableEntity | Locked | FailedDependency | UpgradeRequired | PreconditionRequired |
		TooManyRequests | RequestHeaderFieldsTooLarge | UnavailableForLegalReasons
	),


	InternalServerError = 500,
	NotImplemented = 501,
	BadGateway = 502,
	ServiceUnavailable = 503,
	GatewayTimeout = 504,
	HTTPVersionNotSupported = 505,
	VariantAlsoNegotiates = 506,
	InsufficientStorage = 507,
	LoopDetected = 508,
	NotExtended = 510,
	NetworkAuthenticationRequired = 511,

	/**
	 * All `5xx` error codes.
	 */
	ServerErrors = (
		InternalServerError | NotImplemented | BadGateway | ServiceUnavailable | GatewayTimeout | HTTPVersionNotSupported |
		VariantAlsoNegotiates | InsufficientStorage | LoopDetected | NotExtended | NetworkAuthenticationRequired
	)
}