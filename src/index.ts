import createRestClient from './rest-client/index';
import RestClient from './rest-client/index.class';

import useRestClientBuilder from './rest-client-builder/index';
import RestClientBuilder from './rest-client-builder/index.class';

import RestError from './rest-error';

export { RestClient, createRestClient }
export { useRestClientBuilder, RestClientBuilder, RestError };
export { RestClientBuilder as RestOptions };
export { CacheKey, CacheClear, CacheClearByKey, CacheSet, CacheGet,
	OptionsOverride,
	RequestMethod,
	RequestMethodFull } from "./rest-client/index"
export type {
	IResponse, IRequest,
	IRestOptions, IRestOptionsQuery, IRestOptionsProtected, IRestOptionsGlobals, IRestOptionsNative,
	IQueryParamTransformer, LocalOverrideStrategy, IResponseFilter, InternalErrorCode,
	HttpResponseFormat, HttpResponseFormatType, HttpResponseFormatResult,
	HttpMethod, HTTPStatusCode, AllowedNativeOptions } from './interfaces';