<!-- omit in toc -->
## SCARLETT

> A strongly typed, Typescript powered, rest client library based on Fetch API.

<!-- omit in toc -->
## Key features

* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) based rest client
* Class based
* Strongly-typed (...thank you Typescript)
* Centralized config (via constructor)...with optional local overrides on http methods
* Response body auto-translation, based on fetch's [Body](https://developer.mozilla.org/en-US/docs/Web/API/Body)
* Built-in cache
* Query-string generator utilities
* Optional Error object's intellisense
* Optional throw errors on request failures
* Optional catch/filter to handle expected errors even when throw error is enabled
* Support for timeout
* Easy request repeater

<!-- omit in toc -->
## Summary

- [Installation](#installation)
	- [Required Polyfills](#required-polyfills)
	- [Different builds](#different-builds)
- [Basic Usage](#basic-usage)
- [RestClient](#restclient)
	- [Instance Options](#instance-options)
	- [Response Object](#response-object)
	- [Request (sent) Object](#request-sent-object)
- [RestError](#resterror)
- [Advanced usage](#advanced-usage)
	- [Extending](#extending)
	- [Importing extras](#importing-extras)
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

Every request method will return a `Promise<IResponse<T>>`.

See the `tests/features.test.ts` to see it in action!

## RestClient

### Instance Options

To create a new rest client instance, you need to use the `IRequestOptions` interface.

You can override any property provided at every request method:

```typescript
const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
const response = await client.get<any>(`/my-json-path`, { responseType: `json` })
```

Here is the list of properties:

**host (string)**

Defaults to localhost.href .

**basePath (string)**

The base path to use on every request, defaults to `/`.

**responseType (HttpResponseFormat)**

One of the following: `json` (default), `text`, `blob`, `arrayBuffer`, `formData`.

This property will translate the response body, using the proper type. For example, when you set `json` as responseType you don't need to `JSON.parse(response.data)`.

**body**

Optional request body content, aving one of the following instances: `ArrayBuffer`, `ArrayBufferView`, `Blob`, `File`, `string`, `URLSearchParams`, `FormData`, or just a key-value pair object (`{ [key: string]: any }`).

If the method is `GET`, this value will be set to undefined.

**abortController ([AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController))**

Optional abort controller to perform a fetch abort.

**headers ([Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers))**

Optional Headers object.

**query (`{ [key: string]: any }`)**

Optional key-value pair, this will be converted (and appended) to the request URI.

The value should be a `string`, otherwise use `queryParamsTransformer` callback.

**queryParamsTransormer (IQueryParamTransformer)**

A callback having the following definition:

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

**useCache (boolean)**

If true, it will enable an internal, [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based, cache system.

Every entry for this cache, will use a compound-key containing the *cacheKey*, if provided.

**cacheKey (string)**

An optional alias reference to the current request, *usefull if you are using useCache* parameter as true.

**throw (boolean)**

Defaults to false.

As standard behaviour of fetch, every request will never throw error. But sometimes, in very large applications, you need a centralized API error handler.

If true, when the standard [fetch -> Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is false the API will throw an error.

The error object will be an instance of `RestError` class.

**throwExcluding (IResponseFilter[])**

Even when you throwing error on failed requests, sometime you may need to filter this errors.

You can do this providing an array of `IResponseFilter`:

```typescript
interface IResponseFilter {
	path?: string;
	method?: HttpMethod;
	statusCode?: HTTPStatusCode;
	cback?: {
		(error: RestError): void
	};
}
```

If a failed request match one of the objects provided, the API will not throw.

Setting throwExcluding will also set `throw` option to `true`.

Have a look at `tests/features.test.ts` to see it in action!

<!-- omit in toc -->
### request`<TResponse, TError = any>`()

*Parameters*:

* HttpMethod (`GET` | `DELETE` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH` | `LINK`)
* path *(string)*, this will be appended to *host* and *basePath* option
* requestOptions *(IRequestOptions | undefined)*, local request options that will override the global options provided via constructor.

*Returns* `Promise<IResponse<TResponse, TError>>`, where:
 * `TResponse` is the `response.data` type (typescript intellisense)
 * `TError` is the **optional** `error.response.data` type

*Usage*:

```typescript
const client = new RestClient({
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `text`
})
const response = await client.request<string>(`GET`, `/action`);
console.log(response.request.url.href); // -> "https://server.com/controller/action"
console.log(response.data); // -> "sample text"
```

*Usage with error type*:

```typescript
const response = await client.request<string, IBackendError>(`GET`, `/action-with-error`);
const error = response.error;
console.log(error.response?.data?); // -> your error object, with intellisense on your editor
```

<!-- omit in toc -->
### HttpMethod shortcut methods

For every HttpMethod string type, there will be a lower case version as method:

* *get`<T>`()*
* *post`<T>`()*
* *put`<T>`()*
* etc...

...having the following, simplified, parameters:

* path *(string)*
* requestOptions *(IRequestOptions | undefined)*

Every shortcut method will internally call `request()` itself.
Usage:

```typescript
const client = new RestClient({
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `text`
})
const response = await client.get<string>(`/action`);
console.log(response.request.url.href); // -> "https://server.com/controller/action"
```

### Response Object

Properties:

**fetchResponse ([Response](https://developer.mozilla.org/en-US/docs/Web/API/Response))**

**request ([Request (sent) Object](#request-sent-object))**

**error ([RestError](#resterror)`<TError>`)**

**status (HTTPStatusCode)**

**headers ([Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers))**

**data (TResponse | null)**

The response body, leaded by `IRequestOptions.responseType` (for runtime type) and `TResponse` (for Typescript intellisense).

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

### Request (sent) Object

This simple interface is used to qualify the Response Object, here you will find details about the request executed to get the response.

**options (IRequestOptions)**

Options used on request.

**url ([URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL))**

The URL instance evaluated using `host`, `basePath` and `path`.

**method (HttpMethod)**

HttpMethod used on request.

**body (any | undefined)**

The optional body used, tipically when HttpMethod is `PUT` or `POST`.

## RestError

This class extends the default Javascript Error, it require a template on constructor to qualify a response body, usually provided by backend API's handled exceptions.

```typescript
const response = await restClient.get<any, IBackendError>("/status-code/412");
// intellisense here should work data prop:
const error = response.error?.data;

// ...or just import and create it manually
import { RestError } from "scarlett";
const err = new RestError<IBackendError>();
```

Preoperties:

**isRestError (boolean)**

Always true, it's a simple utility prop that can be used by every kind of Two-Way Binding framework.

**request (IRequest)**

**response (IResponse`<TError>`)**

Where `TError` will be the model type of response body.

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

	// Utility types:
	HttpMethod,
	HTTPStatusCode,

	// Extra/Internal interfaces
	IRequestOptions,
	IRequestQueryOptions,
	IResponse,
	IRequest,
	IResponseFilter
} from `scarlett`;
```

## Testing

To develop or testing purposes:

1. `git clone [repo_url]`
2. `cd` to the root project folder (`package.json`)
3. `npm i` or `yarn` to install packages

To execute tests, just execute on project root:

`npm run test` or `npm run test`

## Inspired by...

* [axios](https://github.com/axios/axios)
* DotNet Core's [HttpClientFactory](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests#typed-clients)

## Why this name?

Maybe I'm a huge fan of that beautiful American actress...
