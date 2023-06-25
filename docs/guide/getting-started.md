# Getting Started

## Installation

Install it using `npm i scarlett` or `yarn add scarlett`.

## Import

Supposing that you are working on a modern Javascript project, here is an example using ESM Module:
```typescript
import { createRestClient } from "scarlett"

```

For more details about supported platforms, please visit the [Support](/guide/support) section.

## Usage

This library comes with different class styles, here are some examples:

* Using Functional API
	```typescript
	import { createRestClient } from `scarlett`

	const useRestClient = createRestClient({
		host: `https://server.com`,
		responseType: `text`
	})
	const { get } = useRestClient()
	const { data, status } = await get<string>(`path`)
	console.log(data) // << string or undefined
	console.log(status)
	```
* Using Class API:
	```typescript
	import { RestClient } from `scarlett`

	const client = new RestClient({
		host: `https://server.com`,
		responseType: `text`
	})
	const response = await client.get<string>(`path`)
	console.log(response.data) // << string or undefined
	```

For more details about th API styles topic, just visit the [API Styles](/api/styles) section.
