# Functional API Usage

1. Import the library:

	```typescript
	import { createRestClient } from `scarlett`
	```

1. Create a base rest client initiator:

	```typescript
	const useRestClient = createRestClient({
		host: `https://server.com`,
		responseType: `text`
	} /* >> IRequestOptions  */)
	```

1. Use the initiator and rest methods, with destructuring object:

	```typescript
	const { get } = useRest()
	await get<string>(`path`)
	```

Every request method will return a `Promise<IResponse<TResponse>>`.

You can even provide a type for the response's error:
```typescript
type ApiError = { code: string, message: string }
const response = await get<string, ApiError>("/status-code/412");
const data = response.data;         // << response.data property will be null because of the error
const error = response.error?.data; // << error.data property will infer ApiError interface
```

## Initiator and custom options

You can structure a custom initiator with options:

```typescript
const useRest =  createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
type Customs = { host: string, path: string }
export default function useCustomRestClient(opts: Customs) {
	const rest = useRest();

	// use the setOption api to handle custom options
	rest.setOption("host", opts.host);
	rest.setOption("path", opts.path);

	// return the initiator
	return rest;
}
```

## Expose just your logics

Structuring a custom initiator can come in handy when you want to hide the scarlett's internal methods and exposing just your own functions:

```typescript
// custom-rest.ts
const useRest =  createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
export default function useCustomRestClient(opts: any) {
	const { getOption, cacheClear, get } = useRest();

	// return just what you want to expose
	return {
		getOption,
		cacheClear,
		getItemsList() {
			return get<string[]>("/items");
		},
		getItem(id: string) {
			return get<string[]>(`/items/${id}`);
		}
	};
}
```

...later in tour project:

```typescript
// example.ts
import useCustomRestClient from "custom-rest.ts"

const { getItemsList } = useCustomRestClient(...)
const { data } = await getItemsList();
```

## Rest Client Builder function

In very complex scenarios, you can build different rest clients using the `useRestClientBuilder()` API method:

```typescript
const builder = useRestClientBuilder({
	host: testServer,
	responseType: "json",
	throw: true
});
builder.setOption("headers", new Headers({ "x-restoptions": "1" }));
const useRest = builder.createRestClient();

const options = builder.cloneOptions(); // Get a cloned version of current options object
options.throw = false;
const builderNoThrow = useRestClientBuilder(options);

```

## In-Memory Cache System

If the standard cache options aren't enough, you can go for an internal in-memory, high performance cache system:

```typescript
const useRestClient = createRestClient({
	cacheInMemory: true, // << activate it!
});
```

You can even chose a custom cacheKey for a dedicated/custom rest method:

```typescript
const { get } = useRestClient();
const cacheKey = "a_special_key_for_this_method";
get(`/action2`, { cacheKey });
```

Check out the in-memory section for more details about the cache system.