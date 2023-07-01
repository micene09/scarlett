# Functional API

## createRestClient

`(options: Options) => useRestClient`

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
	optionsOverride, getOption, setOption, cloneOptions,
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
* requestOptions *(Options | undefined)*, local request options that will override the global options provided via `createRestClient`.

*Returns* `Promise<IResponse<TResponse, TError>>`, where:
 * `TResponse` is the `response.data` type (typescript intellisense)
 * `TError` is the **optional** `response.error.data` type

For more details about the response object, visit the [Response Object](/api/response-object) section.

### get / del / post / patch / put

```ts
<TResponse, TError>(path?: string, requestOptions?: Partial<Options>) => Promise<IResponse<TResponse, TError>>
```

Like the previous `request` method, local request options that will override the global options provided via `createRestClient`.

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

### optionsOverride

```ts
<TResponse = any, TError = any>(overrides?: Partial<IRestOptions<TResponse, TError>>, base?: Partial<IRestOptions<TResponse, TError>>) => Partial<IRestOptions<TResponse, TError>>
```

Overrides rest client global options using provided `overrides` object as first parameter. It will override just the `base` when provided. Any override done by this method will follow behaviors from [overrideStrategy](/api/rest-client-options#overridestrategy).

Returns a copy of the override result.

### getOption

```ts
(key: K) => Options[K]
```

Returns the current value of the provided option `key`.

### setOption

```ts
(key: K, value: Options[K]) => void
```

Sets the `value` provided for the option `key`.

### cloneOptions

```ts
() => Options
```

Returns a copy of the current global options.

## restClientBuilder

TODO: finish functional section