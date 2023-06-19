# Rest Error

Independently of the chosen API Style, probably you will have to deal with errors, to provide an efficient way to track errors, in Scarlett you will find a utility class named `RestError` that extends the default JavaScript's `Error`.

It is used internally to track and better qualify the error thrown.

Sometimes, a success response body differs from error response body, for this reason you can specify generic types qualify the response provided by backend API's handled exceptions:
```typescript
const response = await restClient.get<any, IBackendError>("/status-code/412");
const data = response.data;         // << response.data property will be null because of the error
const error = response.error?.data; // << error.data property will infer IBackendError interface
```

When a request's response has an error, you will find an instance of `RestError` as a property named **error** on `IResponse` object. If the `throw` flag is enabled, or the `throwExcluding` fails to filter an error, the library will internally `throw` it.

You can event import it and create an instance to extend your business logic:
```typescript
import { RestError } from "scarlett";
const err = new RestError<IBackendError>("The Error Message");
```

## The constructor

```typescript
constructor(message: string, statusCode?: HTTPStatusCode, code?: InternalErrorCode)
```

### message

`string`

A human-friendly error message.

### statusCode

`HTTPStatusCode`

The standard http status code.

### code

```typescript
type InternalErrorCode = "Timeout" | "BodyParse" | "UrlParameter";
```

An internal error code to track unexpected behaviors based on request settings.

## Instance properties

### isRestError

`boolean`

Always true, it's a simple utility prop that can be useful to distinguish the standard `Error` from the `RestError`.

### request

`IRequest`

### fetchResponse

`[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)`

### code

The same on the constructor parameter.

### statusCode

`HTTPStatusCode`

### data

`TError`

The error object parsed from response body content.
