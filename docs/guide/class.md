# Class API Usage

To create a new instance, you need to provide an options object as first parameter:

```typescript
const client = new RestClient({
	host: "https://server.com",
	responseType: "text"
})
```

Any provided option will be considered the default for every subsequent request of the new instance, for more details about the options object, visit the [Rest Client Options](/api/rest-client-options) section.

Every option will be accessible/updatable using the public **options** property, an instance of [RestClientBuilder](#RestClientBuilder) class.

You can also override an options object as last parameter to the request method:

```typescript
const response = await client.get<string>("/example", { responseType: "text" })
```

In the example above, the `responseType` option will be the override value just for that request, the global options will remain the same.

Every request method will return a `Promise<IResponse<TResponse>>`, for more details about the response object, visit the [Response Object](/api/response-object) section.

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