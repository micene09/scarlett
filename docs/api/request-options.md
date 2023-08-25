# Request Options

To init a rest client you need a base object describing behaviors and details, that every subsequent request will inherits:

```ts
// Functional API
const client = createRestClient({
	host: "https://server.com",
	responseType: "text"
})

// Class API
const client = new RestClient({
	host: "https://server.com",
	responseType: "text"
})
```

Options provided at this level are considered as **Global Layer** options.

Every option can also be overridden at the request method's level:

```ts
const response = client.get("/path", { // << the options object
	responseType: "json"
})
```

At this level options are considered **Local Layer** options.

:::tip
 You should play with [overrideStrategy](/api/request-options#overridestrategy) to better understand the magic behind overrides.
:::

## Standards options

The following native properties from original [Fetch's Request Object](https://developer.mozilla.org/en-US/docs/Web/API/Request) are supported and usable as options object:
 * `abortController`
 * `credentials`
 * `mode`
 * `keepalive`
 * `headers`
 * `cache`
 * `redirect`
 * `referrer`
 * `referrerPolicy`

Refer to the official documentation about how they works, continue reading about Scarlett's built-in options.

## host

```ts
type host = string
```

Defaults to `localhost.href`.

## basePath

```ts
type basePath = string
```

The base path to use on every request, defaults to `/`, combined with the `host` option.

## responseType

```ts
type responseTypeRaw = "json" | "text" | "blob" | "arrayBuffer" | "formData"
type responseType = responseTypeRaw
	| (request: IRequest, fetchResponse: Response | null) => responseTypeRaw
	| (request: IRequest, fetchResponse: Response | null) => Promise<responseTypeRaw>
	| undefined | null;
```

This property will lead the response body parsing, to get the proper output type. For example, with `json` as responseType you don't need to `JSON.parse()` on `response.data`.

It can be defined as:
1. `responseTypeRaw`
2. A sync method returning a `responseTypeRaw`
   ```ts
   (request: IRequest, fetchResponse: Response | null) => HttpResponseFormatType
   ```
3. An async method resolving a `responseTypeRaw`
   ```ts
   (request: IRequest, fetchResponse: Response | null) => Promise<HttpResponseFormatType>
   ```

When the value resolved is `undefined` or `null`, the response's body will not be parsed.

Defaults to `undefined`.

:::tip
 Use the sync/async handler to handle complex business logics affecting the response body type.
:::

## body

```ts
type Body = Record<string, any> | string | ArrayBuffer | ArrayBufferView | Blob | File | FormData | undefined
```

Optional request body content, if the method is `GET`, this value will be set to `undefined`.

## query

```ts
type query = Record<string, any>
```

Optional key-value pair, this will be converted (and appended) to the request URI.

## queryParamsTransformer

```ts
interface IQueryParamTransformer {
	(key: string, value: any, query: any): string
}
```

Let's suppose you have a complex key-value pair, in which every value needs to be converted using a custom logic. In this case you can use this handler to convert your parameters to `string`.

## queryParamsIncludeEmpty

```ts
type queryParamsIncludeEmpty = boolean
```

If true, it will include falsy values as empty, example: `/example/?a=&b=`.

Defaults to `false`.

## cacheInMemory

```ts
type cacheInMemory = boolean
```

If true, it will enable an internal, [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based, cache system. Every entry for this cache, will use a compound-key containing the `cacheKey`, if provided. See the [cache section](/api/in-memory-cache) for more details.

Defaults to `false`.

:::tip
Once enabled, it can works together with the Standard Fetch API's cache mechanism ([link](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)). Keep in mind that if the Standard Cache mechanism will run only if the in memory cache haven't any cached record, in other words, the built-in cache system has the priority.
:::

## cacheExpireIn

```ts
type cacheExpireIn = number | undefined
```

Define the cache entry expiry in milliseconds.

Defaults to `undefined`, meaning that will never expire.

## cacheKey

```ts
type cacheKey = string
```

An optional alias reference to the current request, useful if you are using `cacheInMemory` parameter as true.

Keep in mind that when the in-memory cache is activated, a base cacheKey will be evaluated and used to get/set internal operations on cache store. The base cacheKey is basically a compound key having the following serialized info:
* Absolute url
* HTTP Method
* Serialized inputs (for POST and PUT requests)

Defining this parameter doesn't override the entire overall base cacheKey, your cacheKey string will be prepended to the base one, in this way Scarlett grants cache items isolation per request.

Defaults to `""`.

## throw

```ts
type throwOption = boolean
```

As standard behavior of fetch, every request will never throw error. But sometimes, in very large applications, you need a centralized API error handler.
If `true`, when the standard [fetch -> Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is false the API will throw an error.
The error object will be an instance of [RestError](#RestError) class.

Defaults to `false`.

## throwExcluding

```ts
type ResponseFilter = {
	path?: string;
	method?: HttpMethod;
	statusCode?: HTTPStatusCode;
	errorCode?: InternalErrorCode;
} || {
	(restError: RestError<TError>): boolean
} || {
	(restError: RestError<TError>): Promise<boolean>
}
```

Even when you throwing error on failed requests, sometimes you may need to filter this errors and react properly without throwing.

You can do this providing an array of `ResponseFilter`.

A filter can be defined as object (every prop is optional):

```ts
await client.get("/example", {
	throwExcluding: [{
		path: "/example",    // the url path to exclude
		method: "GET",       // the method to exclude
		statusCode: 404,     // the status code to exclude
		errorCode: "Timeout" // the internal error code to exclude
	}]
})
```

The property `errorCode` differs from `statusCode`, because it is related to library's internal mechanisms errors. The type definition is:

```ts
type InternalErrorCode = "Timeout" | "BodyParse" | "UrlParameter";
```
1. Timeout, when a request fails to a timeout
2. BodyParse, when the body parse fails with the given `responseType`
3. UrlParameter, when something gets wrong during set or get operations on url parameters

You can even declare it as sync/async method returning `true` to prevent the `throw`:

```ts
await client.get("/example", {
	throwExcluding: [
		async (err) => {
			let willPreventError = true;
			// ...awaitable methods here...
			return willPreventError;
		}
	]
})
```

If a failed request match one of the items provided here, your rest client instance will not throw any error.

You will find the matched filter on [response.throwFilter](/api/response-object#throwfilter) property.

Setting `throwExcluding` will also set implicitly set `throw` option to `true`.

## overrideStrategy

```ts
type overrideStrategy = "merge" | "assign"
```

Set the override strategy used when overriding Global Layer options in a rest method (Local Layer).

Available strategies:
* *merge* (default), every simple primitive type (like strings, and numbers) will be overwritten, while Headers, Object-like and Array-like options will be merged.
* *assign*, every value will be overwritten using [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

## onRequest

```ts
type onRequest = (request: IRequest) => void | Promise
```

Global handler, running on your rest client context, called at every request. You can edit the outgoing request options just modifying the `request` object provided as first argument. If the return value is a `Promise`'s instance, the request will `await` for it before starting.

## onResponse

```ts
type onResponse = (response: IResponse) => void
```

Global handler, running on your rest client context, called at every successful response received. Keep in mind that, if you set the `throw` option as true, or any of your `throwExcluding` filters doesn't match, this handler will never be called.

## onError

```ts
type onError = (error: RestError, response: IResponse) => void
```

Global handler, running on your rest-client context, called every time an error was received by a request. This callback will not be invoked if it is filtered by `throwExcluding` option.