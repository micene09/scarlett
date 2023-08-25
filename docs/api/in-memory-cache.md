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

:::tip
Once enabled, it can works together with the Standard Fetch API's cache mechanism ([link](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)). Keep in mind that Standard Cache mechanism will run only if the in memory cache haven't any cached record at the check time, in other words, the built-in cache system has the priority because is executed first.
:::

Here is the full list properties that you can use in the rest options object:

## cacheKey

```ts
(url: URL, method: HttpMethod | "*" = "*", customKey?: string) => string
```

Evaluate the unique cache-key for a particular request, having the provided `url`, (optional) `method`, combining this couple with the `cacheKey` option.

Providing the third parameter `customKey`, the string evaluated will change accordingly.

This method is used internally to complete common cache's task operations like set, get and clear; see the next methods to understand better.

## cacheSet

```ts
(response: IResponse, customKey?: string) => void
```

Store the response object provided to the internal `RestClient` instance's cache.

## cacheGet

```ts
(url: URL, method: HttpMethod | "*" = "*", customKey?: string) => {
	response: IResponse<TResponse, TError>,
	expireAt: Date | null
} | undefined
```

Retrieve the response object, if exists, from the internal `RestClient` instance's cache.

## cacheExpireIn

```ts
type cacheExpireIn = number
```

Set an expire time in milliseconds for the entry.

## cacheClearByKey

```ts
(cacheKey: string) => void
```

Clears every cache entry in a `RestClient` instance context, matching with the provided `cacheKey`.

## cacheClear

```ts
() => void
```

Clears every cache entry in a `RestClient` instance context.
