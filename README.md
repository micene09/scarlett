<!-- omit in toc -->
## SCARLETT

> Strongly Typed Rest Client library based on Fetch API.

<!-- omit in toc -->
## Summary
- [Installation](#installation)
	- [Required Polyfills](#required-polyfills)
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

## Installation

`npm i scarlett`

or

`yarn add scarlett`

### Required Polyfills

As `tsconfig.json`, sources are compiled compiles to: `ES2019`.

Scarlett is using the following Standard API:

 * [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
 * [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

## Basic Usage

1. Import the library:
```typescript
import RestClient from `scarlett`
```
2. Create a rest client instance providing an object of interface: `IRequestOptions`.
```typescript
const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
} /* >> IRequestOptions  */)
const response = await client.get<string>(`path`)
```

Every request method will return a `Promise<IResponse<T>>`.

See the `tests/features.test.ts` to have a complete view on available features.

## RestClient

### Instance Options

To create a new rest client instance, you need to use the `IRequestOptions` interface.

At every request, you can override any property provided via constructor.

**host (string)**

Defaults to localhost.href .

**basePath (string)**

The base path to use on every request, defaults to `/`.

**responseType (HttpResponseFormat)**

One of the following: `json` (default), `text`, `blob`, `arrayBuffer`, `formData`.

This property will translate the response body, using the proper type, so you don't need (for example) to do JSON.parse(*response-body*).

**body**

Optional request body content, aving one of the following instances: `ArrayBuffer`, `ArrayBufferView`, `Blob`, `File`, `string`, `URLSearchParams`, `FormData`, or just a key-value pair object (`{ [key: string]: any }`).

If the method is `GET`, this value will be set to undefined.

**cacheKey (string)**

An optional alias reference to the current request, *required if you are using useCache* parameter as true.

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

See `tests/features.test.ts`.

**queryParamsIncludeEmpty (boolean)**

If true, it will include falsy values as empty, example:
```
/example/?a&b
```
Defaults to false.

**useCache (boolean)**

If true, it will enable an internal, [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based, cache system.

Every entry for this cache, will use a compound-key containing the *serviceKey* provided.

**throw (boolean)**

Defaults to false.

As standard behaviour of fetch, every request will never throw error. But sometimes, in very large applications, you need a centralized API error handler.

If true, when the standard [fetch -> Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is false the API will throw a global error.

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

See `tests/features.test.ts`.


<!-- omit in toc -->
### request`<T>`()

*Parameters*:
 * HttpMethod (`GET` | `DELETE` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH` | `LINK`)
 * path *(string)*, this will be appended to *host* and *basePath* option
 * requestOptions *(IRequestOptions | undefined)*, local request options that will override the global options provided via constructor.

*Returns* `Promise<IResponse<T>>`, where `T` is the `response.data` type (typescript intellisense).

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

**error ([RestError](#resterror)`<T>`)**

**status (HTTPStatusCode)**

**headers ([Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers))**

**data (T | null)**

Response body, leaded by `IRequestOptions.responseType` (for runtime type) and `T` (for Typescript intellisense).

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

The property `response.data` will infer the `IMyObject`;

**throwFilter (IResponseFilter`<T>`)**

When a `IResponseFilter` match the response, this property will expose it.

### Request (sent) Object

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
const err = new RestError<IBackendError>();
```

Preoperties:

**isRestError (boolean)**

Always true, it's a simple utility prop that can be used by every kind of Two-Way Binding framework.

**request (IRequest)**

**response (IResponse`<T>`)**

Where `T` will be the model type of response body.

**errorCode (string | number)**

It can be the HTTPStatusCode or an internal identifier error string.

**Console Methods:**

Some methods overrides using errorCode as prefix for messages, example:
```typescript
errorInstance.consoleWarn("Test Message");
// -> [errorCode] Test Message
```

**consoleTable(...tabularData: any[])**

**consoleWarn(message: string)**

**consoleError(message: string)**

**Methods:**

**setRequest(request: IRequest)**

Set the `request` object for the current error instance.

**setResponse(response: IResponse`<T>`)**

Set the `response` object for the current error instance.

**throwFilterMatch(filter: IResponseFilter`<T>`) => boolean**

Check if `response` object match with the `filter` provided.

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

You can even import types exported from the module itself:

```typescript
import RestClient, { IRequestOptions } from `scarlett`

class MyRestFactory2 extends RestClient {
	constructor(options: IRequestOptions) {
		options.host = "https://mybackend.com";
		options.basePath = "/my-controller";
		options.throw = true;
		super(options);
	}
	...
}
```

### Importing extras

```typescript
import {
	RestError, // Rest error utility class

	// Custom types:
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