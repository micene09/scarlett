# Getting Started

Install it using `npm i scarlett` or `yarn add scarlett`

Supposing that you are working on a modern Javascript project, here is an example of import using the ESM Module:
```typescript
import { createRestClient } from "scarlett"
```

Depending on your project's setup or the bundler you are using, the import strategy could vary, for this reason the package provides different builds.

## Different builds

Once installed, the package includes different modules to ensure the best compatibility to your module bundler/importer, you need to choose the right one depending on your project setup.

Here is the list of modules included:

| Format                    | Filename                  |
|---------------------------|---------------------------|
| **ES Module** *(default)* | `lib/index.js`            |
| **UMD**                   | `lib/index.umd.js`        |
| **CommonJs**              | `lib/index.common.js`     |
| **CommonJs ES3**          | `lib/index.es3.common.js` |
| **CommonJs ES6**          | `lib/index.es6.common.js` |

For more details about supported browsers and platform, please visit the [Support](/guide/support) section.

## Basic Usage

Using Functional API:

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

Using Class API:

```typescript
import { RestClient } from `scarlett`

const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
const response = await client.get<string>(`path`)
console.log(response.data) // << string or undefined
```

For more details about the usage of both styles, just visit the [API](/api) section.
