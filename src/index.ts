import createRestClient from './rest-client';
import RestClient from './rest-client/index.class';

import RestError from './rest-error';
import RestOptions from './rest-options';

export default RestClient;
export { RestClient, createRestClient }
export { RestOptions, RestError };
export type {
	IResponse, IRequest,
	IRestOptions, IRestOptionsQuery, IRestOptionsProtected, IRestOptionsGlobals, IRestOptionsNative,
	IQueryParamTransformer, LocalOverrideStrategy, IResponseFilter, InternalErrorCode,
	HttpResponseFormat, HttpResponseFormatType, HttpResponseFormatResult,
	HttpMethod, HTTPStatusCode } from './interfaces';