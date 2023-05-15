import createRestClient from './rest-client';
import RestClient from './rest-client/index.class';

import useRestClientBuilder from './rest-client-builder';
import RestClientBuilder from './rest-client-builder/index.class';

import RestError from './rest-error';

export default RestClient;
export { RestClient, createRestClient }
export { useRestClientBuilder, RestClientBuilder, RestError };
export { RestClientBuilder as RestOptions };
export type {
	IResponse, IRequest,
	IRestOptions, IRestOptionsQuery, IRestOptionsProtected, IRestOptionsGlobals, IRestOptionsNative,
	IQueryParamTransformer, LocalOverrideStrategy, IResponseFilter, InternalErrorCode,
	HttpResponseFormat, HttpResponseFormatType, HttpResponseFormatResult,
	HttpMethod, HTTPStatusCode } from './interfaces';