
# Response Object

Once that rest client was defined, you can proceed to execute your REST calls, the response object obtained aims to cover every details needed by a complex application.

```typescript
const response = await client.get<any>("/controller", { responseType: "json" })
```

In this section you will read about

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

`RestError`

## status

`HTTPStatusCode`

## headers

[Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)

## data

`TResponse` | `null`


The response body, leaded by `IRequestOptions.responseType` (runtime type) and `TResponse` (IDE type checking).

Example:

```typescript
interface IMyObject {
	test: string
}
const client = new RestClient({
	host: "https://server.com",
	basePath: "/controller",
	responseType: "json"
})
const response = await client.get<IMyObject>("/action");
```

The property `response.data` will infer the `IMyObject` interface.

## throwFilter

`IResponseFilter`

When a `IResponseFilter` matches the response, this property will expose it.

## repeat

`(): Promise<IResponse<TResponse, TError>>`

A useful shortcut to repeat the request sent, having the following interface:

```typescript
export interface IRepeat<TResponse, TError = any> {
	(method?: HttpMethod, requestOptions?: IRequestOptions): Promise<IResponse<TResponse, TError>>
}
export interface IRepeat<TResponse, TError = any> {
	(requestOptions?: IRequestOptions): Promise<IResponse<TResponse, TError>>
}
```

Every parameter is optional and you can override every option as usual.

*Usage*
```typescript
const first = await restClient.get<any>("/action");
const second = await first.repeat();
```

## request

The request object used to get the response, including options, url, method and body.

**url**

The [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) instance evaluated using `host`, `basePath` and the request `path`.

## method

`HttpMethod`

**body**

The optional body used, typically when HttpMethod is `PUT` or `POST`.
