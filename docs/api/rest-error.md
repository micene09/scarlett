# Rest Error

Independently of the chosen API Style, probably you will have to deal with errors, to provide an efficient way to track errors, in Scarlett you will find a utility class named `RestError` that extends the default JavaScript's `Error`.

It is used internally to track and better qualify the error thrown.

Sometimes, a success response body differs from error response body, for this reason you can specify generic types qualify the response provided by backend API's handled exceptions:

```ts
const response = await rest.get<any, IBackendError>("/status-code/412");
const data = response.data;         // << response.data property inferred as null because of the error
const error = response.error?.data; // << error.data property inferred as IBackendError
```

When a request's response has an error, you will find an instance of `RestError` as a property named **error** on `IResponse` object. If the `throw` flag is enabled, or the `throwExcluding` fails to filter an error, the library will internally `throw` it.

:::tip
You can even import it and create an instance to extend your business logic:

```ts
import { RestError } from "scarlett";
const err = new RestError<IBackendError>("The Error Message");
```
:::

## constructor

```ts
(message: string, statusCode?: HTTPStatusCode, code?: InternalErrorCode)
```

### message

```ts
type message = string
```

A human-friendly error message.

### statusCode

```ts
enum HTTPStatusCode {}
```

An enum containing all the standard http status codes.

::: tip
 You can import this enum from Scarlett and use it in your app:
 ```ts
 import { HTTPStatusCode } from "scarlett"
 ```
:::

### code

```ts
type InternalErrorCode = "Timeout" | "BodyParse" | "UrlParameter";
```

An internal error code to track unexpected behaviors based on request settings.

::: info
 Any of these parameters are available as public properties on `RestError` instance.
:::

## isRestError

An always `true` property, used as simple utility to distinguish the standard `Error` from the `RestError`.

## request

The request object use to perform the request, it is just the same [type defined on the response object](/api/response-object.html#request).

## fetchResponse

Instance of type [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), the native response object from the Fetch API.

## data

The error object parsed from response body content, inferred with the type provided as generic in the request method or when creating a new instance.
