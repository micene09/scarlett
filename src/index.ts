import RestClient from './rest-client';
import RestError from './rest-error';
import { RestOptions } from './rest-options';

export default RestClient;
export { RestOptions, RestError };
export { IRestOptions as IRequestOptions, IRestOptionsQuery as IRequestQueryOptions, IResponse, IRequest, IResponseFilter, HttpMethod, HTTPStatusCode } from './interfaces';