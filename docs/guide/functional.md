# Functional API Usage

The Functional API use this strategy to better handle types inference, basically consists on a method called `createRestClient` that acts as wrapper for the real `useRestClient` function, that finally expose everything you need to perform your request or modify behaviors of your rest client, keeping the strongly typed fashion and options isolation.

Create a base rest client using the initiator:

```typescript
const useRestClient = createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
```

:::tip
 The `useRestClient` function returns a destructible object, use this pattern to a more simple and readable code:
 ```ts
const { get } = useRestClient()
const { data, status } = await get<string>(`/my-controller`)
 ```
:::

Any provided option on `createRestClient` will be considered the default (Global Layer options) for every request function in `useRestClient()`, for more details about the options object, visit the [Request Options](/api/request-options) section.

To have a custom Local Layer options, you can provide your overrides as second parameter to the request method:

```typescript
const response = await get<string>("/example", { responseType: "json" })
```

In the example above, the `responseType` option will be the override value just for that request, the Global Layer options will remain the same.

Every request method will return a `Promise<IResponse<TResponse>>`, for more details about the response object, visit the [Response Object](/api/response-object) section.

## Expose just your logics

Structuring a custom initiator can come in handy when you want to hide the Scarlett's internal methods and exposing just your own functions:

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

...later in your project:

```typescript
// example.ts
import useCustomRestClient from "custom-rest.ts"

const { getItemsList } = useCustomRestClient(...)
const { data } = await getItemsList();
```

## Initiator and custom parameters

You can structure a custom initiator with custom parameters:

```typescript
export default function createMyRestClient(token: string) {
	const useMyRest = createRestClient({
		host: `https://server.com`,
		responseType: `text`
	})
	// ...your logic with custom parameter(s)
	return useMyRest;
}
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