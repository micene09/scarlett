# Getting Started

Install it using `npm i scarlett` or `yarn add scarlett`

Supposing that you are working on a modern Javascript project, here is an example of import using the ESM Module:
```typescript
import { createRestClient } from "scarlett"
```

Depending on your project's setup or the bundler you are using, the import strategy could vary, for this reason the package provides different builds.

## Different builds

Once installed, the package includes different modules to ensure the best compatibility to your module bundler/importer, you need to choose the right one depending on your project setup.

Keep in mind that the default one is the most modern: ES Module.

Here is the list of modules included:

| Format                    | Filename                  |
|---------------------------|---------------------------|
| **ES Module** *(default)* | `lib/index.js`            |
| **UMD**                   | `lib/index.umd.js`        |
| **CommonJs**              | `lib/index.common.js`     |
| **CommonJs ES3**          | `lib/index.es3.common.js` |
| **CommonJs ES6**          | `lib/index.es6.common.js` |


Sources are compiled to`ES2021` for every module format, keep in mind that **polyfills are not included**.

### Runtime required polyfills

* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
* [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
* [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)
* [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
* [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)


## Basic Usage

Using Functional API:

```typescript
import { createRestClient } from `scarlett`

const useRestClient = createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
const { get } = useRestClient()
const { data, statusCode } = await get<string>(`path`)
console.log(data) // << string or undefined
console.log(statusCode)
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
