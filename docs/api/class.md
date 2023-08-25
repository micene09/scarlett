# Class API

## constructor

```ts
constructor(options: Options)
```

For more details about the options object, visit the [Request Options](/api/request-options) section.

## request

```ts
<TResponse, TError>(method: HttpMethod, path?: string, requestOptions?: Partial<Options>) => Promise<IResponse<TResponse, TError>>
```

#### Parameters

* method (`GET` | `DELETE` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH` | `LINK`)
* path *(string)*, the request path relative to `host`+`basePath`
* requestOptions *(Options | undefined)*, local request options that will override the global options provided via `createRestClient`.

#### Returns

```ts
<TResponse, TError>(...) => Promise<IResponse<TResponse, TError>>
```

 * `TResponse` is the `response.data` type inference
 * `TError` is the **optional** `response.error.data` type inference

For more details about the response object, visit the [Response Object](/api/response-object) section.

## get / del / post / patch / put

```ts
<TResponse, TError>(path?: string, requestOptions?: Partial<Options>) => Promise<IResponse<TResponse, TError>>
```

Like the previous `request` method but without the need to specify the HTTP Method (implicit), Local Layer options (`requestOptions` parameter) that will override the Global Layer options provided via `constructor`.

:::info
Every shortcut method will internally call the `request` method.
:::

## optionsOverride

```ts
(overrides?: Partial<Options>, base?: Partial<Options>) => Partial<Options>
```
Provide a copy of the options object updated using the `overrideStrategy` option.

The optional `base` parameter defaults to the current rest client options object.

## cache methods

On a `RestClient` class instance, you will find every cache capability available as public method, for more details visit the [Cache System](/api/in-memory-cache) section.

## options

```ts
type options = RestClientBuilder
```


Every instance of `RestClient` will have a public property named **options**, this is just an instance of `RestClientBuilder`.

You can access and modify the global options of your rest client instance using his methods.

To create a new instance, just pass an options object (optional) as first parameter:

```ts
import { RestClientBuilder } from "scarlett"

const opts = new RestClientBuilder({
	host: "https://server.com",
	basePath: "/controller",
	responseType: "json"
})
```

Keep reading to see the full list of available instance's methods.

## options.current

```ts
() => Partial<Options>
```

Will return a copy of the current options object.

## options.get

```ts
(key: K) => value
```

Will return a copy of the option's value.

## options.set

```ts
(key: K, val: value) => void
```

To directly update an option (your TypeScript's IDE plugin will warn you about type issues).

## options.unset

```ts
(key: K) => void
```

Will internally restore the default value.

## options.clone

```ts
() => RestClientBuilder
```

Will return a new cloned instance of `RestClientBuilder`.

## options.merge

```ts
(options: Partial<Options>) => void
```

Overrides current options with the provided `options` using a merge strategy.

## options.assign

```ts
(options: Partial<Options>) => void
```

Overrides current options with the provided `options` using a [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) strategy.

## options.createRestClient

```ts
(..params: any[]) => RestClient
```

Will return a new `RestClient` based on the current options, using the params from your factory class.

## options.setFactory

```ts
(factoryClass: RestClient)
```

Supposing that you created a new Class that extends the default RestClient (see [Advanced usage](#advanced-usage)), you can override the default factory class with this method.

Example:

```ts
class MyRest extends RestClient { ... }

const rest = new RestClientBuilder().setFactory(MyRest).createRestClient()
console.log(rest instanceof MyRest) // >> true
```

Custom classes having extra/custom parameters are supported.

**Usage:**

```ts
import { RestClientBuilder } from "scarlett"

const builder = new RestClientBuilder()
	.set("host", "https://example.com")
	.set("basePath", "/api")
	.set("responseType", "json")

const restClient = builder.createRestClient()
```