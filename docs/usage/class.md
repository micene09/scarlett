# Basic Usage

1. Import the library:

	```typescript
	import RestClient from `scarlett`
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

# Advanced usage

## Extending

You can extend the base class for your specific needs as follows:

```typescript
import RestClient from `scarlett`

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
import RestClient, { IRequestOptions } from `scarlett`

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

## RestOptions as rest client builder

```typescript
import { IRequestOptions } from `scarlett`

const builder = new RestOptions()
	.set("host", "https://localhost:5000")
	.set("basePath", "/api")
	.set("responseType", "json");

const rest1 = builder.createRestClient();

builder.clone().set("basePath", "/api-custom");
const rest2 = builder.createRestClient();
```

## In-Memory Cache System

```typescript
import RestClient from `scarlett`

class AdvanceCache extends RestClient {
	constructor() {
		super({
			host: "https://mybackend.com",
			basePath: "/my-controller",
			cacheInMemory: true,
			cacheKey: "my_key_all_requests"
		});
	}
	async genericCall() {
		return this.get(`/action1`);
	}
	async theCall() {
		const cacheKey = "a_special_key_for_this_method";
		return this.get(`/action2`, { cacheKey });
	}
}
```