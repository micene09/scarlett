<!-- omit in toc -->
<img src="https://github.com/Micene09/scarlett/blob/master/logo.jpg?raw=true">

> A strongly typed, Typescript powered, rest client library based on Fetch API.

<!-- omit in toc -->
## Key features

* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) based rest client
* Class based
* Strongly-typed (...thank you Typescript)
* Centralized config (via constructor)...with optional local overrides on http methods
* Advanced options override tecniques
* Rest Client Builder using RestOptions class
* Response body auto-parser, based on fetch's [Body](https://developer.mozilla.org/en-US/docs/Web/API/Body)
* Query-string utilities
* Built-in cache system (optional) to improve performance on recurring requests
* Response and Error object's intellisense, even with different interfaces
* Throw errors (optional) on request failures
* Catch/filters to handle expected errors even when throw gloval error is enabled
* Support for timeout
* Easy request repeater

<!-- omit in toc -->
## Summary

- [Installation](#installation)
	- [Required Polyfills](#required-polyfills)
	- [Different builds](#different-builds)
- [Basic Usage](#basic-usage)
- [Advanced usage](#advanced-usage)
	- [Extending](#extending)
	- [Importing extras](#importing-extras)
	- [RestOptions as rest client builder](#restoptions-as-rest-client-builder)
	- [Cache System](#cache-system)
- [API](#api)
	- [RestClient](#restclient)
		- [Instance](#instance)
		- [IRequestOptionsGlobals](#irequestoptionsglobals)
		- [request`<TResponse, TError = any>`()](#requesttresponse-terror--any)
		- [HttpMethod shortcut methods](#httpmethod-shortcut-methods)
		- [optionsOverride() method](#optionsoverride-method)
		- [Response Object](#response-object)
		- [Request (sent) Object](#request-sent-object)
		- [Built-in Cache System](#built-in-cache-system)
	- [RestOptions](#restoptions)
		- [Usage](#usage)
	- [RestError](#resterror)
- [Testing](#testing)
- [Inspired by...](#inspired-by)
- [Why this name?](#why-this-name)


## Installation

`npm i scarlett`

or

`yarn add scarlett`

### Required Polyfills

As `tsconfig.json`, sources are compiled to`ES2019`, keep in mind that **polyfills are not included**.

Scarlett will require the following APIs:

* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
* [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
* [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)
* [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
* [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

### Different builds

In the `lib/` folder of the package you will find different build files:

| Format                    | Filename              |
| ------------------------- | --------------------- |
| **ES Module** *(default)* | `index.js`            |
| **UMD**                   | `index.umd.js`        |
| **CommonJs**              | `index.common.js`     |
| **CommonJs ES3**          | `index.es3.common.js` |

## Basic Usage

1. Import the library:

	```typescript
	import RestClient from `scarlett`
	```

2. Create a rest client in stance providing an object of interface `IRequestOptions`.

	```typescript
	const client = new RestClient({
		host: `https://server.com`,
		responseType: `text`
	} /* >> IRequestOptions  */)
	const response = await client.get<string>(`path`)
	```

Every request method will return a `Promise<IResponse<TResponse>>`.

See the `tests/features.test.ts` to see it in action!

## Advanced usage

### Extending

You can extend the base class for your specific needs as follows:

```typescript
import RestClient from `scarlett`

class MyRestFactory1 extends RestClient {
	constructor() {
		super({
			host: "https://mybackend.com",
			basePath: "/my-controller"
		});
	}
	items() {
		return this.get("/action");
	}
	item(id: number) {
		return this.get(`/action/${id}`);
	}
}
```

You can even import types/interfaces exported from the module itself:

```typescript
import RestClient, { IRequestOptions } from `scarlett`

class MyRestFactory2 extends RestClient {
	constructor(options: IRequestOptions) {
		options.host = "https://mybackend.com";
		options.basePath = "/my-controller";
		options.throw = true;
		super(options);
	}
	// your methods here...
}
```

### Importing extras

```typescript
import {
	RestError, // Rest error utility class
    RestOptions, // Rest options

	// Utility types:
	HttpMethod,
	HTTPStatusCode,

	// Extra/Internal interfaces
	IRequestOptions,
	IRequestQueryOptions,
	IResponse,
	IRequest,
	IResponseFilter
    ...
} from `scarlett`
```

### RestOptions as rest client builder

```typescript
import { IRequestOptions } from `scarlett`

const builder = new RestOptions()
	.set("host", "https://localhost:5000")
	.set("basePath", "/api")
	.set("responseType", "json");

const rest1 = builder.createRestClient();

builder.clone().set("basePath", "/api-custom");
const rest2 = builder.createRestClient();
```

### Cache System

```typescript
import RestClient from `scarlett`

class AdvanceCache extends RestClient {
	constructor() {
		super({
			host: "https://mybackend.com",
			basePath: "/my-controller",
			internalCache: true,
			cacheKey: "my_key_all_requests"
		});
	}
	async genericCall() {
		return this.get(`/action1`);
	}
	async theCall() {
		const cacheKey = "a_special_key_for_this_method";
		return this.get(`/action2`, { cacheKey });
	}
}
```

## API

### RestClient

#### Instance

To create a new instance, you need to provide `IRequestOptionsGlobals` object as first parameter:

```typescript
const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
```

Any provided option will be considered the default for every subsequent request of the new instance.

Every option will be accessible/updatable using the public **options** property, an instance of [RestOptions](#RestOptions) class.

You can also override every options providing a `IRequestOptions` object as last parameter to the request method:

```typescript
const response = await client.get<any>(`/controller`, { responseType: `json` })
```

In the example above, the `responseType` option will be the override value just for that request, the global options will remain the same.

#### IRequestOptionsGlobals

The following native properties from original [Fetch's Request Object](https://developer.mozilla.org/en-US/docs/Web/API/Request) are supported:

 * `abortController`
 * `credentials`
 * `mode`
 * `keepalive`
 * `headers`
 * `cache`
 * `redirect`
 * `referrer`
 * `referrerPolicy`

One of the library's goals is to extend the native capabilities, so here is a list of additional properties:

**host (string)**

Defaults to localhost.href .

**basePath (string)**

The base path to use on every request, defaults to `/`, combined with the `host` option.

**responseType (HttpResponseFormat)**

One of the following: `json` (default), `text`, `blob`, `arrayBuffer`, `formData`.

This property will lead the response body parsing, to get the proper type output. For example, with `json` as responseType you don't need to `JSON.parse()` on `response.data`.

**body**

Optional request body content, aving one of the following instances: `ArrayBuffer`, `ArrayBufferView`, `Blob`, `File`, `string`, `URLSearchParams`, `FormData`, or just a key-value pair object (`{ [key: string]: any }`).

If the method is `GET`, this value will be set to undefined.

**query (`{ [key: string]: any }`)**

Optional key-value pair, this will be converted (and appended) to the request URI.

**queryParamsTransormer (IQueryParamTransformer)**

Let's suppose you have a complex key-value pair, in which every value needs to be converted using a custom logic.

You can do this using this as a callback having the following definition:

```typescript
interface IQueryParamTransformer {
	(key: string, value: any, query: any): string
}
```

...it need to have back the `string` version of your custom type parameter.

Have a look at `tests/features.test.ts` to see it in action!

**queryParamsIncludeEmpty (boolean)**

If true, it will include falsy values as empty, example:

```
/example/?a=&b=
```

Defaults to false.

**internalCache (boolean)**

If true, it will enable an internal, [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based, cache system.

Every entry for this cache, will use a compound-key containing the `cacheKey`, if provided.

See the [cache section](#built-in-cache-system) for more details.

Defaults to false.

**cacheKey (string)**

An optional alias reference to the current request, useful if you are using `internalCache` parameter as true.

Defaults to empty string.

**throw (boolean)**

As standard behavior of fetch, every request will never throw error. But sometimes, in very large applications, you need a centralized API error handler.

If true, when the standard [fetch -> Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is false the API will throw an error.

The error object will be an instance of [RestError](#RestError) class.

Defaults to false.

**throwExcluding (IResponseFilter[])**

Even when you throwing error on failed requests, sometimes you may need to filter this errors and react properly without throwing.

You can do this providing an array of `IResponseFilter`:

```typescript
interface IResponseFilter {
	path?: string
	method?: HttpMethod
	statusCode?: HTTPStatusCode
	onFilterMatch?: {
		(error: RestError): void
	}
}
```

If a failed request match one of the objects provided, your rest client instance will not throw any error.

You will find the matched filter on [Response Object](#response-object).throwFilter property.

Setting throwExcluding will also set `throw` option to `true`.

**overrideStrategy ("merge" | "assign")**

On every request method, you can override any option just providing it as parameter.

Internally, the library supports the following strategies to update the request options:

* *merge* (default), every simple primitive type (like strings, and numbers) will be overwritten, while Headers, Object-like and Array-like options will be merged.
* *assign*, every value will be overwritten using [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

Note that this option cannot be overridden on a request method, to do this you need to set it globally using the [RestOptions API](#RestOptions).

#### request`<TResponse, TError = any>`()

*Parameters*:

* HttpMethod (`GET` | `DELETE` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH` | `LINK`)
* path *(string)*, the request path relative to `host`+`basePath`
* requestOptions *(IRequestOptions | undefined)*, local request options that will override the global options provided via constructor.

*Returns* `Promise<IResponse<TResponse, TError>>`, where:
 * `TResponse` is the `response.data` type (typescript intellisense)
 * `TError` is the **optional** `response.error.data` type

*Usage*:

```typescript
const client = new RestClient({
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `text`
})
const response = await client.request<string>(`GET`, `/action`);
```

Note that the `path` property will be combined with `host` and `basePath`:

```typescript
const response = await client.request<string>(`GET`, `/action`);
console.log(response.request.url.href); // -> "https://server.com/controller/action"
```

#### HttpMethod shortcut methods

Every RestClient instance has all the http methods as a lower case named method as shortcut:

* *get`<T>`()*
* *post`<T>`()*
* *put`<T>`()*
* etc...

...having the following, simplified, parameters:

* path *(string)*
* requestOptions *(IRequestOptions | undefined)

Example:

```typescript
const response = await client.get<string>(`/action`);
```

Note: every shortcut method will internally call the `request()` method.

#### optionsOverride() method

Having the following definition:

```typescript
optionsOverride(overrides?: Partial<IRestOptions>, base?: Partial<IRestOptions>)
```
...will provide a copy of the `IRequestOptions` updated using the `overrideStrategy` option.

#### Response Object

Properties:

**fetchResponse ([Response](https://developer.mozilla.org/en-US/docs/Web/API/Response))**

**request ([Request (sent) Object](#request-sent-object))**

**error ([RestError](#resterror)`<TError>`)**

**status (exported enum => HTTPStatusCode)**

**headers ([Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers))**

**data (TResponse | null)**

The response body, leaded by `IRequestOptions.responseType` (for runtime type) and `TResponse` (for IDE type checking).

Example:

```typescript
interface IMyObject {
	test: string
}
const client = new RestClient({
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `json`
})
const response = await client.get<IMyObject>(`/action`);
```

The property `response.data` will infer the `IMyObject` interface.

**throwFilter (IResponseFilter)**

When a `IResponseFilter` match the response, this property will expose it.

**repeat()**

A usefull shortcut to repeat the request sent.

This method has the following interface:

```typescript
export interface IRepeat<TResponse, TError = any> {
	(method?: HttpMethod, requestOptions?: IRequestOptions): Promise<IResponse<TResponse, TError>>
}
export interface IRepeat<TResponse, TError = any> {
	(requestOptions?: IRequestOptions): Promise<IResponse<TResponse, TError>>
}
```
Every parameter is optional, you can override every option as usual.

*Usage*
```typescript
const first = await restClient.get<any>("/action");
const second = first.repeat();
```

#### Request (sent) Object

This simple interface is used to qualify the Response Object, here you will find details about the request executed to get the response.

**options (IRequestOptions)**

**url ([URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL))**, the URL instance evaluated using `host`, `basePath` and `path`.

**method (HttpMethod)**

**body**, the optional body used, tipically when HttpMethod is `PUT` or `POST`.

#### Built-in Cache System

A [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based cache, disabled by default and triggered by the `internalCache` flag.

This will improve performance in scenarios where your logic require recurring requests with the same response.

The `IRequestOptions.cacheKey` is the default used to store response objects, it can be...

 * provided during the `RestClient` initialization
 * updated via `RestClient.options` property (`RestOptions` methods)
 * overridden on any local `request` method (or the equivalent http shortcuts)

See [Advanced usage](#advanced-usage) to get an example.

This internal cache system will never infer the native [Request.cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache) property's behavior.

Enabling it, if a cached response for a particular request exists, the library will avoid the fetch call to resolve the `Promise` immediately.

All cache-related methods are `protected` and used internally on every request method if enabled.

Here is the full list:

**cacheKey(url: `URL`, method: `HttpMethod` | "*" = "*", customKey?: `string`)**

Evaluate the unique cache-key for a particular request, having the provided `url`, (optional) `method`, combining this couple with the `cacheKey` option.

Providing the third parameter `customKey`, the string evaluated will change accordingly.

This method, is used internally to complete common cache's taks operations like set, get and clear, see the next methods to understand better.

**cacheSet(response: `IResponse`, customKey?: `string`)**

Store the response object provided to the internal `RestClient` instance's cache.

**cacheGet<TResponse>(url: `URL`, method: `HttpMethod` | "*" = "*", customKey?: `string`)**

Retrieve the response object, if exists, from the internal `RestClient` instance's cache.

**cacheClearByKey(cacheKey: `string`)**

Clears every cache entry in a `RestClient` instance context, matching withe provided `cacheKey`.

**cacheClear()**

Clears every cache entry in a `RestClient` instance context.

### RestOptions

Every instance of RestClient will have a public property named **options**, this is just an instance of `RestOptions` class.

You can access and modify the global options of your rest client instance using his methods.

To create a new instance, just pass an `IRequestOptionsGlobals` object as first parameter:

```typescript
import { RestOptions } from "scarlett"

const opts = new RestOptions() {{
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `json`
}}
```

Here is the full list of available instance's methods:

**current()**

Will return a copy of the current `IRequestOptions`.

**get (option)**

Will return a copy of the option's value.

**set (option, newValue)**

To directly update an option (your Typescript's IDE plugin will warn you about type issues).

**unset(option)**

Will internally restore the default value.

**clone()**

Will return a new cloned instance of `RestOptions` .

**merge(options: `IRequestOptions`)**

Override with *options* using the `merge` strategy.

**assign(options: `IRequestOptions`)**

Override with *options* using the `assign` strategy.

**createRestClient ()**

Will return a new `RestClient` based on the current options.

**setFactory (factoryClass: typeof `RestClient`)**

Supposing that you created a new Class, that extends the default RestClient (see [Advanced usage](#advanced-usage)), you can override the default factory class with this method.

Example:

```typescript
class MyRest extends RestClient { ... }

const rest = new RestOptions().setFactory(MyRest).createRestClient()
console.log(rest instanceof MyRest) // >> true
```

Note: Keep in mind that custom classes having extra/custom parameters are **not supported**, the only way to make it work is a class having the same RestClient's constructor.

#### Usage

```typescript
import { RestOptions } from "scarlett"

const builder = new RestOptions()
	.set("host", "https://example.com")
	.set("basePath", "/api")
	.set("responseType", "json")

const restClient = builder.createRestClient()
```

### RestError

This class extends the default JavaScript Error, it require a template on constructor to qualify a response body, usually provided by backend API's handled exceptions.

```typescript
const response = await restClient.get<any, IBackendError>("/status-code/412");
// intellisense here should work data prop:
const error = response.error?.data;

// ...or just import and create it manually
import { RestError } from "scarlett";
const err = new RestError<any, IBackendError>();
```

Properties:

**isRestError (boolean)**

Always true, it's a simple utility prop that can be usefull when using any kind of Two-Way Binding framework.

**request (IRequest)**

**response (IResponse`<TResponse, TError>`)**

Where `TError` will be the model type of error object.

**data (TError)**

The error object parsed from response body content.

**code (string | number)**

It can be the HTTPStatusCode or an internal identifier error string.

**Console Methods:**

Some methods overrides using error code as prefix for messages, example:

```typescript
errorInstance.consoleWarn("Test Message");
// -> [error code] Test Message
```

**consoleTable(...tabularData: any[])**

**consoleWarn(message: string)**

**consoleError(message: string)**

**Methods:**

**setRequest(request: IRequest)**

Set the `request` object for the current error instance.

**setResponse(response: IResponse)**

Set the `response` object for the current error instance.

**throwFilterMatch(filter: IResponseFilter) => boolean**

Check if `response` object match with the `filter` provided.

This method is used internally by `RestClient`.

## Testing

To develop or testing purposes:

1. `git clone [repo_url]`
2. `cd` to the root project folder (`package.json`)
3. `npm i` or `yarn` to install packages

To execute tests, just execute on project root:

`npm run test` or `yarn run test`

## Inspired by...

* [axios](https://github.com/axios/axios)
* DotNet Core's [HttpClientFactory](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests#typed-clients)

## Why this name?

Maybe I'm a huge fan of that beautiful American actress...
