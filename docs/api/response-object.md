
# Response Object

Once that rest client was defined, you can proceed to execute your REST calls, the response object obtained aims to cover every details needed by a complex application.

The return type of every REST method is basically a `Promise`, wrapping `IResponse<TResponse, TError>`, where:
 * `TResponse`, will infer the `response.data` type
 * `TError` (optional), will infer the `response.error.data` type

To start the inference just use Typescript Generics on the REST method:
```typescript
const response = await client.get<MyObject, MyError>("/path")
```
...then you will have type inference on the following scenarios:
 * `response.data` typed as `MyObject` on success, or `undefined` on failure
 * `response.error.data` typed as `MyError` on failure, or `undefined` on success

Keep reading to better understand every prop provided by the response object.

## fetchResponse

[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)

## request

The request object used to get the response, including options, url, method and body.

### url

`URL`

The [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) instance evaluated using host, basePath and the request path.

### method

`HttpMethod`

### body

The optional body used, typically when HttpMethod is PUT or POST.

## error

`RestError` | `undefined`

## status

`HTTPStatusCode`

## headers

`Headers`

An instance of the standard [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers) class, representing the response headers of the request.

## data

`TResponse` | `null`

## throwFilter

`IResponseFilter`

When a `IResponseFilter` matches the response, this property will expose it.

## repeat

`(): Promise<IResponse<TResponse, TError>>`

A shortcut to repeat the request sent with the same options.

```typescript
const first = await get<any>("/action");
const second = await first.repeat();
```

You can even override request options on a local repeat call.

```typescript
const response = await second.repeat({ responseType: "text" });
```

*Usage*

## request

The request object used to get the response, including options, url, method and body.

### url

`URL`

The [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) instance evaluated using `host`, `basePath` and the request `path`.

### method

`HttpMethod`

### body

`object` | `null`

The optional body used, typically when HttpMethod is `PUT` or `POST`.
