import RestClient from './rest-client';
import RestError from './rest-error';
import { RestOptions } from './rest-options';

export default RestClient;
export { RestOptions, RestError };
export { IRequestOptions, IRequestQueryOptions, IResponse, IRequest, IResponseFilter, HttpMethod, HTTPStatusCode } from './interfaces';