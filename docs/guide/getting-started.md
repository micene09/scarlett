# Getting Started

## Use in your project

Install Scarlett as a dependency using npm
```bash
npm i scarlett
```

or if you're using Yarn
```bash
yarn add scarlett
```

## Use from CDN
You can use Scarlett from a CDN using a script tag:
```html
<script src="https://unpkg.com/scarlett@2/lib/index.js"></script>

```
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
	See the full [Functional API Usage](/guide/functional) guide.

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
	See the full [Class API Usage](/guide/class) guide.

For more details about th API styles topic, just visit the [API Styles](/api/styles) section.
