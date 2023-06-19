# Class API

## RestClient

To create a new instance, you need to provide an options object as first parameter:

```typescript
const client = new RestClient({
	host: "https://server.com",
	responseType: "text"
})
```

Any provided option will be considered the default for every subsequent request of the new instance.

Every option will be accessible/updatable using the public **options** property, an instance of [RestClientBuilder](#RestClientBuilder) class.

You can also override an options object as last parameter to the request method:

```typescript
const response = await client.get<any>("/controller", { responseType: "json" })
```

In the example above, the `responseType` option will be the override value just for that request, the global options will remain the same.

For more details about the options object, visit the [Rest Client Options](/api/rest-client-options) section.

### request()

`<TResponse, TError>(method: HttpMethod, path?: string, requestOptions?: Partial<Options>): Promise<IResponse<TResponse, TError>>`

*Parameters*:
* HttpMethod (`GET` | `DELETE` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH` | `LINK`)
* path *(string)*, the request path relative to `host`+`basePath`
* requestOptions *(Options | undefined)*, local request options that will override the global options provided via constructor.

*Returns* `Promise<IResponse<TResponse, TError>>`, where:
 * `TResponse` is the `response.data` type (typescript intellisense)
 * `TError` is the **optional** `response.error.data` type

```typescript
const client = new RestClient({
	host: "https://server.com",
	basePath: "/controller",
	responseType: "text"
})
const response = await client.request<string>("GET", "/action");
```

Note that the `path` property will be combined with `host` and `basePath`:

```typescript
const response = await client.request<string>("GET", "/action");
console.log(response.request.url.href);
```

### HttpMethod shortcut methods

Every RestClient instance has all the http methods as a lower case named method as shortcut:

* *get`<T>`()*
* *post`<T>`()*
* *put`<T>`()*
* etc...

...having the following, simplified, parameters:

* path *(string)*
* requestOptions *(Options | undefined)

Example:

```typescript
const response = await client.get<string>("/action");
```

Note: every shortcut method will internally call the `request()` method.

### optionsOverride

```typescript
(overrides?: Partial<IRestOptions<TResponse, TError>>, base?: Partial<IRestOptions<TResponse, TError>>) => Partial<IRestOptions<TResponse, TError>>
```
Provide a copy of the options object updated using the `overrideStrategy` option.

The optional `base` parameter defaults to the current rest client options object.

## RestClientBuilder

Every instance of `RestClient` will have a public property named **options**, this is just an instance of `RestClientBuilder`.

You can access and modify the global options of your rest client instance using his methods.

To create a new instance, just pass an options object (optional) as first parameter:

```typescript
import { RestClientBuilder } from "scarlett"

const opts = new RestClientBuilder({
	host: "https://server.com",
	basePath: "/controller",
	responseType: "json"
})
```

Here is the full list of available instance's methods:

### current

`() => Partial<Options>`

Will return a copy of the current options object.

### get

`(key: K) => value`

Will return a copy of the option's value.

### set

`(key: K, val: value) => void`

To directly update an option (your TypeScript's IDE plugin will warn you about type issues).

### unset

`(key: K) => void`

Will internally restore the default value.

### clone

`() => RestClientBuilder`

Will return a new cloned instance of `RestClientBuilder` .

### merge

`(options?: Partial<IRestOptions<TResponse, TError>>) => void`

Override with *options* using the `merge` strategy.

### assign

`(options?: Partial<IRestOptions<TResponse, TError>>) => void`

Override with *options* using the `assign` strategy.

### createRestClient

`(..params: any[]) => RestClient`

Will return a new `RestClient` based on the current options, using the params from your factory class.

### setFactory

`(factoryClass: RestClient)`

Supposing that you created a new Class that extends the default RestClient (see [Advanced usage](#advanced-usage)), you can override the default factory class with this method.

Example:

```typescript
class MyRest extends RestClient { ... }

const rest = new RestClientBuilder().setFactory(MyRest).createRestClient()
console.log(rest instanceof MyRest) // >> true
```

Custom classes having extra/custom parameters are supported.

**Usage:**

```typescript
import { RestClientBuilder } from "scarlett"

const builder = new RestClientBuilder()
	.set("host", "https://example.com")
	.set("basePath", "/api")
	.set("responseType", "json")

const restClient = builder.createRestClient()
```