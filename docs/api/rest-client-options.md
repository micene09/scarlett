# Rest Client options

To init a rest client you need a base object describing behaviors and details, that every subsequent request will inherits:

```typescript
const client = createRestClient({ // << the options object
	host: "https://server.com",
	responseType: "text"
})
```

There are basically two kind of options:
* Fetch Standards options
* Built-in options

## Fetch Standards options

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

## Built-in options

### host

`string`

Defaults to `localhost.href`.

### basePath

`string`

The base path to use on every request, defaults to `/`, combined with the `host` option.

### responseType

`HttpResponseFormat`

This property will lead the response body parsing, to get the proper output type. For example, with `json` as responseType you don't need to `JSON.parse()` on `response.data`.

It can be defined as:
1. `HttpResponseFormatType` typed value: `undefined` (default), `null`, `json`, `text`, `blob`, `arrayBuffer`, `formData`
2. A sync method returning a `HttpResponseFormatType`
   ```typescript
   (request: IRequest, fetchResponse: Response | null) => HttpResponseFormatType
   ```
3. An async method resolving a `HttpResponseFormatType`
   ```typescript
   (request: IRequest, fetchResponse: Response | null) => Promise<HttpResponseFormatType>
   ```

When the value resolved is `undefined` or `null`, the response's body will not be parsed.

### body

`Object` (ex: `{ [key: string]: any }`) | `string` | `ArrayBuffer` | `ArrayBufferView` | `Blob` | `File` | `FormData` | `undefined`

Optional request body content, if the method is `GET`, this value will be set to `undefined`.

### query

`{ [key: string]: any }`

Optional key-value pair, this will be converted (and appended) to the request URI.

### queryParamsTransformer

`IQueryParamTransformer`

Let's suppose you have a complex key-value pair, in which every value needs to be converted using a custom logic.

You can do this using this as a callback having the following definition:

```typescript
interface IQueryParamTransformer {
	(key: string, value: any, query: any): string
}
```

...it needs to have back the `string` version of your custom type parameter.

Check out `tests/features.test.ts` to see it in action!

### queryParamsIncludeEmpty

`boolean`

If true, it will include falsy values as empty, example: `/example/?a=&b=`.

Defaults to `false`.

### cacheInMemory

`boolean`

If true, it will enable an internal, [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based, cache system.

Every entry for this cache, will use a compound-key containing the `cacheKey`, if provided.

See the [cache section](/api/in-memory-cache) for more details.

Defaults to `false`.

### cacheExpireIn

`number` | `undefined`

Define the cache duration for a response in milliseconds.

Defaults to `undefined`.

### cacheKey

`string`

An optional alias reference to the current request, useful if you are using `cacheInMemory` parameter as true.

Keep in mind that when the in-memory cache is activated, a base cacheKey will be evaluated and used to get/set internal operations on cache store. The base cacheKey is basically a compound key having the following serialized info:
* Absolute url
* HTTP Method
* Serialized inputs (for POST and PUT requests)

Defining this parameter doesn't override the entire overall base cacheKey, your cacheKey string will be prepended to the base one, in this way scarlett grants cache items isolation per request.

Defaults to `""`.

### throw

`boolean`

As standard behavior of fetch, every request will never throw error. But sometimes, in very large applications, you need a centralized API error handler.

If true, when the standard [fetch -> Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is false the API will throw an error.

The error object will be an instance of [RestError](#RestError) class.

Defaults to `false`.

### throwExcluding

`IResponseFilter[]`

Even when you throwing error on failed requests, sometimes you may need to filter this errors and react properly without throwing.

You can do this providing an array of `IResponseFilter`.

A filter can be defined as object:

```typescript
await client.get("/example", {
	throwExcluding: [{ // every prop here is optional
		path: "/example", // filter based on url path
		method: "GET",
		statusCode: 404,
		errorCode: "Timeout" // the internal error code
	}]
})
```

...or as sync/async method returning `true` to prevent the `throw`:

```typescript
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

If a failed request match one of the objects provided, your rest client instance will not throw any error.

You will find the matched filter on [Response Object](/api/response-object).throwFilter property.

Setting throwExcluding will also set `throw` option to `true`.

### overrideStrategy

`merge` | `assign`

On every request method, you can override any option just providing it as parameter.

Internally, the library supports the following strategies to update the request options:

* *merge* (default), every simple primitive type (like strings, and numbers) will be overwritten, while Headers, Object-like and Array-like options will be merged.
* *assign*, every value will be overwritten using [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

Note that this option cannot be overridden on a request method, to do this you need to set it globally using the [RestClientBuilder API](#RestClientBuilder).

### onRequest

`(request: IRequest): void | Promise`

Global handler, running on your `RestClient`'s instance context, called at every request. You can edit the outgoing request options, just modify the `request` object provided as first argument.

If the return value is a `Promise`'s instance, the request will `await` for it before starting.

### onResponse

`(response: IResponse): void`

Global handler, running on your `RestClient`'s instance context, called at every successful response received.
Keep in mind that, if you set the `throw` option as true, or any of your `throwExcluding` filters doesn't match, this handler will never be called.

### onError

`(error: RestError, response: IResponse): void`

Global handler, running on your `RestClient`'s instance context, called every time an error was received by a request. This callback will not be invoked if it is filtered by `throwExcluding` option.