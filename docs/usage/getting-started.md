## Installation

`npm i scarlett`

or

`yarn add scarlett`

## Basic Usage

Using Functional API:

```typescript
import createRestClient from `scarlett`

const useRestClient = createRestClient({
	host: `https://server.com`,
	responseType: `text`
})
const { get } = useRestClient()
const response = await get<string>(`path`)
console.log(response.data) // << string or undefined
```

Using Class API:

```typescript
import RestClient from `scarlett`

const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
const response = await client.get<string>(`path`)
console.log(response.data) // << string or undefined
```

For more details about the usage of both APIs, just visit:
* [Class API](/usage/class)
* [Functional API](/usage/functional)

## Required Polyfills

As `tsconfig.json`, sources are compiled to`ES2021`, keep in mind that **polyfills are not included**.

Scarlett will require the following APIs:

* [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
* [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
* [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers)
* [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
* [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

## Different builds

In the `lib/` folder of the package you will find different build files, choose the right one to include in your project:

| Format                    | Filename              |
| ------------------------- | --------------------- |
| **ES Module** *(default)* | `index.js`            |
| **UMD**                   | `index.umd.js`        |
| **CommonJs**              | `index.common.js`     |
| **CommonJs ES3**          | `index.es3.common.js` |
| **CommonJs ES6**          | `index.es6.common.js` |
