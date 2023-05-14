import createRestClient from './rest-client';
import RestClient from './rest-client/index.class';

import useRestOptions from './rest-options';
import RestOptions from './rest-options/index.class';

import RestError from './rest-error';

export default RestClient;
export { RestClient, createRestClient }
export { useRestOptions, RestOptions, RestError };
export type {
	IResponse, IRequest,
	IRestOptions, IRestOptionsQuery, IRestOptionsProtected, IRestOptionsGlobals, IRestOptionsNative,
	IQueryParamTransformer, LocalOverrideStrategy, IResponseFilter, InternalErrorCode,
	HttpResponseFormat, HttpResponseFormatType, HttpResponseFormatResult,
	HttpMethod, HTTPStatusCode } from './interfaces';