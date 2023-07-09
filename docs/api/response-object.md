
# Response Object

Once that rest client was defined, you can proceed to execute your REST calls, the response object obtained aims to cover every details needed by a complex application.

The return type of every REST method is basically a `Promise`, wrapping `IResponse<TResponse, TError>`, where:
 * `TResponse`, will infer the `response.data` type
 * `TError` (optional), will infer the `response.error.data` type

To start the inference just use Typescript Generics on the REST method:
```ts
const response = await client.get<MyObject, MyError>("/path")
```
...then you will have type inference on the following scenarios:
 * `response.data` typed as `MyObject` on success, or `undefined` on failure
 * `response.error.data` typed as `MyError` on failure, or `undefined` on success

Keep reading to better understand every prop provided by the response object.

## fetchResponse

```ts
Response
```

Instance of type [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), the native response object from the Fetch API.

## request

```ts
interface IRequest {
	options: Partial<Options>;
	url: URL
	method: HttpMethod
	body: any
}
```

The request object used to get the response, including options, url, method and body.

### url

```ts
URL
```

The [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) instance evaluated using host, basePath and the request path.

### method

```ts
HttpMethod
```

### body

The optional body used, typically when HttpMethod is PUT or POST.

## error

```ts
RestError | undefined
```

An instance of type [RestError](/api/rest-error) if present, or `undefined` on successful requests.

## status

```ts
number
```

The HTTP Status code of the response.

## headers

```ts
Headers
```

An instance of type [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers) class, representing the response headers of the request.

## data

The parsed response object if present.

## throwFilter

```ts
throwExcluding // object or handler
```

When a provided throw filter (via [throwExcluding](/api/rest-client-options#throwexcluding)) matches, this property will expose it.

## repeat

```ts
() => Promise<IResponse>
```

A shortcut to repeat the request sent with the same options.

```ts
const first = await get<any>("/action");
const second = await first.repeat();
```

You can even override request options on a local repeat call.

```ts
const response = await second.repeat({ responseType: "text" });
```

## request

The request object used to get the response, including options, url, method and body.

### url

```ts
URL
```

The [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) instance evaluated using `host`, `basePath` and the request `path`.

### method

```ts
HttpMethod
```

The HTTP method used to perform the request.

### body

```ts
object | null
```

The optional body used, typically when HttpMethod is `PUT` or `POST`.
