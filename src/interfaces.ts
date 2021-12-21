import RestError from "./rest-error";

export interface IKeyValue {
	[key: string]: any
}
export interface IRestOptionsQuery {
	query: IKeyValue;
	queryParamsTransormer: IQueryParamTransformer;
	queryParamsIncludeEmpty: boolean;
}
export interface IRestOptionsNative {
	abortController: AbortController;
	credentials: RequestCredentials;
	mode: RequestMode;
	keepalive: boolean;
	headers: Headers;
	cache: RequestCache;
	redirect: RequestRedirect;
	referrer: string;
	referrerPolicy: ReferrerPolicy;
}
export interface IRestOptionsProtected {
	overrideStrategy: LocalOverrideStrategy;
}
export interface IRestOptions extends IRestOptionsQuery, IRestOptionsNative {
	host: string;
	basePath: string;
	responseType: HttpResponseFormat;
	body: | ArrayBuffer | ArrayBufferView | Blob | File | string | URLSearchParams | FormData | IKeyValue;
	timeout: number;
	internalCache: boolean;
	cacheKey: string;
	throw: boolean;
	throwExcluding: IResponseFilter[];
	onRequest(request: IRequest): void | Promise<void>
	onResponse<TResponse = any, TError = any>(response: IResponse<TResponse, TError>): void
	onError<TError = any, TResponse = any>(error: RestError<TError>, response: TResponse): void
}
export interface IRestOptionsGlobals extends IRestOptions, IRestOptionsProtected {}
export type LocalOverrideStrategy = | "merge" | "assign";
export interface IRequest {
	options: Partial<IRestOptions>;
	url: URL
	method: HttpMethod
	body: any
}
export interface IResponse<TResponse, TError = any> {
	fetchResponse: Response | null;
	request: IRequest;
	error?: RestError<TError>;
	status: HTTPStatusCode;
	headers?: Headers;
	data: TResponse | null;
	throwFilter?: IResponseFilter;
	repeat: IRepeat<TResponse, TError>;
}
export interface IRepeat<TResponse, TError = any> {
	(method: HttpMethod, requestOptions?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>
}
export interface IRepeat<TResponse, TError = any> {
	(requestOptions?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>
}
interface IResponseFilterObject {
	path?: string;
	method?: HttpMethod;
	statusCode?: HTTPStatusCode;
	errorCode?: InternalErrorCode;
}
interface IResponseFilterHook {
	<T = any>(restError: RestError<T>): boolean
}
interface IResponseFilterHookAsync {
	<T = any>(restError: RestError<T>): Promise<boolean>
}
export type IResponseFilter = IResponseFilterHook | IResponseFilterHookAsync | IResponseFilterObject;
export type InternalErrorCode = "Timeout" | "BodyParse" | "UrlParameter";
export interface IQueryParamTransformer {
	(key: string, value: any, query: any): string
}
export interface IResponseAny {
	<TData = any, TError = any>(prom: Promise<any>): Promise<[TData | null, TError | null]>
}
export interface IResponseAny {
	<TResponse>(prom: Promise<TResponse>): Promise<[TResponse | null, Error | RestError<any> | null]>
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