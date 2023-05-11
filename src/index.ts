import RestClient from './rest-client';
import RestError from './rest-error';
import RestOptions from './rest-options';

export default RestClient;
export { RestOptions, RestError };
export type {
	IResponse, IRequest,
	IRestOptions, IRestOptionsQuery, IRestOptionsProtected, IRestOptionsGlobals, IRestOptionsNative,
	IQueryParamTransformer, LocalOverrideStrategy, IResponseFilter, InternalErrorCode,
	HttpResponseFormat, HttpResponseFormatType, HttpResponseFormatResult,
	HttpMethod, HTTPStatusCode } from './interfaces';