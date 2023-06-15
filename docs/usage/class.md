# Class API Usage

1. Import the library:

	```typescript
	import { RestClient } from `scarlett`
	```

2. Create a rest client in stance providing an object of interface `IRequestOptions`.

	```typescript
	const client = new RestClient({
		host: `https://server.com`,
		responseType: `text`
	} /* >> IRequestOptions  */)
	const response = await client.get<string>(`path`)
	```

Every request method will return a `Promise<IResponse<TResponse>>`.

## Extending

You can extend the base class for your specific needs as follows:

```typescript
import { RestClient } from `scarlett`

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

You can even import types/interfaces exported from the module itself:

```typescript
import { RestClient, IRequestOptions } from `scarlett`

class MyRestFactory2 extends RestClient {
	constructor(options: IRequestOptions) {
		options.host = "https://mybackend.com";
		options.basePath = "/my-controller";
		options.throw = true;
		super(options);
	}
	// your methods here...
}
```

## RestClientBuilder

In very complex scenarios, you can build different rest clients using the `RestClientBuilder` API:

```typescript
import { RestClientBuilder, IRequestOptions } from `scarlett`

const builder = new RestClientBuilder()
	.set("host", "https://localhost:5000")
	.set("basePath", "/api")
	.set("responseType", "json");

const rest1 = builder.createRestClient();

const builder2 = builder.clone().set("basePath", "/api-custom");
const rest2 = builder2.createRestClient();
```

## In-Memory Cache System

If the standard cache options aren't enough, you can go for an internal in-memory, high performance cache system:

```typescript
import { RestClient } from `scarlett`

const rest = new RestClient({
	cacheInMemory: true, // << activate it!
});
```

You can even chose a custom cacheKey for a dedicated/custom rest method:

```typescript
const cacheKey = "a_special_key_for_this_method";
rest.get(`/action2`, { cacheKey });
```

Check out the in-memory section for more details about the cache system.