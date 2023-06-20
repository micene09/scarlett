# Built-in Cache System

A [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based cache, disabled by default and triggered by the `cacheInMemory` flag.

If, for any reason, you want to avoid the complexity of the standard [Request.cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache), this is the right way to go.

The `IRequestOptions.cacheKey` is the default used to store response objects, it can be...

 * provided during the `RestClient` initialization
 * updated via `RestClient.options` property (`RestClientBuilder` methods)
 * overridden on any local `request` method (or any equivalent http shortcut)

See [Advanced usage](/guide/functional#in-memory-cache-system) to get an example.

This internal cache system will never infer the native [Request.cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache) property's behavior.

Enabling it, if a cached response for a particular request exists, the library will avoid the fetch call to resolve the `Promise` immediately.

Here is the full list properties that you can use as rest options:

## cacheKey

`(url: URL, method: HttpMethod | "*" = "*", customKey?: string)`

Evaluate the unique cache-key for a particular request, having the provided `url`, (optional) `method`, combining this couple with the `cacheKey` option.

Providing the third parameter `customKey`, the string evaluated will change accordingly.

This method is used internally to complete common cache's task operations like set, get and clear; see the next methods to understand better.

## cacheSet

`(response: IResponse, customKey?: string)`

Store the response object provided to the internal `RestClient` instance's cache.

## cacheGet

`(url: URL, method: HttpMethod | "*" = "*", customKey?: string)`

Retrieve the response object, if exists, from the internal `RestClient` instance's cache.

## cacheClearByKey

`(cacheKey: string)`

Clears every cache entry in a `RestClient` instance context, matching with the provided `cacheKey`.

## cacheClear

`(): void`

Clears every cache entry in a `RestClient` instance context.
