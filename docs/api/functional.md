# Functional API

TODO: finish functional section

## createRestClient

`(options) => useRestClient`

The initiator function, returning the `useRestClient` function.

For more details about the options object, visit the [Rest Client Options](/api/rest-client-options) section.

## useRestClient

```ts
() => {
	// Request methods
	request, get, del, post, patch, put
	// Cache methods
	cacheKey, cacheClear, cacheClearByKey, cacheSet, cacheGet,
	// Client options utils
	optionsOverride, getOption, setOption, currentOptions, cloneOptions,
}
```

Returning a destructible object, containing rest methods and utilities.

### request

```ts
<TResponse, TError>(method: HttpMethod, path?: string, requestOptions?: Partial<Options>) => Promise<IResponse<TResponse, TError>>
```

*Parameters*:
* HttpMethod (`GET` | `DELETE` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH` | `LINK`)
* path *(string)*, the request path relative to `host`+`basePath`
* requestOptions *(Options | undefined)*, local request options that will override the global options provided via constructor.

*Returns* `Promise<IResponse<TResponse, TError>>`, where:
 * `TResponse` is the `response.data` type (typescript intellisense)
 * `TError` is the **optional** `response.error.data` type

For more details about the response object, visit the [Response Object](/api/response-object) section.

### get / del / post / patch / put

```ts
<TResponse, TError>(path?: string, requestOptions?: Partial<Options>) => Promise<IResponse<TResponse, TError>>
```

### cacheKey

```ts
(url: URL, method: HttpMethod | "*", customKey?: string) => string
```

Evaluate an internal cache key, giving a `URL` instance, `HTTP` method and a key prefix as third parameter (if omitted, inherits from context's options).

### cacheClear

```ts
() => void
```

Clear the entire internal cache stored on the client's context.

### cacheClearByKey

```ts
(cacheKey: string) => void
```

Clear any cache entry store using the provided `cacheKey`.

### cacheGet

```ts
(url: URL, method: HttpMethod | "*", customKey?: string) => {
	response: IResponse,
	expireAt: Date | null
} | undefined
```

Return a cache entry if exits, if the third parameter is omitted will be inherited from client's context.

### cacheSet

```ts
(response: IResponse, customKey?: string, expireIn?: number) => void
```

Set a cache entry using the response object, a custom key to override (if omitted will inherit from client's context) and a expiration in milliseconds (if omitted, no expiration on the entry)

## restClientBuilder